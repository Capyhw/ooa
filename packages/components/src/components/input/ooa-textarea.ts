import { consume } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { defaultOoaConfig, ooaConfigContext, type OoaConfig, type OoaSize } from '../../config/context.js';
import { clearIcon } from './input-icons.js';
import { inputStyles } from './style/index.js';
import {
  resolveSize,
  resolveVariant,
  shouldShowClear,
  type InputSize,
  type InputStatus,
  type InputVariant,
} from './input-helpers.js';

/** 类名数组 → 去空串 join（与 ooa-input 同风格）。 */
function joinClass(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * 对位 antd Input.TextArea（rc-input TextArea + antd TextArea.tsx）。
 * showCount/allowClear 走 affix-wrapper 分支（对位 hasPrefixSuffix 的 suffix 判断），
 * 计数是 `ooa-input-data-count` span（对位 textarea 专属的 data-count，不同于 input 的 show-count-suffix）。
 */
@customElement('ooa-textarea')
export class OoaTextarea extends LitElement {
  /** 受控值。不 reflect：antd 的 value 只写 DOM property。 */
  @property() value = '';
  @property({ reflect: true }) placeholder = '';
  @property({ type: Number, reflect: true }) rows = 4;
  @property({ reflect: true }) name = '';
  @property({ type: Number, attribute: 'max-length' }) maxLength: number | undefined = undefined;
  @property({ type: Boolean, attribute: 'show-count', reflect: true }) showCount = false;
  @property({ type: Boolean, attribute: 'allow-clear', reflect: true }) allowClear = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, attribute: 'readonly', reflect: true }) readOnly = false;
  @property({ reflect: true }) status: InputStatus | undefined = undefined;
  /** v6 用 medium；middle 为废弃别名（resolveSize 归一化）。 */
  @property({ reflect: true }) size: OoaSize | 'medium' | undefined = undefined;
  @property({ reflect: true }) variant: InputVariant | undefined = undefined;
  /** @deprecated 用 variant="borderless"；bordered=false 归一化为 borderless。 */
  @property({ type: Boolean, reflect: true }) bordered = true;
  /** 自动高度（对位 rc-input autoSize 布尔形式；minRows/maxRows 对象形式暂不实现）。 */
  @property({ type: Boolean, attribute: 'auto-size', reflect: true }) autoSize = false;

  @consume({ context: ooaConfigContext, subscribe: true })
  @property({ attribute: false })
  protected config: OoaConfig = defaultOoaConfig;

  static styles = inputStyles;

  @state() private _focused = false;
  private _composing = false;

  @query('textarea') protected textareaElement!: HTMLTextAreaElement;

  private get mergedSize(): InputSize {
    return resolveSize(this.size ?? this.config.componentSize);
  }

  private get mergedDisabled(): boolean {
    return this.disabled || this.config.disabled;
  }

  private get mergedVariant(): InputVariant {
    return resolveVariant(this.variant, this.bordered);
  }

  /** showCount/allowClear 任一 → affix 分支（对位 rc-input TextArea hasPrefixSuffix）。 */
  private get hasAffix(): boolean {
    return this.showCount || this.allowClear;
  }

  private get isOutOfRange(): boolean {
    return Boolean(this.showCount && this.maxLength && this.value.length > this.maxLength);
  }

  private get needClear(): boolean {
    return shouldShowClear(this.value, this.mergedDisabled, this.readOnly, this.allowClear);
  }

  private get dataCount(): string {
    return `${this.value.length}${this.maxLength ? ` / ${this.maxLength}` : ''}`;
  }

  private emitChange(nextValue: string, sourceEvent: Event | undefined): void {
    this.dispatchEvent(new CustomEvent('ooa-change', {
      detail: { value: nextValue, sourceEvent },
      bubbles: true,
      composed: true,
    }));
  }

  private handleInput(e: InputEvent): void {
    if (this._composing) return;
    const nextValue = (e.target as HTMLTextAreaElement).value;
    this.value = nextValue;
    this.resizeIfAuto();
    this.emitChange(nextValue, e);
  }

  private handleCompositionStart(): void {
    this._composing = true;
  }

  private handleCompositionEnd(e: CompositionEvent): void {
    this._composing = false;
    const nextValue = (e.target as HTMLTextAreaElement).value;
    this.value = nextValue;
    this.resizeIfAuto();
    this.emitChange(nextValue, e);
  }

  /** 对位 rc-input autoSize：先清高再按 scrollHeight 撑开。 */
  private resizeIfAuto(): void {
    if (this.autoSize && this.textareaElement) {
      this.textareaElement.style.height = 'auto';
      this.textareaElement.style.height = `${this.textareaElement.scrollHeight}px`;
    }
  }

  private handleClear(e: Event): void {
    this.value = '';
    this.emitChange('', e);
    this.textareaElement?.focus();
  }

  private handleFocus(): void {
    this._focused = true;
  }

  private handleBlur(): void {
    this._focused = false;
  }

  /** 裸分支的 textarea 类：variant/状态/out-of-range 直接落在 textarea 上；affix 分支内只留 base+尺寸+disabled（对位 BaseInput）。 */
  private buildTextareaClasses(insideAffix: boolean): string {
    const size = this.mergedSize;
    return joinClass([
      'ooa-input',
      size === 'large' ? 'ooa-input-lg' : '',
      size === 'small' ? 'ooa-input-sm' : '',
      this.mergedDisabled ? 'ooa-input-disabled' : '',
      !insideAffix && this.config.direction === 'rtl' ? 'ooa-input-rtl' : '',
      !insideAffix ? `ooa-input-${this.mergedVariant}` : '',
      !insideAffix && this.status ? `ooa-input-status-${this.status}` : '',
      !insideAffix && this.isOutOfRange ? 'ooa-input-out-of-range' : '',
    ]);
  }

  /** affix-wrapper 的类（对位 antd TextArea classNames.affixWrapper + variant）。 */
  private buildAffixWrapperClasses(): string {
    const size = this.mergedSize;
    return joinClass([
      'ooa-input-affix-wrapper',
      'ooa-input-textarea-affix-wrapper',
      this.mergedDisabled ? 'ooa-input-disabled' : '',
      this.mergedDisabled ? 'ooa-input-affix-wrapper-disabled' : '',
      this._focused ? 'ooa-input-affix-wrapper-focused' : '',
      this.readOnly ? 'ooa-input-affix-wrapper-readonly' : '',
      this.showCount ? 'ooa-input-textarea-show-count' : '',
      this.allowClear ? 'ooa-input-textarea-allow-clear' : '',
      size === 'large' ? 'ooa-input-affix-wrapper-lg' : '',
      size === 'small' ? 'ooa-input-affix-wrapper-sm' : '',
      this.config.direction === 'rtl' ? 'ooa-input-affix-wrapper-rtl' : '',
      `ooa-input-${this.mergedVariant}`,
      this.status ? `ooa-input-status-${this.status}` : '',
      this.isOutOfRange ? 'ooa-input-out-of-range' : '',
    ]);
  }

  override render() {
    const textarea = html`
      <textarea
        part="textarea"
        class=${this.buildTextareaClasses(this.hasAffix)}
        .value=${this.value}
        rows=${this.rows}
        name=${this.name || nothing}
        placeholder=${this.placeholder || nothing}
        maxlength=${this.maxLength ?? nothing}
        ?disabled=${this.mergedDisabled}
        ?readonly=${this.readOnly}
        @input=${this.handleInput}
        @compositionstart=${this.handleCompositionStart}
        @compositionend=${this.handleCompositionEnd}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      ></textarea>`;

    if (!this.hasAffix) return textarea;

    const countSuffix = this.showCount
      ? html`<span class="ooa-input-data-count">${this.dataCount}</span>`
      : nothing;

    const clearBtn = this.allowClear
      ? html`<button
          type="button"
          part="clear"
          aria-label="close-circle"
          class=${joinClass(['ooa-input-clear-icon', this.needClear ? '' : 'ooa-input-clear-icon-hidden', this.showCount ? 'ooa-input-clear-icon-has-suffix' : ''])}
          @mousedown=${(e: MouseEvent) => e.preventDefault()}
          @click=${this.handleClear}
        >${clearIcon()}</button>`
      : nothing;

    return html`
      <span
        part="affix-wrapper"
        class=${this.buildAffixWrapperClasses()}
        data-count=${this.showCount ? this.dataCount : nothing}
      >
        ${textarea}
        <span class="ooa-input-suffix">${clearBtn}${countSuffix}</span>
      </span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ooa-textarea': OoaTextarea; }
}
