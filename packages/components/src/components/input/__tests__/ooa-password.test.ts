import { expect, vi } from 'vitest';
import { OoaPassword } from '../ooa-password.js';

function getInput(el: OoaPassword): HTMLInputElement {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) throw new Error('no <input> in shadow root');
  return input as HTMLInputElement;
}

function getIcon(el: OoaPassword): HTMLElement {
  const icon = el.shadowRoot?.querySelector('.ooa-input-password-icon');
  if (!icon) throw new Error('no password icon in shadow root');
  return icon as HTMLElement;
}

async function renderPassword(attrs: Record<string, unknown> = {}) {
  const el = document.createElement('ooa-password') as OoaPassword;
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

describe('Password 结构（对位 antd Input.Password）', () => {
  it('type=password + ooa-input-password 类在 wrapper 上 + eye 图标', async () => {
    const el = await renderPassword();
    expect(getInput(el).getAttribute('type')).toBe('password');
    const wrapper = el.shadowRoot?.querySelector('.ooa-input-affix-wrapper');
    expect(wrapper?.classList.contains('ooa-input-password')).toBe(true);
    expect(getIcon(el)).not.toBeNull();
  });
  it('点击 eye 切换 type=text 与图标', async () => {
    const el = await renderPassword();
    const icon = getIcon(el);
    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(getInput(el).getAttribute('type')).toBe('text');
    expect(icon.getAttribute('aria-pressed')).toBe('true');
    // 再点切回 password
    getIcon(el).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(getInput(el).getAttribute('type')).toBe('password');
  });
  it('visibility-toggle=false → 无 eye 图标（布尔 false 无法用属性表达，走 property）', async () => {
    const el = await renderPassword();
    el.visibilityToggle = false;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.ooa-input-password-icon')).toBeNull();
  });
  it('disabled → tabindex=-1，点击不切换', async () => {
    const el = await renderPassword({ disabled: true });
    expect(getIcon(el).getAttribute('tabindex')).toBe('-1');
    getIcon(el).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(getInput(el).getAttribute('type')).toBe('password');
  });
  it('键盘 Enter/Space 切换可见性', async () => {
    const el = await renderPassword();
    getIcon(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await el.updateComplete;
    expect(getInput(el).getAttribute('type')).toBe('text');
  });
  it('切换类型不触发 ooa-change', async () => {
    const el = await renderPassword({ value: 'secret' });
    const spy = vi.fn();
    el.addEventListener('ooa-change', spy);
    getIcon(el).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(spy).not.toHaveBeenCalled();
    expect(el.value).toBe('secret');
  });
  it('输入触发 ooa-change（继承受控逻辑）', async () => {
    const el = await renderPassword({ value: 'secret' });
    const spy = vi.fn();
    el.addEventListener('ooa-change', spy);
    const input = getInput(el);
    input.value = 'newpass';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(spy.mock.calls[0][0].detail.value).toBe('newpass');
  });
});
