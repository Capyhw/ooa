import { createContext, provide } from '@lit/context';
import { LitElement, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { OoaSize } from '../../config/context.js';
import { buttonGroupStyles } from './style/group.js';

/** 组大小上下文：组内按钮 size 解析链（props → group → config）消费它。 */
export const groupSizeContext = createContext<OoaSize | undefined>('ooa-button-group-size');

/**
 * 按钮组（对位 antd ButtonGroup.tsx）：渲染 .ooa-btn-group 容器，经 @lit/context
 * 向组内按钮下发 size（对位 antd GroupSizeContext.Provider）。
 */
@customElement('ooa-button-group')
export class OoaButtonGroup extends LitElement {
  @property({ reflect: true }) size: OoaSize | undefined = undefined;

  @provide({ context: groupSizeContext })
  @property({ attribute: false })
  protected groupSize: OoaSize | undefined = undefined;

  static styles = buttonGroupStyles;

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('size')) this.groupSize = this.size;
  }

  override render() {
    return html`<span class="ooa-btn-group"><slot></slot></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ooa-button-group': OoaButtonGroup; }
}
