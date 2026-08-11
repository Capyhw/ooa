import { consume } from '@lit/context';
import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { defaultOoaConfig, ooaConfigContext, type OoaConfig, type OoaSize } from '../../config/context.js';
import { clearIcon } from './input-icons.js';
import { inputStyles } from './style/index.js';
import {
  formatCount,
  resolveSize,
  resolveVariant,
  shouldShowClear,
  type InputSize,
  type InputStatus,
  type InputVariant,
} from './input-helpers.js';

/** 类名数组 → 去空串 join（对位 antd clsx，与 button 同风格）。 */
function joinClass(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

@customElement('ooa-input')
export class OoaInput extends LitElement {
  /** 受控值。不 reflect：antd 的 value 只写 DOM property，不写 attribute。 */
  @property() value = '';
  @property({ reflect: true }) placeholder = '';
  @property({ reflect: true }) type = 'text';
  @property({ reflect: true }) name = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, attribute: 'readonly', reflect: true }) readOnly = false;
  @property({ reflect: true }) status: InputStatus | undefined = undefined;
  /** v6 用 medium；middle 为废弃别名（resolveSize 归一化）。 */
  @property({ reflect: true }) size: OoaSize | 'medium' | undefined = undefined;
  @property({ type: Number, attribute: 'max-length' }) maxLength: number | undefined = undefined;
  @property({ type: Boolean, attribute: 'show-count', reflect: true }) showCount = false;
  @property({ type: Boolean, attribute: 'allow-clear', reflect: true }) allowClear = false;
  @property({ reflect: true }) variant: InputVariant | undefined = undefined;
  /** @deprecated 用 variant="borderless"；bordered=false 归一化为 borderless。 */
  @property({ type: Boolean, reflect: true }) bordered = true;
  @property({ reflect: true }) autocomplete: string | undefined = undefined;
  @property({ type: Boolean, attribute: 'auto-focus', reflect: true }) autoFocus = false;

  @consume({ context: ooaConfigContext, subscribe: true })
  @property({ attribute: false })
  protected config: OoaConfig = defaultOoaConfig;

  static styles = inputStyles;

  // >>> 内部状态（对位 antd useState/useRef）
  /** affix-wrapper 的 focus 类（antd 保留但"not used"；仍输出保持 DOM 一致）。 */
  @state() private _focused = false;
  /** prefix / suffix slot 是否有内容（对位 antd 的 prefix/suffix props 是否存在）。 */
  @state() private _hasPrefix = false;
  @state() private _hasSuffix = false;
  /** IME 组合中（对位 rc-input compositionRef）：组合期间不触发 change。 */
  private _composing = false;

  /** 监听宿主 light DOM 的 slot 内容变化（对位 antd 感知 prefix/suffix props）。 */
  private _lightDomObserver: MutationObserver | null = null;

  @query('input') protected inputElement!: HTMLInputElement;

  override connectedCallback(): void {
    super.connectedCallback();
    this._lightDomObserver = new MutationObserver(() => this.refreshSlotPresence());
    this._lightDomObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['slot'],
    });
    this.refreshSlotPresence();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._lightDomObserver?.disconnect();
    this._lightDomObserver = null;
  }

  /** 依据 light DOM 中带 slot 属性的元素推导 prefix/suffix 是否存在。 */
  private refreshSlotPresence(): void {
    const hasPrefix = this.querySelector('[slot="prefix"]') !== null;
    const hasSuffix = this.querySelector('[slot="suffix"]') !== null;
    if (hasPrefix !== this._hasPrefix || hasSuffix !== this._hasSuffix) {
      this._hasPrefix = hasPrefix;
      this._hasSuffix = hasSuffix;
      this.requestUpdate();
    }
  }

  // >>> 派生（对位 antd useSize / useVariant / useMergedStatus / mergedDisabled）
  private get mergedSize(): InputSize {
    return resolveSize(this.size ?? this.config.componentSize);
  }

  protected get mergedDisabled(): boolean {
    return this.disabled || this.config.disabled;
  }

  private get mergedVariant(): InputVariant {
    return resolveVariant(this.variant, this.bordered);
  }

  /** 有 prefix/suffix/allowClear/showCount/额外 suffix 任一 → affix 分支（对位 hasPrefixSuffix）。 */
  private get hasAffix(): boolean {
    return this.allowClear || this.showCount || this._hasPrefix || this._hasSuffix || this.hasExtraSuffix();
  }

  /** showCount + maxLength 下超长（对位 rc-input useCountDisplay isOutOfRange）。 */
  private get isOutOfRange(): boolean {
    return Boolean(this.showCount && this.maxLength && this.value.length > this.maxLength);
  }

  // >>> 子类扩展点（password 复用渲染）
  /** 实际渲染到 input 的 type（对位 antd Password 的 type 覆盖）。 */
  protected get effectiveType(): string {
    return this.type;
  }

  /** suffix 内额外内容（对位 antd Password 的 suffixIcon，插在用户 suffix 之前）。 */
  protected extraSuffix(): TemplateResult | typeof nothing {
    return nothing;
  }

  /** extraSuffix 是否非空（决定 hasAffix / suffix span 是否存在，对位 antd suffix prop）。 */
  protected hasExtraSuffix(): boolean {
    return false;
  }

  /** 加在根元素（裸 input / affix-wrapper）上的额外类（对位 antd Password 的 input-password 类）。 */
  protected extraRootClass(): string {
    return '';
  }

  /** clear 图标可见（对位 BaseInput needClear：非 disabled/readOnly 且有值）。 */
  private get needClear(): boolean {
    return shouldShowClear(this.value, this.mergedDisabled, this.readOnly, this.allowClear);
  }

  // >>> 事件（对位 rc-input triggerChange / handleReset / focus）
  private emitChange(nextValue: string, sourceEvent: Event | undefined): void {
    this.dispatchEvent(new CustomEvent('ooa-change', {
      detail: { value: nextValue, sourceEvent },
      bubbles: true,
      composed: true,
    }));
  }

  private handleInput(e: InputEvent): void {
    if (this._composing) return;
    const nextValue = (e.target as HTMLInputElement).value;
    this.value = nextValue;
    this.emitChange(nextValue, e);
  }

  private handleCompositionStart(): void {
    this._composing = true;
  }

  private handleCompositionEnd(e: CompositionEvent): void {
    this._composing = false;
    // 对位 rc-input onInternalCompositionEnd：组合结束补发一次完整值 change
    const nextValue = (e.target as HTMLInputElement).value;
    this.value = nextValue;
    this.emitChange(nextValue, e);
  }

  private handleClear(e: Event): void {
    // 对位 handleReset：清空 + 回焦 + 触发 change（mousedown 已 preventDefault 防失焦）
    this.value = '';
    this.emitChange('', e);
    this.inputElement?.focus();
  }

  private handleFocus(): void {
    this._focused = true;
  }

  private handleBlur(): void {
    this._focused = false;
  }

  // >>> 类名拼装（对位 antd classes）
  /** 裸分支/affix 内 input 的类：antd 中 size 类 + 变体/状态类，variant 类只在无 affix 时落在 input 上。 */
  private buildInputClasses(): string {
    const size = this.mergedSize;
    return joinClass([
      'ooa-input',
      size === 'large' ? 'ooa-input-lg' : '',
      size === 'small' ? 'ooa-input-sm' : '',
      this.mergedDisabled ? 'ooa-input-disabled' : '',
      !this.hasAffix ? this.isOutOfRange ? 'ooa-input-out-of-range' : '' : '',
      !this.hasAffix ? this.config.direction === 'rtl' ? 'ooa-input-rtl' : '' : '',
      !this.hasAffix ? `ooa-input-${this.mergedVariant}` : '',
      !this.hasAffix && this.status ? `ooa-input-status-${this.status}` : '',
      !this.hasAffix ? this.extraRootClass() : '',
    ]);
  }

  /** affix-wrapper 的类（对位 BaseInput affixWrapperCls + antd classNames）。 */
  private buildAffixWrapperClasses(): string {
    const size = this.mergedSize;
    return joinClass([
      'ooa-input-affix-wrapper',
      this.mergedDisabled ? 'ooa-input-disabled' : '',
      this.mergedDisabled ? 'ooa-input-affix-wrapper-disabled' : '',
      this._focused ? 'ooa-input-affix-wrapper-focused' : '',
      this.readOnly ? 'ooa-input-affix-wrapper-readonly' : '',
      (this._hasSuffix || this.showCount || this.hasExtraSuffix()) && this.allowClear && this.value ? 'ooa-input-affix-wrapper-input-with-clear-btn' : '',
      size === 'large' ? 'ooa-input-affix-wrapper-lg' : '',
      size === 'small' ? 'ooa-input-affix-wrapper-sm' : '',
      this.config.direction === 'rtl' ? 'ooa-input-affix-wrapper-rtl' : '',
      `ooa-input-${this.mergedVariant}`,
      this.status ? `ooa-input-status-${this.status}` : '',
      this.isOutOfRange ? 'ooa-input-out-of-range' : '',
      this.extraRootClass(),
    ]);
  }

  /** 裸分支直接渲染 input；affix 分支套 wrapper。变体/状态/out-of-range 在 affix 时只落在 wrapper 上（对位 BaseInput）。 */
  override render() {
    const input = html`
      <input
        part="input"
        class=${this.buildInputClasses()}
        type=${this.effectiveType}
        .value=${this.value}
        name=${this.name || nothing}
        placeholder=${this.placeholder || nothing}
        maxlength=${this.maxLength ?? nothing}
        autocomplete=${this.autocomplete || nothing}
        ?disabled=${this.mergedDisabled}
        ?readonly=${this.readOnly}
        @input=${this.handleInput}
        @compositionstart=${this.handleCompositionStart}
        @compositionend=${this.handleCompositionEnd}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      />`;

    if (!this.hasAffix) return input;

    const countSuffix = this.showCount
      ? html`<span class=${joinClass(['ooa-input-show-count-suffix', this._hasSuffix ? 'ooa-input-show-count-has-suffix' : ''])}>${formatCount(this.value, this.maxLength)}</span>`
      : nothing;

    const clearBtn = this.allowClear
      ? html`<button
          type="button"
          part="clear"
          aria-label="close-circle"
          class=${joinClass(['ooa-input-clear-icon', this.needClear ? '' : 'ooa-input-clear-icon-hidden', this._hasSuffix || this.showCount || this.hasExtraSuffix() ? 'ooa-input-clear-icon-has-suffix' : ''])}
          @mousedown=${(e: MouseEvent) => e.preventDefault()}
          @click=${this.handleClear}
        >${clearIcon()}</button>`
      : nothing;

    // suffix span：对位 antd (suffix || allowClear) 才渲染。suffix slot 仅在有内容时渲染（对位 antd suffix prop）。
    const suffixSpan = this.allowClear || this.showCount || this._hasSuffix || this.hasExtraSuffix()
      ? html`<span class="ooa-input-suffix">${clearBtn}${countSuffix}${this.extraSuffix()}${this._hasSuffix ? html`<slot name="suffix"></slot>` : nothing}</span>`
      : nothing;

    const prefixSpan = this._hasPrefix
      ? html`<span class="ooa-input-prefix"><slot name="prefix"></slot></span>`
      : nothing;

    return html`
      <span part="affix-wrapper" class=${this.buildAffixWrapperClasses()} @click=${this.handleWrapperClick}>
        ${prefixSpan}
        ${input}
        ${suffixSpan}
      </span>`;
  }

  /** 点击 affix-wrapper 内任意处回焦 input（对位 BaseInput onInputClick triggerFocus）。 */
  private handleWrapperClick(): void {
    this.inputElement?.focus();
  }

  override firstUpdated(): void {
    // Lit 的 firstUpdated 空实现，无需 super；对位 antd autoFocus
    if (this.autoFocus) {
      this.inputElement?.focus();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ooa-input': OoaInput; }
}
