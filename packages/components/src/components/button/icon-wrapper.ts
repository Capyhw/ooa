import { html, type TemplateResult } from 'lit';

/**
 * 图标包装（对位 antd IconWrapper.tsx）：渲染 `.ooa-btn-icon` span，
 * 供间距控制（icon-gap）与语义化 `part="icon"` 定制。
 */
export function iconWrapper(content: TemplateResult, className = ''): TemplateResult {
  return html`<span class="ooa-btn-icon ${className}" part="icon">${content}</span>`;
}
