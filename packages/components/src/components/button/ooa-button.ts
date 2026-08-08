import { consume } from '@lit/context';
import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { defaultOoaConfig, ooaConfigContext, type OoaConfig, type OoaSize } from '../../config/context.js';
import { buttonStyles } from './style/index.js';
import { groupSizeContext } from './button-group.js';
import { iconWrapper } from './icon-wrapper.js';
import { defaultLoadingIcon } from './default-loading-icon.js';
import {
  resolveColorVariant,
  isUnBorderedVariant,
  getLoadingConfig,
  isTwoCNChar,
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

  // >>> 内部状态（对位 antd useState/useRef/useEffect）
  /** 生效的 loading（loading-delay 延迟后置 true），对位 antd innerLoading。 */
  @state() private innerLoading = false;
  private _delayTimer: ReturnType<typeof setTimeout> | null = null;
  /** 首帧挂载标记：首帧 loading 图标不带动画（对位 antd isMountRef）。
   *  用 @state 使 firstUpdated 置 false 时触发二次渲染 → 直接 loading 的 spinner 开始转。 */
  @state() private _isMount = true;
  /** icon slot 是否有内容（对位 antd `icon` prop 是否传入）。 */
  private _hasIcon = false;
  /** 默认内容 slot 是否有内容（对位 antd children 是否为空）。 */
  private _hasDefaultContent = false;
  private _hasTwoCNChar = false;

  @query('slot[name="icon"]') private iconSlot?: HTMLSlotElement;
  @query('slot:not([name])') private contentSlot?: HTMLSlotElement;

  /** slot 内容变化时刷新 _hasIcon / _hasDefaultContent（对位 antd render 时感知 children/icon）。 */
  private handleSlotChange = () => {
    const hasIcon = (this.iconSlot?.assignedElements().length ?? 0) > 0;
    const hasDefault = (this.contentSlot?.assignedNodes().length ?? 0) > 0;
    if (hasIcon !== this._hasIcon || hasDefault !== this._hasDefaultContent) {
      this._hasIcon = hasIcon;
      this._hasDefaultContent = hasDefault;
      this.requestUpdate();
    }
  };

  private get mergedShape(): ButtonShape { return this.shape ?? 'default'; }
  /** medium/middle 均视为 v6 medium（无类）；归一化避免类型发散。 */
  private get mergedSize(): OoaSize {
    const s = this.size ?? this.groupSize ?? this.config.componentSize;
    return s === 'medium' ? 'middle' : s;
  }

  /** 组大小（对位 antd GroupSizeContext）：size 解析链 props → group → config。 */
  @consume({ context: groupSizeContext, subscribe: true })
  @property({ attribute: false })
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
  override willUpdate(changed: PropertyValues<this>): void {
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
    // loading 定时器（对位 antd getLoadingConfig + useLayoutEffect 的 delay 分支）
    if (changed.has('loading') || changed.has('loadingDelay')) {
      const cfg = getLoadingConfig(this.loading, this.loadingDelay);
      if (this._delayTimer) {
        clearTimeout(this._delayTimer);
        this._delayTimer = null;
      }
      if (cfg.delay > 0) {
        this._delayTimer = setTimeout(() => {
          this._delayTimer = null;
          this.innerLoading = true;
        }, cfg.delay);
      } else {
        this.innerLoading = cfg.loading;
      }
    }
    // 两汉字检测（对位 antd useEffect 运行时读 button.textContent）。
    // slot 不参与元素 textContent，故用宿主 this.textContent（= light DOM 文本）。
    // 在 willUpdate 里算好，避免 updated() 里 requestUpdate 引发二次更新。
    const text = this.textContent ?? '';
    const needInserted = this.childNodes.length === 1 && !this._hasIcon && !isUnBorderedVariant(variant);
    this._hasTwoCNChar = needInserted && (this.autoInsertSpace ?? true) && isTwoCNChar(text);
  }

  override firstUpdated(): void {
    // 对位 antd isMountRef：首帧挂载后 loading 图标开始旋转
    this._isMount = false;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // 断开即取消 pending delay；重连后用户重触发 loading 即重新调度
    if (this._delayTimer) {
      clearTimeout(this._delayTimer);
      this._delayTimer = null;
    }
  }

  // >>> 类名拼装（对位 antd classes；类加在内部 button/a 上）
  // anchorDisabled：anchor 分支 disabled 时加 -disabled 类（对位 antd `<a>` 分支）。
  private buildClasses(anchorDisabled = false): string {
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
      this.innerLoading ? 'ooa-btn-loading' : '',
      this._hasTwoCNChar && !this.innerLoading ? 'ooa-btn-two-chinese-chars' : '',
      !this._hasDefaultContent && (this._hasIcon || this.innerLoading) ? 'ooa-btn-icon-only' : '',
      this.iconPlacement === 'end' ? 'ooa-btn-icon-end' : '',
      anchorDisabled ? 'ooa-btn-disabled' : '',
    ].filter(Boolean).join(' ');
  }

  override render() {
    const disabled = this.disabled || this.config.disabled;
    const classes = this.buildClasses(disabled && this.href !== undefined);

    // icon 位（对位 antd iconNode）。两个 slot 常驻渲染以触发 slotchange 检测
    // （若只在 _hasIcon 时渲染 icon slot 会自锁：slot 不存在 → 检测不到 icon）。
    // 空且非 loading 时 wrapper 加隐藏类，避免空 span 的 gap 顶开文字。
    const iconNode = iconWrapper(
      html`
        <slot name="icon" @slotchange=${this.handleSlotChange}></slot>
        <slot name="loading-icon" @slotchange=${this.handleSlotChange}>${defaultLoadingIcon(this._isMount)}</slot>
      `,
      this._hasIcon || this.innerLoading ? '' : 'ooa-btn-icon-hidden',
    );

    const content = html`<span part="content"><slot @slotchange=${this.handleSlotChange}></slot></span>`;

    if (this.href !== undefined) {
      return html`
        <a
          part="root"
          class=${classes}
          href=${disabled ? nothing : this.href}
          target=${this.target ?? nothing}
          aria-disabled=${disabled}
          tabindex=${disabled ? -1 : 0}
          @click=${this.handleClick}
        >${iconNode}${content}</a>`;
    }

    return html`
      <button
        part="root"
        type=${this.htmlType}
        class=${classes}
        ?disabled=${disabled}
        aria-busy=${this.innerLoading ? 'true' : nothing}
        @click=${this.handleClick}
      >${iconNode}${content}</button>`;
  }

  private handleClick(e: Event) {
    // 对位 antd handleClick：innerLoading || disabled → preventDefault
    const disabled = this.disabled || this.config.disabled;
    if (this.innerLoading || disabled) {
      e.preventDefault();
      return;
    }
  }
}
