import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './ooa-input.js';
import { baseControlStyles } from '../styles.js';

@customElement('ooa-password')
export class OoaPassword extends LitElement {
  @property({ reflect: true }) value = '';
  @property({ reflect: true }) placeholder = '';
  @property({ type: Boolean, attribute: 'allow-clear' }) allowClear = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, attribute: 'visibility-toggle' }) visibilityToggle = true;
  @state() private visible = false;
  static styles = [baseControlStyles, css`:host { display: inline-block; min-width: 180px; } .password { position: relative; } ooa-input { width: 100%; } button { position: absolute; inset-inline-end: 8px; top: 50%; padding: 0; color: var(--ooa-color-text-secondary, rgba(0,0,0,.45)); font: inherit; font-size: 12px; background: transparent; border: 0; transform: translateY(-50%); cursor: pointer; }`];
  private handleChange(event: CustomEvent<{ value: string }>): void { event.stopPropagation(); this.value = event.detail.value; this.dispatchEvent(new CustomEvent('ooa-change', { detail: event.detail, bubbles: true, composed: true })); }
  render() { return html`<div class="password"><ooa-input .value=${this.value} .placeholder=${this.placeholder} type=${this.visible ? 'text' : 'password'} ?allowClear=${this.allowClear} ?disabled=${this.disabled} @ooa-change=${this.handleChange}></ooa-input>${this.visibilityToggle ? html`<button type="button" @click=${() => { this.visible = !this.visible; }}>${this.visible ? 'Hide' : 'Show'}</button>` : nothing}</div>`; }
}
declare global { interface HTMLElementTagNameMap { 'ooa-password': OoaPassword; } }
