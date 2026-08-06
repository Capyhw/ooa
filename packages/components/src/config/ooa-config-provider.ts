import { provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { darkTheme, lightTheme, themeToCssVariables, type OoaThemeName } from '@ooa/tokens';
import { defaultOoaConfig, ooaConfigContext, type OoaDirection, type OoaSize } from './context.js';

@customElement('ooa-config-provider')
export class OoaConfigProvider extends LitElement {
  @property({ reflect: true }) theme: OoaThemeName = defaultOoaConfig.theme;
  @property({ reflect: true }) locale = defaultOoaConfig.locale;
  @property({ reflect: true }) direction: OoaDirection = defaultOoaConfig.direction;
  @property({ attribute: 'component-size', reflect: true }) componentSize: OoaSize = defaultOoaConfig.componentSize;
  @property({ type: Boolean, reflect: true }) disabled = defaultOoaConfig.disabled;

  @provide({ context: ooaConfigContext })
  @property({ attribute: false })
  private config = defaultOoaConfig;

  protected willUpdate(): void {
    const tokens = this.theme === 'dark' ? darkTheme : lightTheme;
    Object.entries(themeToCssVariables(tokens)).forEach(([name, value]) => this.style.setProperty(name, value));
    const nextConfig = {
      theme: this.theme,
      locale: this.locale,
      direction: this.direction,
      componentSize: this.componentSize,
      disabled: this.disabled,
    };
    if (
      this.config.theme !== nextConfig.theme ||
      this.config.locale !== nextConfig.locale ||
      this.config.direction !== nextConfig.direction ||
      this.config.componentSize !== nextConfig.componentSize ||
      this.config.disabled !== nextConfig.disabled
    ) {
      this.config = nextConfig;
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ooa-config-provider': OoaConfigProvider;
  }
}
