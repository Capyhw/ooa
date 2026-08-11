import { consume } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { defaultOoaConfig, ooaConfigContext, type OoaConfig, type OoaSize } from '../../config/context.js';
import { inputStyles } from './style/index.js';
import {
  resolveSize,
  resolveVariant,
  type InputStatus,
  type InputVariant,
} from './input-helpers.js';

/** OTP 专属样式（对位 antd Input style/otp.ts）。 */
const otpStyles = css`
  :host {
    display: inline-block;
  }
  .ooa-otp {
    display: inline-flex;
    align-items: center;
    flex-wrap: nowrap;
    column-gap: var(--ooa-padding-xs, 8px);
  }
  .ooa-otp-rtl {
    direction: rtl;
  }
  .ooa-otp-input-wrapper {
    position: relative;
  }
  .ooa-otp-input {
    text-align: center;
    padding-inline: var(--ooa-padding-xxs, 4px);
  }
  .ooa-otp-sm .ooa-otp-input {
    padding-inline: calc(var(--ooa-padding-xxs, 4px) / 2);
  }
  .ooa-otp-lg .ooa-otp-input {
    padding-inline: var(--ooa-padding-xs, 8px);
  }
  .ooa-otp-mask-icon {
    position: absolute;
    z-index: 1;
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
    pointer-events: none;
  }
  .ooa-otp-mask-input {
    color: transparent;
    caret-color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
  }
  .ooa-otp-mask-input::selection {
    color: transparent;
  }
`;

/**
 * 对位 antd Input.OTP：length 个单格 input（`ooa-otp-input-wrapper` + 裸 input），
 * 键盘导航 / 粘贴分发 / 聚焦选全 / mask 覆盖层。受控 value 为完整字符串。
 */
