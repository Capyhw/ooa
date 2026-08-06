import { consume } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { defaultOoaConfig, ooaConfigContext, type OoaConfig, type OoaSize } from '../config/context.js';
import { baseControlStyles } from '../styles.js';

type ButtonType = 'default' | 'primary' | 'dashed' | 'link' | 'text';
type ButtonShape = 'default' | 'circle' | 'round';

@customElement('ooa-button')
export class OoaButton extends LitElement {
  @property({ reflect: true }) type: ButtonType = 'default';
  @property({ reflect: true }) shape: ButtonShape = 'default';
  @property({ reflect: true }) size: OoaSize | undefined = undefined;
  @property({ type: Boolean, reflect: true }) danger = false;
  @property({ type: Boolean, reflect: true }) ghost = false;
  @property({ type: Boolean, reflect: true }) block = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ attribute: 'html-type', reflect: true }) htmlType: 'button' | 'submit' | 'reset' = 'button';

  @consume({ context: ooaConfigContext, subscribe: true })
  @property({ attribute: false })
  protected config: OoaConfig = defaultOoaConfig;

  static styles = [
    baseControlStyles,
    css`
      :host { display: inline-block; }
      :host([block]) { display: block; }
      button {
        min-width: 64px;
        height: var(--ooa-control-height, 32px);
        margin: 0;
        padding: 4px 15px;
        color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
        font: inherit;
        line-height: 1.5715;
        white-space: nowrap;
        text-align: center;
        background: var(--ooa-color-bg-container, #fff);
        border: 1px solid var(--ooa-color-border, #d9d9d9);
        border-radius: var(--ooa-border-radius, 6px);
        cursor: pointer;
        transition: color var(--ooa-motion-duration-mid, .2s), border-color var(--ooa-motion-duration-mid, .2s), background var(--ooa-motion-duration-mid, .2s);
      }
      button:hover:not(:disabled) { color: var(--ooa-color-primary, #1677ff); border-color: var(--ooa-color-primary, #1677ff); }
      button:focus-visible { outline: 2px solid color-mix(in srgb, var(--ooa-color-primary, #1677ff) 30%, transparent); outline-offset: 1px; }
      button:disabled { color: rgba(0, 0, 0, .25); background: rgba(0, 0, 0, .04); border-color: #d9d9d9; cursor: not-allowed; }
      :host([type="primary"]) button { color: #fff; background: var(--ooa-color-primary, #1677ff); border-color: var(--ooa-color-primary, #1677ff); }
      :host([type="primary"]) button:hover:not(:disabled) { color: #fff; background: color-mix(in srgb, var(--ooa-color-primary, #1677ff) 85%, white); }
      :host([type="dashed"]) button { border-style: dashed; }
      :host([type="link"]) button, :host([type="text"]) button { min-width: 0; padding-inline: 4px; border-color: transparent; background: transparent; }
      :host([type="link"]) button { color: var(--ooa-color-primary, #1677ff); }
      :host([danger]) button { color: var(--ooa-color-error, #ff4d4f); border-color: var(--ooa-color-error, #ff4d4f); }
      :host([danger][type="primary"]) button { color: #fff; background: var(--ooa-color-error, #ff4d4f); border-color: var(--ooa-color-error, #ff4d4f); }
      :host([ghost]) button { color: #fff; background: transparent; border-color: currentColor; }
      :host([shape="round"]) button { border-radius: 999px; }
      :host([shape="circle"]) button { min-width: var(--ooa-control-height, 32px); padding-inline: 0; border-radius: 50%; }
      :host([block]) button { width: 100%; }
      :host([size="small"]) button { min-width: 48px; height: 24px; padding: 0 7px; font-size: 12px; }
      :host([size="large"]) button { min-width: 80px; height: 40px; padding: 6.4px 15px; font-size: 16px; }
      .spinner { display: inline-block; width: 1em; height: 1em; margin-inline-end: 8px; vertical-align: -.125em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ];

  render() {
    const size = this.size ?? this.config.componentSize;
    return html`
      <button type=${this.htmlType} ?disabled=${this.disabled || this.config.disabled || this.loading} data-size=${size}>
        ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}<slot name="icon"></slot><slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ooa-button': OoaButton; }
}
