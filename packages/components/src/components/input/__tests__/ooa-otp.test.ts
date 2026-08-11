import { expect, vi } from 'vitest';
import { OoaOtp } from '../ooa-otp.js';

function getCells(el: OoaOtp): HTMLInputElement[] {
  const cells = el.shadowRoot?.querySelectorAll('input');
  if (!cells || cells.length === 0) throw new Error('no OTP cells in shadow root');
  return Array.from(cells) as HTMLInputElement[];
}

/** 在第 index 格输入 txt（对位真实用户键入/粘贴）。 */
function typeCell(el: OoaOtp, index: number, txt: string): void {
  const cell = getCells(el)[index];
  cell.value = txt;
  cell.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

async function renderOtp(attrs: Record<string, unknown> = {}) {
  const el = document.createElement('ooa-otp') as OoaOtp;
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

describe('ooa-otp（对位 antd Input.OTP）', () => {
  it('渲染 length（缺省 6）个单格 input，容器 role=group', async () => {
    const el = await renderOtp();
    expect(getCells(el).length).toBe(6);
    const root = el.shadowRoot?.querySelector('.ooa-otp');
    expect(root?.getAttribute('role')).toBe('group');
  });

  it('单字符输入覆盖当前格 → value 更新', async () => {
    const el = await renderOtp();
    const inputSpy = vi.fn();
    el.addEventListener('ooa-input', inputSpy);
    typeCell(el, 0, 'A');
    await el.updateComplete;
    expect(el.value).toBe('A');
    expect(getCells(el)[0].value).toBe('A');
    expect(inputSpy).toHaveBeenCalledTimes(1);
    expect(inputSpy.mock.calls[0][0].detail.value).toBe('A');
  });

  it('粘贴多字符从当前格起分发（patchCells）', async () => {
    const el = await renderOtp();
    typeCell(el, 0, 'ABC');
    await el.updateComplete;
    expect(el.value).toBe('ABC');
    const cells = getCells(el);
    expect(cells[0].value).toBe('A');
    expect(cells[1].value).toBe('B');
    expect(cells[2].value).toBe('C');
  });

  it('未填满只派发 ooa-input；全格填满且变化才派发 ooa-change', async () => {
    const el = await renderOtp();
    const changeSpy = vi.fn();
    el.addEventListener('ooa-change', changeSpy);
    for (let i = 0; i < 5; i += 1) {
      typeCell(el, i, String.fromCharCode(65 + i));
      await el.updateComplete;
      expect(changeSpy).not.toHaveBeenCalled();
    }
    typeCell(el, 5, 'F');
    await el.updateComplete;
    expect(changeSpy).toHaveBeenCalledTimes(1);
    expect(changeSpy.mock.calls[0][0].detail.value).toBe('ABCDEF');
  });

  it('全格已满后输入相同字符不再触发 ooa-change（对位 antd some-changed）', async () => {
    const el = await renderOtp({ value: 'ABCDEF' });
    const changeSpy = vi.fn();
    el.addEventListener('ooa-change', changeSpy);
    typeCell(el, 0, 'A');
    await el.updateComplete;
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('formatter 对输入文本生效（转大写）', async () => {
    const el = await renderOtp();
    el.formatter = (text: string) => text.toUpperCase();
    typeCell(el, 0, 'a');
    await el.updateComplete;
    expect(el.value).toBe('A');
    expect(getCells(el)[0].value).toBe('A');
  });

  it('mask 字符串 → 覆盖层图标显示该字符，input 值仍为实际字符', async () => {
    const el = await renderOtp({ mask: '🔒' });
    el.value = 'AB';
    await el.updateComplete;
    const cell = getCells(el)[0];
    expect(cell.value).toBe('A');
    const maskIcon = cell.parentElement?.querySelector('.ooa-otp-mask-icon');
    expect(maskIcon?.textContent).toBe('🔒');
  });

  it('separator 在相邻格之间渲染', async () => {
    const el = await renderOtp({ separator: '/' });
    const separators = el.shadowRoot?.querySelectorAll('.ooa-otp-separator');
    expect(separators?.length).toBe(5);
    expect(separators?.[0]?.textContent).toBe('/');
  });

  it('ArrowRight 聚焦下一格（前格非空，对位 antd onInternalKeyDown）', async () => {
    const el = await renderOtp();
    el.value = 'A'; // 填满 cell 0，避免 handleFocus 跳回第一个空格（对位 antd onInputFocus）
    await el.updateComplete;
    const cells = getCells(el);
    cells[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    // document.activeElement 返回 shadow host；内部焦点在 host.shadowRoot.activeElement
    expect(el.shadowRoot?.activeElement).toBe(cells[1]);
  });

  it('空当前格 Backspace 聚焦上一格', async () => {
    const el = await renderOtp();
    const cells = getCells(el);
    cells[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(el.shadowRoot?.activeElement).toBe(cells[0]);
  });
});
