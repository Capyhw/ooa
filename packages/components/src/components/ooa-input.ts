import { consume } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { defaultOoaConfig, ooaConfigContext, type OoaConfig, type OoaSize } from '../config/context.js';
import { baseControlStyles } from '../styles.js';

export type InputStatus = 'error' | 'warning';

@customElement('ooa-input')
export class OoaInput extends LitElement {
  @property({ reflect: true }) value = '';
  @property({ reflect: true }) placeholder = '';
  @property({ reflect: true }) type = 'text';
  @property({ type: Boolean, attribute: 'allow-clear', reflect: true }) allowClear = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, attribute: 'readonly', reflect: true }) readOnly = false;
  @property({ reflect: true }) status: InputStatus | undefined = undefined;
  @property({ reflect: true }) size: OoaSize | undefined = undefined;
  @property({ type: Number, attribute: 'max-length' }) maxLength: number | undefined = undefined;
  @property({ type: Boolean, attribute: 'show-count', reflect: true }) showCount = false;
  @property({ reflect: true }) name = '';

  @query('input') protected inputElement!: HTMLInputElement;
  @consume({ context: ooaConfigContext, subscribe: true })
  @property({ attribute: false })
  protected config: OoaConfig = defaultOoaConfig;

  static styles = [
    baseControlStyles,
    css`
      :host { display: inline-block; min-width: 180px; }
      .group { display: flex; align-items: stretch; width: 100%; min-height: var(--ooa-control-height, 32px); color: var(--ooa-color-text, rgba(0,0,0,.88)); background: var(--ooa-color-bg-container, #fff); border: 1px solid var(--ooa-color-border, #d9d9d9); border-radius: var(--ooa-border-radius, 6px); transition: border-color .2s, box-shadow .2s; }
      .group:focus-within { border-color: var(--ooa-color-primary, #1677ff); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ooa-color-primary, #1677ff) 20%, transparent); }
      :host([status="error"]) .group { border-color: var(--ooa-color-error, #ff4d4f); }
      :host([disabled]) .group { color: rgba(0,0,0,.25); background: rgba(0,0,0,.04); cursor: not-allowed; }
      input { flex: 1; min-width: 0; height: 30px; padding: 4px 11px; color: inherit; font: inherit; line-height: 1.5715; background: transparent; border: 0; outline: 0; }
      input::placeholder { color: rgba(0,0,0,.25); }
      input:disabled { cursor: not-allowed; }
      .affix { display: inline-flex; align-items: center; color: var(--ooa-color-text-secondary, rgba(0,0,0,.45)); }
      .prefix { padding-inline-start: 11px; } .suffix { padding-inline-end: 8px; gap: 4px; }
      .clear { width: 18px; height: 18px; padding: 0; color: #fff; font-size: 12px; line-height: 16px; background: rgba(0,0,0,.25); border: 0; border-radius: 50%; cursor: pointer; }
      .count { padding-inline-end: 8px; font-size: 12px; white-space: nowrap; }
      :host([size="small"]) .group, .group[data-size="small"] { min-height: 24px; } :host([size="small"]) input, .group[data-size="small"] input { height: 22px; padding-block: 1px; padding-inline: 7px; font-size: 12px; }
      :host([size="large"]) .group, .group[data-size="large"] { min-height: 40px; } :host([size="large"]) input, .group[data-size="large"] input { height: 38px; padding-block: 6px; padding-inline: 11px; font-size: 16px; }
    `,
  ];

  protected updateValue(nextValue: string, sourceEvent?: Event): void {
    this.value = nextValue;
    const detail = { value: nextValue, sourceEvent };
    this.dispatchEvent(new CustomEvent('ooa-input', { detail, bubbles: true, composed: true }));
    this.dispatchEvent(new CustomEvent('ooa-change', { detail, bubbles: true, composed: true }));
  }

  private onInput(event: Event): void { this.updateValue((event.target as HTMLInputElement).value, event); }
  private clear(): void { this.updateValue(''); this.inputElement?.focus(); }

  render() {
    const size = this.size ?? this.config.componentSize;
    const disabled = this.disabled || this.config.disabled;
    return html`
      <div class="group" data-size=${size} part="affix-wrapper">
        <span class="affix prefix" part="prefix"><slot name="prefix"></slot></span>
        <input part="input" .value=${this.value} type=${this.type} name=${this.name} placeholder=${this.placeholder} ?disabled=${disabled} ?readonly=${this.readOnly} maxlength=${this.maxLength ?? nothing} @input=${this.onInput} />
        <span class="affix suffix" part="suffix">
          ${this.allowClear && this.value && !disabled ? html`<button class="clear" type="button" aria-label="Clear input" @click=${this.clear}>x</button>` : nothing}
          ${this.showCount ? html`<span class="count">${this.value.length}${this.maxLength ? `/${this.maxLength}` : ''}</span>` : nothing}
          <slot name="suffix"></slot>
        </span>
      </div>
    `;
  }
}

declare global { interface HTMLElementTagNameMap { 'ooa-input': OoaInput; } }
