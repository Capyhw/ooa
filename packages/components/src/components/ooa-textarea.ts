import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { baseControlStyles } from '../styles.js';

@customElement('ooa-textarea')
export class OoaTextarea extends LitElement {
  @property({ reflect: true }) value = '';
  @property({ reflect: true }) placeholder = '';
  @property({ type: Number, reflect: true }) rows = 4;
  @property({ type: Number, attribute: 'max-length' }) maxLength: number | undefined = undefined;
  @property({ type: Boolean, attribute: 'show-count', reflect: true }) showCount = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, attribute: 'readonly', reflect: true }) readOnly = false;
  @property({ type: Boolean, attribute: 'auto-size', reflect: true }) autoSize = false;
  @query('textarea') private textarea!: HTMLTextAreaElement;

  static styles = [baseControlStyles, css`
    :host { display: inline-block; min-width: 220px; }
    .wrapper { position: relative; border: 1px solid var(--ooa-color-border, #d9d9d9); border-radius: var(--ooa-border-radius, 6px); background: var(--ooa-color-bg-container, #fff); transition: border-color .2s, box-shadow .2s; }
    .wrapper:focus-within { border-color: var(--ooa-color-primary, #1677ff); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ooa-color-primary, #1677ff) 20%, transparent); }
    textarea { display: block; width: 100%; min-height: 32px; padding: 4px 11px; resize: vertical; color: var(--ooa-color-text, rgba(0,0,0,.88)); font: inherit; line-height: 1.5715; background: transparent; border: 0; outline: 0; }
    textarea:disabled { background: rgba(0,0,0,.04); cursor: not-allowed; resize: none; } textarea::placeholder { color: rgba(0,0,0,.25); }
    .count { display: block; padding: 0 11px 5px; color: var(--ooa-color-text-secondary, rgba(0,0,0,.45)); font-size: 12px; text-align: end; }
  `];

  private onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    if (this.autoSize && this.textarea) { this.textarea.style.height = 'auto'; this.textarea.style.height = `${this.textarea.scrollHeight}px`; }
    this.dispatchEvent(new CustomEvent('ooa-change', { detail: { value: this.value, sourceEvent: event }, bubbles: true, composed: true }));
  }

  render() {
    return html`<div class="wrapper" part="wrapper"><textarea part="textarea" .value=${this.value} placeholder=${this.placeholder} rows=${this.rows} maxlength=${this.maxLength ?? nothing} ?disabled=${this.disabled} ?readonly=${this.readOnly} @input=${this.onInput}></textarea>${this.showCount ? html`<span class="count">${this.value.length}${this.maxLength ? `/${this.maxLength}` : ''}</span>` : nothing}</div>`;
  }
}

declare global { interface HTMLElementTagNameMap { 'ooa-textarea': OoaTextarea; } }
