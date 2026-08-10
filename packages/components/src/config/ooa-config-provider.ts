import { provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { OoaThemeName } from '@ooa/tokens';
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
    // Theme tokens are applied via theme.css, which scopes the dark palette to
    // this element through `ooa-config-provider[theme="dark"]` — the reflected
    // `theme` attribute drives the selector.
    // direction 通过 host 的 dir 属性生效：组件使用 padding-inline 等逻辑属性，
    // 会在 `dir="rtl"` 时自动镜像，与 antd ConfigProvider direction 对齐。
    this.dir = this.direction;
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
