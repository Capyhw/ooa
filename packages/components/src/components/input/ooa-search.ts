import { consume } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { defaultOoaConfig, ooaConfigContext, type OoaConfig, type OoaSize } from '../../config/context.js';
import { searchIcon } from './input-icons.js';
import { inputStyles } from './style/index.js';
import { resolveVariant, type InputStatus, type InputVariant } from './input-helpers.js';
import './ooa-input.js';

/** search 容器布局 + 按钮（对位 antd Search：用 Space.Compact 合并边框；OOA 暂无 Compact，用相邻布局近似）。 */
const searchLayoutStyles = css`
  :host {
    display: inline-block;
  }
  .ooa-search {
    display: inline-flex;
    width: 100%;
  }
  .ooa-search-input {
    flex: 1;
    min-width: 0;
  }
  .ooa-search-btn {
    flex: none;
    padding: var(--ooa-input-padding-block, 4px) var(--ooa-padding-lg, 24px);
    color: var(--ooa-color-primary-text, #fff);
    font-size: var(--ooa-input-font-size, 14px);
    line-height: var(--ooa-line-height, 1.5714);
    background: var(--ooa-color-primary, #1677ff);
    border: var(--ooa-line-width, 1px) var(--ooa-line-type, solid) var(--ooa-color-primary, #1677ff);
    border-radius: 0 var(--ooa-border-radius, 6px) var(--ooa-border-radius, 6px) 0;
    margin-inline-start: -1px; /* 覆盖 input 右 border（近似 Compact 合并） */
    cursor: pointer;
    transition: all var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease);
  }
  .ooa-search-btn:hover {
    background: var(--ooa-color-primary-hover, #4096ff);
    border-color: var(--ooa-color-primary-hover, #4096ff);
  }
  .ooa-search-btn:disabled {
    color: var(--ooa-color-text-disabled, rgba(0, 0, 0, 0.25));
    background: var(--ooa-color-bg-container-disabled, rgba(0, 0, 0, 0.04));
    border-color: var(--ooa-color-border-disabled, #d9d9d9);
    cursor: not-allowed;
  }
  .ooa-search-btn svg {
    display: block;
  }
`;

/**
 * 对位 antd Input.Search 的功能等价版：内部复用 ooa-input + 搜索按钮。
 * antd 用 Space.Compact 合并 input 与按钮边框，OOA 暂无 Compact，这里用按钮覆盖
 * input 右 border 的方式近似（不参与 parity 1:1 断言，见 docs/component-replication.md §3.4）。
 */
@customElement('ooa-search')
export class OoaSearch extends LitElement {
  @property() value = '';
  @property({ reflect: true }) placeholder = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 对位 antd enterButton：布尔 true → 搜索图标按钮；非空字符串 → 文本按钮（对位 enterButton="Search"）。 */
  @property({ attribute: 'enter-button' }) enterButton: string | boolean = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ reflect: true }) variant: InputVariant | undefined = undefined;
  @property({ reflect: true }) status: InputStatus | undefined = undefined;
  @property({ reflect: true }) size: OoaSize | 'medium' | undefined = undefined;
  @property({ type: Boolean, attribute: 'allow-clear', reflect: true }) allowClear = false;

  @consume({ context: ooaConfigContext, subscribe: true })
  @property({ attribute: false })
  protected config: OoaConfig = defaultOoaConfig;

  static styles = [inputStyles, searchLayoutStyles];

  private get mergedVariant(): InputVariant {
    return resolveVariant(this.variant, true);
  }

  /** 内层 input 的 change → 透传（stopPropagation 防二次冒泡）。 */
  private handleChange(e: CustomEvent<{ value: string; sourceEvent?: Event }>): void {
    e.stopPropagation();
    this.value = e.detail.value;
    this.dispatchEvent(new CustomEvent('ooa-change', {
      detail: { value: this.value, sourceEvent: e.detail.sourceEvent },
      bubbles: true,
      composed: true,
    }));
  }

  /** 对位 antd onSearch：Enter / 按钮点击触发。 */
  private search(sourceEvent?: Event): void {
    this.dispatchEvent(new CustomEvent('ooa-search', {
      detail: { value: this.value, sourceEvent },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    const disabled = this.disabled || this.config.disabled;
    const variant = this.mergedVariant;
    const enterText =
      typeof this.enterButton === 'string' && this.enterButton !== '' ? this.enterButton : null;
    return html`
      <div part="root" class="ooa-search">
        <ooa-input
          class="ooa-search-input"
          .value=${this.value}
          placeholder=${this.placeholder || nothing}
          type="search"
          variant=${variant}
          status=${this.status ?? nothing}
          size=${this.size ?? nothing}
          ?disabled=${disabled}
          ?allow-clear=${this.allowClear}
          @ooa-change=${this.handleChange}
          @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.search(e)}
        ></ooa-input>
        <button
          part="button"
          type="button"
          class="ooa-search-btn"
          aria-label=${enterText === null ? 'search' : nothing}
          ?disabled=${disabled || this.loading}
          @click=${(e: MouseEvent) => this.search(e)}
        >${enterText !== null ? html`<slot name="enter-button">${enterText}</slot>` : searchIcon()}</button>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ooa-search': OoaSearch; }
}
