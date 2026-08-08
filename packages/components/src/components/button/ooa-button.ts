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
 * 对位 antd isBright：按相对亮度（近似 Rec.601 加权）判断 `colorBgSolid` 深浅，
 * 深底返回浅色文字（colorTextLightSolid），亮底返回深色文字（colorText）。
 * `color-contrast()` 在所有浏览器未实现（Chromium 151 亦不支持），故在 JS 侧计算。
 */
function solidTextColor(bgColor: string): string {
  const rgb = parseRgb(bgColor);
  if (!rgb) return 'var(--ooa-color-text-light-solid, #fff)';
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness >= 128
    ? 'var(--ooa-color-text, rgba(0, 0, 0, 0.88))'
    : 'var(--ooa-color-text-light-solid, #fff)';
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
   * 把推导出的有效 color/variant 投影回宿主反射属性（对位 antd 在 button 元素上加
   * `-color-*` / `-variant-*` 类）。style/variant.ts 用 `:host([color="..."])` /
   * `:host([variant="..."])` 选择器声明双轴变量，type 语法糖/ghost 降级只存在于
   * 推导结果里，必须落到宿主属性上选择器才命中。值相等时不再触发重渲染（幂等）。
   *
   * 同时在首帧样式计算前就投影 solid 文字对比色：若在 updated() 里才设，会因
   * `transition: color` 出现 深→白 的过渡，getComputedStyle 读到过渡中间值。
   */
  override willUpdate(): void {
    const { color, variant } = this.colorVariant;
    if (this.color !== color) this.color = color;
    if (this.variant !== variant) this.variant = variant;
    // 对位 antd isBright：`color-contrast()` 所有浏览器未实现，改在 JS 侧计算。
    // 仅 `[color="default"][variant="solid"]` 消费该变量（inline 覆盖 token.ts 兜底）。
    const bg = getComputedStyle(this).getPropertyValue('--ooa-color-bg-solid') || '#000';
    const textColor = solidTextColor(bg);
    if (this.style.getPropertyValue('--ooa-btn-solid-text-color') !== textColor) {
      this.style.setProperty('--ooa-btn-solid-text-color', textColor);
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
