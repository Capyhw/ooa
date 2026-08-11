import { expect, vi } from 'vitest';
import { OoaInput } from '../ooa-input.js';
import { OoaSearch } from '../ooa-search.js';

function getInnerInput(el: OoaSearch): HTMLInputElement {
  const host = el.shadowRoot?.querySelector('ooa-input');
  if (!host) throw new Error('no inner <ooa-input> in shadow root');
  const input = (host as OoaInput).shadowRoot?.querySelector('input');
  if (!input) throw new Error('no <input> in inner shadow root');
  return input as HTMLInputElement;
}

function getButton(el: OoaSearch): HTMLButtonElement {
  const btn = el.shadowRoot?.querySelector('.ooa-search-btn');
  if (!btn) throw new Error('no search button in shadow root');
  return btn as HTMLButtonElement;
}

async function renderSearch(attrs: Record<string, unknown> = {}) {
  const el = document.createElement('ooa-search') as OoaSearch;
  const { value, ...rest } = attrs;
  for (const [k, v] of Object.entries(rest)) {
    if (typeof v === 'boolean') {
      if (v) el.setAttribute(k, '');
    } else {
      el.setAttribute(k, String(v));
    }
  }
  if (value !== undefined) el.value = String(value);
  document.body.appendChild(el);
  await el.updateComplete;
  // 内层 ooa-input 是子自定义元素，等它完成首轮渲染
  const host = el.shadowRoot?.querySelector('ooa-input') as OoaInput | undefined;
  if (host && 'updateComplete' in host) await host.updateComplete;
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  return el;
}

describe('ooa-search（对位 antd Input.Search）', () => {
  it('内层输入透传 ooa-change，detail.value 为最新值', async () => {
    const el = await renderSearch();
    const spy = vi.fn();
    el.addEventListener('ooa-change', spy);
    const input = getInnerInput(el);
    input.value = 'hello';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.value).toBe('hello');
    expect(el.value).toBe('hello');
  });

  it('Enter 触发 ooa-search，detail.value 为当前值', async () => {
    const el = await renderSearch({ value: 'keyword' });
    const spy = vi.fn();
    el.addEventListener('ooa-search', spy);
    const host = el.shadowRoot?.querySelector('ooa-input') as HTMLElement;
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.value).toBe('keyword');
  });

  it('按钮点击触发 ooa-search', async () => {
    const el = await renderSearch({ value: 'click' });
    const spy = vi.fn();
    el.addEventListener('ooa-search', spy);
    getButton(el).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.value).toBe('click');
  });

  it('loading → 按钮禁用（原生 disabled 抑制用户点击，对位 antd loading）', async () => {
    const el = await renderSearch({ loading: true, value: 'x' });
    const btn = getButton(el);
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('disabled → 内层 input 与按钮均禁用', async () => {
    const el = await renderSearch({ disabled: true });
    expect(getInnerInput(el).disabled).toBe(true);
    expect(getButton(el).disabled).toBe(true);
  });

  it('缺省 enterButton → 搜索图标（svg），布尔 enterButton → 搜索图标', async () => {
    const el = await renderSearch();
    expect(getButton(el).querySelector('svg')).toBeTruthy();
    const el2 = await renderSearch({ 'enter-button': true });
    expect(getButton(el2).querySelector('svg')).toBeTruthy();
  });

  it('字符串 enterButton → 按钮显示该文本', async () => {
    const el = await renderSearch({ 'enter-button': 'Search' });
    expect(getButton(el).textContent).toBe('Search');
  });
});
