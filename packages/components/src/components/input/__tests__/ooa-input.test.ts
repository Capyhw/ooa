import { expect, vi } from 'vitest';
import { OoaConfigProvider } from '../../../config/ooa-config-provider.js';
import { OoaInput } from '../ooa-input.js';

function getInput(el: OoaInput): HTMLInputElement {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) throw new Error('no <input> in shadow root');
  return input as HTMLInputElement;
}

function getWrapper(el: OoaInput): HTMLElement {
  const wrapper = el.shadowRoot?.querySelector('.ooa-input-affix-wrapper');
  if (!wrapper) throw new Error('no affix wrapper in shadow root');
  return wrapper as HTMLElement;
}

function getClearButton(el: OoaInput): HTMLButtonElement {
  const btn = el.shadowRoot?.querySelector('.ooa-input-clear-icon');
  if (!btn) throw new Error('no clear button in shadow root');
  return btn as HTMLButtonElement;
}

/**
 * 命令式创建元素 + setAttribute（lit 3 不支持字符串属性展开）。
 * value 是 property（不 reflect），单独设置。
 */
async function renderInput(attrs: Record<string, unknown> = {}) {
  const el = document.createElement('ooa-input') as OoaInput;
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

describe('裸分支（无 affix）——直接渲染 input，类名对齐 antd', () => {
  it('默认 outlined，无 wrapper', async () => {
    const el = await renderInput();
    expect(el.shadowRoot?.querySelector('.ooa-input-affix-wrapper')).toBeNull();
    const input = getInput(el);
    expect(input.classList.contains('ooa-input')).toBe(true);
    expect(input.classList.contains('ooa-input-outlined')).toBe(true);
  });
  it('variant / status 类落在 input 上', async () => {
    const el = await renderInput({ variant: 'filled', status: 'error' });
    const input = getInput(el);
    expect(input.classList.contains('ooa-input-filled')).toBe(true);
    expect(input.classList.contains('ooa-input-status-error')).toBe(true);
  });
  it('size → -sm/-lg 类', async () => {
    expect(getInput(await renderInput({ size: 'small' })).classList.contains('ooa-input-sm')).toBe(true);
    expect(getInput(await renderInput({ size: 'large' })).classList.contains('ooa-input-lg')).toBe(true);
    expect(getInput(await renderInput()).classList.contains('ooa-input-sm')).toBe(false);
  });
  it('disabled / readonly 透传到 input', async () => {
    const el = await renderInput({ disabled: true, readonly: true });
    const input = getInput(el);
    expect(input.disabled).toBe(true);
    expect(input.readOnly).toBe(true);
    expect(input.classList.contains('ooa-input-disabled')).toBe(true);
  });
  it('max-length / placeholder / name / type 透传到内部 input', async () => {
    const el = await renderInput({ 'max-length': 10, placeholder: 'Type', name: 'field', type: 'email' });
    const input = getInput(el);
    expect(input.getAttribute('maxlength')).toBe('10');
    expect(input.getAttribute('placeholder')).toBe('Type');
    expect(input.getAttribute('name')).toBe('field');
    expect(input.getAttribute('type')).toBe('email');
  });
});

describe('affix 分支——wrapper 结构与类名对齐 antd', () => {
  it('allowClear → wrapper + clear 按钮，空值 hidden', async () => {
    const el = await renderInput({ 'allow-clear': true });
    const wrapper = getWrapper(el);
    expect(wrapper.classList.contains('ooa-input-affix-wrapper')).toBe(true);
    expect(wrapper.classList.contains('ooa-input-outlined')).toBe(true);
    // antd 的 inner input 不带 variant 类（变体类只在 wrapper 上）
    expect(getInput(el).classList.contains('ooa-input-outlined')).toBe(false);
    expect(getClearButton(el).classList.contains('ooa-input-clear-icon-hidden')).toBe(true);
  });
  it('allowClear + 有值 → clear 可见；无 suffix 时无 -input-with-clear-btn（对位 antd：suffix && allowClear && value）', async () => {
    const el = await renderInput({ 'allow-clear': true, value: 'Parity check' });
    expect(getClearButton(el).classList.contains('ooa-input-clear-icon-hidden')).toBe(false);
    expect(getWrapper(el).classList.contains('ooa-input-affix-wrapper-input-with-clear-btn')).toBe(false);
    expect(getWrapper(el).querySelector('.ooa-input-clear-icon svg')).not.toBeNull(); // CloseCircleFilled
  });
  it('showCount + allowClear + 有值 → -input-with-clear-btn（count suffix 也算 suffix）', async () => {
    const el = await renderInput({ 'allow-clear': true, 'show-count': true, value: 'Parity check' });
    expect(getWrapper(el).classList.contains('ooa-input-affix-wrapper-input-with-clear-btn')).toBe(true);
  });
  it('showCount + maxLength → 计数后缀 `0 / 32`', async () => {
    const el = await renderInput({ 'show-count': true, 'max-length': 32 });
    const suffix = getWrapper(el).querySelector('.ooa-input-show-count-suffix');
    expect(suffix?.textContent).toBe('0 / 32');
  });
  it('showCount 有值时计数跟随 value', async () => {
    const el = await renderInput({ 'show-count': true, 'max-length': 10, value: 'abc' });
    expect(getWrapper(el).querySelector('.ooa-input-show-count-suffix')?.textContent).toBe('3 / 10');
  });
  it('affix 分支 size 类在 wrapper 上（-affix-wrapper-sm/lg）', async () => {
    const el = await renderInput({ 'allow-clear': true, size: 'small' });
    expect(getWrapper(el).classList.contains('ooa-input-affix-wrapper-sm')).toBe(true);
    expect(getInput(el).classList.contains('ooa-input-sm')).toBe(true);
  });
  it('status error 落在 wrapper 上', async () => {
    const el = await renderInput({ 'allow-clear': true, status: 'error' });
    expect(getWrapper(el).classList.contains('ooa-input-status-error')).toBe(true);
  });
});

describe('行为：受控值 + 事件', () => {
  it('输入触发 ooa-change，detail.value 为最新值', async () => {
    const el = await renderInput();
    const spy = vi.fn();
    el.addEventListener('ooa-change', spy);
    const input = getInput(el);
    input.value = 'hello';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.value).toBe('hello');
    expect(el.value).toBe('hello');
  });
  it('clear 点击清空 + 触发 ooa-change("")', async () => {
    const el = await renderInput({ 'allow-clear': true, value: 'abc' });
    const spy = vi.fn();
    el.addEventListener('ooa-change', spy);
    getClearButton(el).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.value).toBe('');
    expect(getInput(el).value).toBe('');
  });
  it('disabled 时 clear 按钮 hidden（needClear=false）', async () => {
    const el = await renderInput({ 'allow-clear': true, value: 'abc', disabled: true });
    expect(getClearButton(el).classList.contains('ooa-input-clear-icon-hidden')).toBe(true);
  });
});

