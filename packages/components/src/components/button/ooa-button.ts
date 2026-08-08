import { consume } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { defaultOoaConfig, ooaConfigContext, type OoaConfig, type OoaSize } from '../../config/context.js';
import { buttonStyles } from './style/index.js';
import {
  resolveColorVariant,
  isUnBorderedVariant,
  type ButtonColor,
  type ButtonHTMLType,
  type ButtonShape,
  type ButtonType,
  type ButtonVariant,
} from './button-helpers.js';

/** 解析 hex / rgb() / rgba() 为 RGB 分量；失败返回 null。 */
function parseRgb(input: string): { r: number; g: number; b: number } | null {
  const s = input.trim();
  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  return null;
}

/**
 * 对位 antd isBright 的不透明分支（color-picker/components/ColorPresets）：
 * Rec.601 加权亮度 > 192 → 亮底黑字 `#000`，否则白字 `#fff`。
 * 返回固定字面量、不随主题（antd solidTextColor 即固定字面量），避免 dark 模式浅底浅字。
 * 注：antd 另有 a<=0.5 半透明分支走 HSV 合成，真实 colorBgSolid token 不会命中，故省略。
 * `color-contrast()` 在所有浏览器未实现，故在 JS 侧计算。
 */
function solidTextColor(bgColor: string): string {
  const rgb = parseRgb(bgColor);
  if (!rgb) return '#fff';
  const brightness = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
  return brightness > 192 ? '#000' : '#fff';
}

@customElement('ooa-button')
export class OoaButton extends LitElement {
  @property({ reflect: true }) type: ButtonType | undefined = undefined;
  @property({ reflect: true }) color: ButtonColor | undefined = undefined;
  @property({ reflect: true }) variant: ButtonVariant | undefined = undefined;
  @property({ type: Boolean, reflect: true }) danger = false;
  @property({ type: Boolean, reflect: true }) ghost = false;
  @property({ type: Boolean, reflect: true }) block = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Number, attribute: 'loading-delay', reflect: true }) loadingDelay = 0;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true }) shape: ButtonShape | undefined = undefined;
  /** v6 用 medium；middle 为废弃别名（mergedSize 归一化）。 */
  @property({ reflect: true }) size: OoaSize | 'medium' | undefined = undefined;
  @property({ attribute: 'icon-placement', reflect: true }) iconPlacement: 'start' | 'end' = 'start';
  @property({ reflect: true }) href: string | undefined = undefined;
  @property({ reflect: true }) target: string | undefined = undefined;
  @property({ attribute: 'html-type', reflect: true }) htmlType: ButtonHTMLType = 'button';
  @property({ type: Boolean, attribute: 'auto-insert-space', reflect: true }) autoInsertSpace: boolean | undefined = undefined;
  @property({ type: Boolean, attribute: 'auto-focus', reflect: true }) autoFocus = false;

  @consume({ context: ooaConfigContext, subscribe: true })
  @property({ attribute: false })
  protected config: OoaConfig = defaultOoaConfig;

  static styles = buttonStyles;

  private get mergedShape(): ButtonShape { return this.shape ?? 'default'; }
  /** medium/middle 均视为 v6 medium（无类）；归一化避免类型发散。 */
  private get mergedSize(): OoaSize {
    const s = this.size ?? this.groupSize ?? this.config.componentSize;
    return s === 'medium' ? 'middle' : s;
  }

  /** Task 6 由 button-group 提供；本任务先置 undefined。 */
  protected groupSize: OoaSize | undefined = undefined;

  private get colorVariant() {
    return resolveColorVariant({
      type: this.type,
      color: this.color,
      variant: this.variant,
      danger: this.danger,
      ghost: this.ghost,
    });
  }

  /**
   * 把推导出的有效 color/variant 投影到宿主 `data-color`/`data-variant`（style/variant.ts
   * 用 :host([data-color=...]) 选择器声明双轴变量）。type 糖/ghost 降级只存在于推导结果里，
   * 必须落到宿主属性上选择器才命中。
   *
   * 注意：不能写回 `this.color`/`this.variant`（用户 props）——否则 `<ooa-button type="primary">`
   * 渲染后残留的 color+variant 会让后续 `setAttribute('type','text')` 因 `color && variant`
   * 优先分支而失效。dataset 只做 CSS 匹配，不参与 resolveColorVariant 输入。
   *
   * 同时在首帧样式计算前就投影 solid 文字对比色：若在 updated() 里才设，会因
   * `transition: color` 出现 深→白 的过渡，getComputedStyle 读到过渡中间值。
   */
  override willUpdate(): void {
    const { color, variant } = this.colorVariant;
    if (this.dataset.color !== color) this.dataset.color = color;
    if (this.dataset.variant !== variant) this.dataset.variant = variant;
    // 仅 default/solid 消费 solid 文字对比色；其余组合跳过昂贵的 getComputedStyle。
    if (color === 'default' && variant === 'solid') {
      const bg = getComputedStyle(this).getPropertyValue('--ooa-color-bg-solid') || '#000';
      const textColor = solidTextColor(bg);
      if (this.style.getPropertyValue('--ooa-btn-solid-text-color') !== textColor) {
        this.style.setProperty('--ooa-btn-solid-text-color', textColor);
      }
    }
  }

  // >>> 类名拼装（对位 antd classes；类加在内部 button 上）
  private buildClasses(): string {
    const { color, variant } = this.colorVariant;
    const isDanger = color === 'danger';
    const mergedColorText = isDanger ? 'dangerous' : color;
    const unbordered = isUnBorderedVariant(variant);
    const size = this.mergedSize;
    return [
      'ooa-btn',
      this.mergedShape !== 'default' && this.mergedShape !== 'square' ? `ooa-btn-${this.mergedShape}` : '',
      `ooa-btn-color-${mergedColorText}`,
      `ooa-btn-variant-${variant}`,
      size === 'large' ? 'ooa-btn-lg' : '',
      size === 'small' ? 'ooa-btn-sm' : '',
      this.ghost && !unbordered ? 'ooa-btn-background-ghost' : '',
      this.danger ? 'ooa-btn-dangerous' : '',
      // Task 5 追加：-loading / -icon-only / -two-chinese-chars / -icon-end
    ].filter(Boolean).join(' ');
  }

  override render() {
    const classes = this.buildClasses();
    const content = html`<span part="content"><slot></slot></span>`;

    if (this.href !== undefined) {
      const disabled = this.disabled || this.config.disabled;
      return html`
        <a
          class=${classes}
          href=${disabled ? nothing : this.href}
          target=${this.target ?? nothing}
          ?aria-disabled=${disabled}
          tabindex=${disabled ? -1 : 0}
          @click=${this.handleClick}
        >${content}</a>`;
    }

    const disabled = this.disabled || this.config.disabled;
    return html`
      <button
        type=${this.htmlType}
        class=${classes}
        ?disabled=${disabled}
        @click=${this.handleClick}
      >${content}</button>`;
  }

  private handleClick(e: Event) {
    // 对位 antd handleClick：loading || disabled → preventDefault
    const disabled = this.disabled || this.config.disabled;
    if (this.loading || disabled) {
      e.preventDefault();
      return;
    }
  }
}
