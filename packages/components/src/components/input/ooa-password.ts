import { html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { eyeIcon, eyeInvisibleIcon } from './input-icons.js';
import { OoaInput } from './ooa-input.js';

/**
 * 对位 antd Input.Password：复用 OoaInput 的渲染，仅覆盖 type（visible ? text : password）
 * 与 suffix（eye 图标，`ooa-input-password-icon`），根元素加 `ooa-input-password` 类。
 * 类型切换只改 type，不触发 change（对位 antd onVisibleChange 不触碰 value）。
 */
@customElement('ooa-password')
export class OoaPassword extends OoaInput {
  /** 对位 antd visibilityToggle；false 时不出 eye 图标。受控 visible 对象形式暂不实现。 */
  @property({ type: Boolean, attribute: 'visibility-toggle', reflect: true }) visibilityToggle = true;
  @state() private visible = false;

  protected override get effectiveType(): string {
    return this.visible ? 'text' : 'password';
  }

  protected override extraRootClass(): string {
    return 'ooa-input-password';
  }

  protected override hasExtraSuffix(): boolean {
    return this.visibilityToggle;
  }

  protected override extraSuffix(): TemplateResult | typeof nothing {
    if (!this.visibilityToggle) return nothing;
    const disabled = this.mergedDisabled;
    return html`
      <span
        part="password-icon"
        class="ooa-input-password-icon"
        role="button"
        tabindex=${disabled ? -1 : 0}
        aria-disabled=${disabled ? 'true' : 'false'}
        aria-pressed=${this.visible ? 'true' : 'false'}
        aria-label=${this.visible ? 'Hide' : 'Show'}
        @mousedown=${(e: MouseEvent) => e.preventDefault()}
        @mouseup=${(e: MouseEvent) => e.preventDefault()}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleVisible();
          }
        }}
        @click=${this.toggleVisible}
      >${this.visible ? eyeIcon() : eyeInvisibleIcon()}</span>`;
  }

  private toggleVisible(): void {
    if (this.mergedDisabled) return;
    this.visible = !this.visible;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ooa-password': OoaPassword; }
}