describe('IME 组合期间不触发 change（对位 rc-input compositionRef）', () => {
  it('compositionstart → input 不发 change，compositionend 补发', async () => {
    const el = await renderInput();
    const spy = vi.fn();
    el.addEventListener('ooa-change', spy);
    const input = getInput(el);
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    input.value = '测试';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(spy).not.toHaveBeenCalled();
    input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.value).toBe('测试');
  });
});

describe('out-of-range（对位 rc-input isOutOfRange）', () => {
  it('showCount + maxLength 超长 → -out-of-range', async () => {
    const el = await renderInput({ 'show-count': true, 'max-length': 3, value: 'abcd' });
    expect(getWrapper(el).classList.contains('ooa-input-out-of-range')).toBe(true);
  });
  it('未超长 → 无 -out-of-range', async () => {
    const el = await renderInput({ 'show-count': true, 'max-length': 3, value: 'ab' });
    expect(getWrapper(el).classList.contains('ooa-input-out-of-range')).toBe(false);
  });
});

/** 在 ooa-config-provider 下渲染（全局方向经 Lit context 下发，对位 antd ConfigProvider）。 */
async function renderWithDirection(attrs: Record<string, unknown>, direction: 'ltr' | 'rtl') {
  const provider = document.createElement('ooa-config-provider') as OoaConfigProvider;
  provider.setAttribute('direction', direction);
  const el = document.createElement('ooa-input') as OoaInput;
  for (const [k, v] of Object.entries(attrs)) {
    if (typeof v === 'boolean') {
      if (v) el.setAttribute(k, '');
    } else {
      el.setAttribute(k, String(v));
    }
  }
  provider.appendChild(el);
  document.body.appendChild(provider);
  await provider.updateComplete;
  await el.updateComplete;
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  return el;
}

describe('全局方向 RTL（对位 antd ConfigProvider direction）', () => {
  it('裸分支 input 带 ooa-input-rtl 类', async () => {
    const el = await renderWithDirection({}, 'rtl');
    expect(getInput(el).classList.contains('ooa-input-rtl')).toBe(true);
  });
  it('affix 分支 wrapper 带 ooa-input-affix-wrapper-rtl 类', async () => {
    const el = await renderWithDirection({ 'allow-clear': true }, 'rtl');
    expect(getWrapper(el).classList.contains('ooa-input-affix-wrapper-rtl')).toBe(true);
  });
});

describe('prefix / suffix 经 light DOM slot 驱动 affix 分支（对位 antd prefix/suffix props）', () => {
  it('prefix slot → affix wrapper + ooa-input-prefix span，slot 分配 light DOM 节点', async () => {
    const el = await renderInput();
    const prefix = document.createElement('span');
    prefix.slot = 'prefix';
    prefix.textContent = '👤';
    el.appendChild(prefix);
    await el.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const wrapper = getWrapper(el);
    const prefixSpan = wrapper.querySelector('.ooa-input-prefix');
    expect(prefixSpan).toBeTruthy();
    // 被分配节点保留在宿主 light DOM，经 slot 进入 shadow（对位 antd prefix 渲染）
    const slot = prefixSpan?.querySelector('slot');
    expect(slot?.assignedNodes().includes(prefix)).toBe(true);
  });
  it('suffix slot → ooa-input-suffix span', async () => {
    const el = await renderInput();
    const suffix = document.createElement('span');
    suffix.slot = 'suffix';
    suffix.textContent = 'RMB';
    el.appendChild(suffix);
    await el.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(getWrapper(el).querySelector('.ooa-input-suffix')).toBeTruthy();
  });
});
