import { expect, vi } from 'vitest';
import { OoaTextarea } from '../ooa-textarea.js';

function getTextarea(el: OoaTextarea): HTMLTextAreaElement {
  const ta = el.shadowRoot?.querySelector('textarea');
  if (!ta) throw new Error('no <textarea> in shadow root');
  return ta as HTMLTextAreaElement;
}

function getWrapper(el: OoaTextarea): HTMLElement {
  const wrapper = el.shadowRoot?.querySelector('.ooa-input-affix-wrapper');
  if (!wrapper) throw new Error('no affix wrapper in shadow root');
  return wrapper as HTMLElement;
}

async function renderTextarea(attrs: Record<string, unknown> = {}) {
  const el = document.createElement('ooa-textarea') as OoaTextarea;
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
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  return el;
}

describe('裸分支（无 showCount/allowClear）', () => {
  it('直接渲染 textarea，variant/状态类在 textarea 上', async () => {
    const el = await renderTextarea();
    expect(el.shadowRoot?.querySelector('.ooa-input-affix-wrapper')).toBeNull();
    const ta = getTextarea(el);
    expect(ta.classList.contains('ooa-input')).toBe(true);
    expect(ta.classList.contains('ooa-input-outlined')).toBe(true);
  });
  it('rows / maxlength / placeholder 透传', async () => {
    const el = await renderTextarea({ rows: 5, 'max-length': 120, placeholder: 'Note' });
    const ta = getTextarea(el);
    expect(ta.getAttribute('rows')).toBe('5');
    expect(ta.getAttribute('maxlength')).toBe('120');
    expect(ta.getAttribute('placeholder')).toBe('Note');
  });
  it('输入触发 ooa-change', async () => {
    const el = await renderTextarea();
    const spy = vi.fn();
    el.addEventListener('ooa-change', spy);
    const ta = getTextarea(el);
    ta.value = 'hello';
    ta.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(spy.mock.calls[0][0].detail.value).toBe('hello');
  });
});

describe('affix 分支（showCount / allowClear）', () => {
  it('showCount → wrapper + data-count，计数在 ooa-input-data-count', async () => {
    const el = await renderTextarea({ 'show-count': true, 'max-length': 120, value: 'ab' });
    const wrapper = getWrapper(el);
    expect(wrapper.classList.contains('ooa-input-textarea-affix-wrapper')).toBe(true);
    expect(wrapper.classList.contains('ooa-input-textarea-show-count')).toBe(true);
    expect(wrapper.getAttribute('data-count')).toBe('2 / 120');
    expect(wrapper.querySelector('.ooa-input-data-count')?.textContent).toBe('2 / 120');
  });
  it('allowClear → clear 按钮，空值 hidden', async () => {
    const el = await renderTextarea({ 'allow-clear': true });
    const btn = el.shadowRoot?.querySelector('.ooa-input-clear-icon') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.classList.contains('ooa-input-clear-icon-hidden')).toBe(true);
  });
  it('affix 分支内 textarea 不带 variant 类（对位 antd）', async () => {
    const el = await renderTextarea({ 'show-count': true });
    expect(getTextarea(el).classList.contains('ooa-input-outlined')).toBe(false);
  });
  it('status error 落在 wrapper 上', async () => {
    const el = await renderTextarea({ 'show-count': true, status: 'error' });
    expect(getWrapper(el).classList.contains('ooa-input-status-error')).toBe(true);
  });
  it('超长 → wrapper -out-of-range', async () => {
    const el = await renderTextarea({ 'show-count': true, 'max-length': 3, value: 'abcd' });
    expect(getWrapper(el).classList.contains('ooa-input-out-of-range')).toBe(true);
  });
});

describe('autoSize（布尔形式）', () => {
  it('输入后按 scrollHeight 撑高', async () => {
    const el = await renderTextarea({ 'auto-size': true });
    const ta = getTextarea(el);
    ta.value = 'a'.repeat(200);
    ta.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await el.updateComplete;
    const height = parseFloat(ta.style.height);
    expect(height).toBeGreaterThan(0);
  });
});
