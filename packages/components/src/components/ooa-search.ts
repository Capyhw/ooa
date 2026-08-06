import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './ooa-input.js';
import { baseControlStyles } from '../styles.js';

@customElement('ooa-search')
export class OoaSearch extends LitElement {
  @property({ reflect: true }) value = '';
  @property({ reflect: true }) placeholder = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, attribute: 'enter-button' }) enterButton = false;
  static styles = [baseControlStyles, css`:host { display: inline-block; min-width: 220px; } .search { display: flex; } ooa-input { flex: 1; min-width: 0; } button { width: 56px; color: #fff; background: var(--ooa-color-primary, #1677ff); border: 1px solid var(--ooa-color-primary, #1677ff); border-radius: 0 var(--ooa-border-radius, 6px) var(--ooa-border-radius, 6px) 0; cursor: pointer; } button:disabled { cursor: not-allowed; opacity: .6; }`];
  private onChange(event: CustomEvent<{ value: string }>): void { event.stopPropagation(); this.value = event.detail.value; this.dispatchEvent(new CustomEvent('ooa-change', { detail: event.detail, bubbles: true, composed: true })); }
  private search(sourceEvent?: Event): void { this.dispatchEvent(new CustomEvent('ooa-search', { detail: { value: this.value, sourceEvent }, bubbles: true, composed: true })); }
  render() { return html`<div class="search"><ooa-input .value=${this.value} .placeholder=${this.placeholder} ?disabled=${this.disabled} @ooa-change=${this.onChange} @keydown=${(event: KeyboardEvent) => event.key === 'Enter' && this.search(event)}></ooa-input><button type="button" ?disabled=${this.disabled} @click=${(event: MouseEvent) => this.search(event)}>${this.enterButton ? html`<slot name="enter-button">Search</slot>` : 'Search'}</button></div>`; }
}
declare global { interface HTMLElementTagNameMap { 'ooa-search': OoaSearch; } }
