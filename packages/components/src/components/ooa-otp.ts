import { LitElement, css, html } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import { baseControlStyles } from '../styles.js';

@customElement('ooa-otp')
export class OoaOtp extends LitElement {
  @property({ type: Number, reflect: true }) length = 6;
  @property({ reflect: true }) value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, attribute: 'mask' }) mask = false;
  @queryAll('input') private inputs!: NodeListOf<HTMLInputElement>;
  static styles = [baseControlStyles, css`:host { display: inline-block; } .otp { display: flex; gap: 8px; } input { width: 40px; height: 40px; color: var(--ooa-color-text, rgba(0,0,0,.88)); font: inherit; font-size: 18px; text-align: center; background: var(--ooa-color-bg-container, #fff); border: 1px solid var(--ooa-color-border, #d9d9d9); border-radius: var(--ooa-border-radius, 6px); outline: 0; } input:focus { border-color: var(--ooa-color-primary, #1677ff); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ooa-color-primary, #1677ff) 20%, transparent); } input:disabled { background: rgba(0,0,0,.04); cursor: not-allowed; }`];
  private characters(): string[] { return Array.from({ length: this.length }, (_, index) => this.value[index] ?? ''); }
  private commit(chars: string[], sourceEvent: Event): void { this.value = chars.join(''); this.dispatchEvent(new CustomEvent('ooa-change', { detail: { value: this.value, sourceEvent }, bubbles: true, composed: true })); }
  private onInput(event: Event, index: number): void { const input = event.target as HTMLInputElement; const chars = this.characters(); chars[index] = input.value.slice(-1); this.commit(chars, event); if (input.value && index < this.length - 1) this.inputs[index + 1]?.focus(); }
  private onKeydown(event: KeyboardEvent, index: number): void { if (event.key === 'Backspace' && !this.characters()[index] && index > 0) this.inputs[index - 1]?.focus(); }
  render() { return html`<div class="otp" role="group">${this.characters().map((character, index) => html`<input aria-label="Verification character ${index + 1}" .value=${character} type=${this.mask ? 'password' : 'text'} inputmode="text" maxlength="1" ?disabled=${this.disabled} @input=${(event: Event) => this.onInput(event, index)} @keydown=${(event: KeyboardEvent) => this.onKeydown(event, index)} />`)}</div>`; }
}
declare global { interface HTMLElementTagNameMap { 'ooa-otp': OoaOtp; } }
