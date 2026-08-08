import { render, type TemplateResult } from 'lit';

/**
 * 最小 fixture：把 template 渲染进 document.body，等待 Lit 首轮更新完成，返回首个元素。
 * 替代 @open-wc/testing（其内部 import web-dev-server socket，与 Vitest browser mode 不兼容）。
 */
export async function fixture(template: TemplateResult): Promise<HTMLElement> {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(template, host);
  const el = host.firstElementChild as (HTMLElement & { updateComplete?: Promise<unknown> }) | null;
  if (el && 'updateComplete' in el) {
    await el.updateComplete;
  }
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  return el as HTMLElement;
}

/**
 * 触发一次元素更新（改属性/状态后调用），等待 Lit 完成重渲染。
 */
export async function update(el: HTMLElement): Promise<void> {
  await (el as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
}