@customElement('ooa-otp')
export class OoaOtp extends LitElement {
  @property({ type: Number, reflect: true }) length = 6;
  /** 受控完整值（对位 antd value）。不 reflect。 */
  @property() value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true }) status: InputStatus | undefined = undefined;
  /** v6 用 medium；middle 为废弃别名（resolveSize 归一化）。 */
  @property({ reflect: true }) size: OoaSize | 'medium' | undefined = undefined;
  @property({ reflect: true }) variant: InputVariant | undefined = undefined;
  /** true → 掩码 + password type；字符串 → 掩码覆盖层字符。 */
  @property({ reflect: true }) mask: string | boolean | undefined = undefined;
  @property({ type: Boolean, attribute: 'auto-focus', reflect: true }) autoFocus = false;
  @property({ reflect: true }) inputmode: string | undefined = undefined;
  /** 单元格之间的分隔符（对位 antd separator；缺省无分隔）。 */
  @property({ reflect: true }) separator: string | undefined = undefined;
  /** 对位 antd formatter：patchValue 时对空格补全的整串做格式化（如转大写），函数属性不 reflect。 */
  @property({ attribute: false }) formatter: ((text: string) => string) | undefined = undefined;

  @consume({ context: ooaConfigContext, subscribe: true })
  @property({ attribute: false })
  protected config: OoaConfig = defaultOoaConfig;

  static styles = [inputStyles, otpStyles];

  @queryAll('input') private cells!: NodeListOf<HTMLInputElement>;

  private get mergedSize(): OoaSize {
    return resolveSize(this.size ?? this.config.componentSize);
  }

  private get mergedDisabled(): boolean {
    return this.disabled || this.config.disabled;
  }

  private get mergedVariant(): InputVariant {
    return resolveVariant(this.variant, true);
  }

  private charAt(index: number): string {
    return this.value[index] ?? '';
  }

  /** 对位 antd patchValue：单字符覆盖当前格，多字符（粘贴）从当前格起分发；格式化对空格补全的整串做。 */
  private patchCells(index: number, txt: string): string[] {
    let next = this.value.split('');
    for (let i = 0; i < index; i += 1) {
      if (!next[i]) next[i] = '';
    }
    if (txt.length <= 1) {
      next[index] = txt;
    } else {
      next = next.slice(0, index).concat(txt.split(''));
    }
    next = next.slice(0, this.length);
    // 对位 antd patchValue 的 formatter：空格补全 → 整体格式化 → 空格还原为空串
    if (this.formatter) {
      const padded = next.map((c) => c || ' ').join('');
      const formatted = this.formatter(padded);
      next = formatted.split('').map((c, i) => (c === ' ' && !next[i] ? next[i] : c));
    }
    return next;
  }

  /**
   * 对位 antd triggerValueCellsChange：每次输入都派发 `ooa-input`（对位 onInput），
   * `ooa-change`（对位 onChange）只在全部格子填满且与本次输入前值不同时派发。
   */
  private handleInput(e: Event, index: number): void {
    const input = e.target as HTMLInputElement;
    const prev = this.value;
    const next = this.patchCells(index, input.value);
    const joined = next.join('');
    this.value = joined;
    const detail = { value: joined, sourceEvent: e };
    this.dispatchEvent(new CustomEvent('ooa-input', { detail, bubbles: true, composed: true }));
    if (joined.length === this.length && joined !== prev) {
      this.dispatchEvent(new CustomEvent('ooa-change', { detail, bubbles: true, composed: true }));
    }
    // 对位 antd onInputChange：跳到下一格
    const nextIndex = Math.min(index + input.value.length, this.length - 1);
    if (nextIndex !== index) {
      this.cells[nextIndex]?.focus();
    }
  }

  /** 对位 antd onInternalKeyDown：方向键/退格导航，Ctrl/Cmd+Z 阻止。 */
  private handleKeydown(e: KeyboardEvent, index: number): void {
    const { key, ctrlKey, metaKey } = e;
    if (key === 'ArrowLeft') {
      this.cells[index - 1]?.focus();
    } else if (key === 'ArrowRight') {
      this.cells[index + 1]?.focus();
    } else if (key === 'Backspace' && !this.charAt(index)) {
      this.cells[index - 1]?.focus();
    } else if (key === 'z' && (ctrlKey || metaKey)) {
      e.preventDefault();
    }
    this.syncSelection();
  }

  /** 对位 antd syncSelection：聚焦时选中整格内容。 */
  private syncSelection(): void {
    requestAnimationFrame(() => {
      const input = document.activeElement as HTMLInputElement | null;
      if (input && Array.from(this.cells).includes(input)) {
        input.select();
      }
    });
  }

  /** 对位 antd onInputFocus：聚焦某格时，若前面有空格则跳到第一个空格。 */
  private handleFocus(index: number): void {
    for (let i = 0; i < index; i += 1) {
      if (!this.charAt(i)) {
        this.cells[i]?.focus();
        return;
      }
    }
    this.syncSelection();
  }

  override firstUpdated(): void {
    // Lit 的 firstUpdated 空实现，无需 super；对位 antd autoFocus → 聚焦第 0 格
    if (this.autoFocus) {
      this.cells[0]?.focus();
    }
  }

  override render() {
    const size = this.mergedSize;
    const rootCls = [
      'ooa-otp',
      size === 'large' ? 'ooa-otp-lg' : '',
      size === 'small' ? 'ooa-otp-sm' : '',
      this.config.direction === 'rtl' ? 'ooa-otp-rtl' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div part="root" class=${rootCls} role="group">
        ${Array.from({ length: this.length }, (_, index) => {
          const char = this.charAt(index);
          const maskChar = typeof this.mask === 'string' ? this.mask : char;
          const inputCls = [
            'ooa-otp-input',
            'ooa-input',
            size === 'large' ? 'ooa-input-lg' : '',
            size === 'small' ? 'ooa-input-sm' : '',
            this.mergedDisabled ? 'ooa-input-disabled' : '',
            `ooa-input-${this.mergedVariant}`,
            this.status ? `ooa-input-status-${this.status}` : '',
            this.mask ? 'ooa-otp-mask-input' : '',
          ].filter(Boolean).join(' ');

          const cell = html`
            <span class="ooa-otp-input-wrapper" role="presentation">
              ${this.mask && char ? html`<span class="ooa-otp-mask-icon" aria-hidden="true">${maskChar}</span>` : nothing}
              <input
                part="cell"
                class=${inputCls}
                aria-label="OTP Input ${index + 1}"
                type=${this.mask === true ? 'password' : 'text'}
                .value=${char}
                size="1"
                inputmode=${this.inputmode || nothing}
                ?disabled=${this.mergedDisabled}
                @input=${(e: Event) => this.handleInput(e, index)}
                @focus=${() => this.handleFocus(index)}
                @keydown=${(e: KeyboardEvent) => this.handleKeydown(e, index)}
                @mousedown=${() => this.syncSelection()}
                @mouseup=${() => this.syncSelection()}
              />
            </span>`;

          const separator = this.separator !== undefined && index < this.length - 1
            ? html`<span class="ooa-otp-separator">${this.separator}</span>`
            : nothing;

          return html`${cell}${separator}`;
        })}
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ooa-otp': OoaOtp; }
}
