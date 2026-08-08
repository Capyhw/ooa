import { html } from 'lit';
import { expect, vi } from 'vitest';
import { fixture } from '../../../testing/fixture.js';
import '../ooa-button.js';

function getButton(el: HTMLElement): HTMLButtonElement {
  const b = el.shadowRoot?.querySelector('button');
  if (!b) throw new Error('no <button> in shadow root');
  return b;
}

function getAnchor(el: HTMLElement): HTMLAnchorElement {
  const a = el.shadowRoot?.querySelector('a');
  if (!a) throw new Error('no <a> in shadow root');
  return a;
}

/**
 * 渲染 `<ooa-button>` 并设置属性。lit 3 不支持 `<tag ${attrString}>` 字符串
 * 属性展开（ElementPart 对字符串是 no-op），因此命令式创建元素 + setAttribute，
 * 复用 fixture 的等待语义（updateComplete + rAF）。
 */
async function renderButton(attrs: Record<string, unknown> = {}, text = '确定') {
  const el = document.createElement('ooa-button');
  for (const [k, v] of Object.entries(attrs)) {
    if (typeof v === 'boolean') {
      if (v) el.setAttribute(k, '');
    } else {
      el.setAttribute(k, String(v));
    }
  }
  el.textContent = text;
  document.body.appendChild(el);
  await (el as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  return el;
}

describe('variant / color 推导 → 类名（断言内部 button 的 class，对齐 antd DOM）', () => {
  it('type 语法糖映射', async () => {
    const el = await renderButton({ type: 'primary' });
    expect(getButton(el).classList.contains('ooa-btn-color-primary')).toBe(true);
    expect(getButton(el).classList.contains('ooa-btn-variant-solid')).toBe(true);
  });
  it('color+variant 双轴', async () => {
    const el = await renderButton({ color: 'red', variant: 'filled' });
    expect(getButton(el).classList.contains('ooa-btn-color-red')).toBe(true);
    expect(getButton(el).classList.contains('ooa-btn-variant-filled')).toBe(true);
  });
  it('danger → -color-dangerous', async () => {
    const el = await renderButton({ type: 'primary', danger: true });
    expect(getButton(el).classList.contains('ooa-btn-color-dangerous')).toBe(true);
  });
  it('ghost 把 solid 降级 outlined', async () => {
    const el = await renderButton({ type: 'primary', ghost: true });
    expect(getButton(el).classList.contains('ooa-btn-variant-outlined')).toBe(true);
    expect(getButton(el).classList.contains('ooa-btn-variant-solid')).toBe(false);
    expect(getButton(el).classList.contains('ooa-btn-background-ghost')).toBe(true);
  });
  it('text/link 不加 background-ghost', async () => {
    const el = await renderButton({ type: 'text', ghost: true });
    expect(getButton(el).classList.contains('ooa-btn-background-ghost')).toBe(false);
  });
  it('默认 outlined default', async () => {
    const el = await renderButton();
    expect(getButton(el).classList.contains('ooa-btn-color-default')).toBe(true);
    expect(getButton(el).classList.contains('ooa-btn-variant-outlined')).toBe(true);
  });
});

describe('计算样式走 --ooa-btn-* 变量', () => {
  it('danger+primary 实心红', async () => {
    const el = await renderButton({ type: 'primary', danger: true });
    const style = getComputedStyle(getButton(el));
    expect(style.backgroundColor).toBe('rgb(255, 77, 79)'); // colorError #ff4d4f
    expect(style.color).toBe('rgb(255, 255, 255)'); // textLightSolid
  });
  it('danger+text 文字为红', async () => {
    const el = await renderButton({ type: 'text', danger: true });
    expect(getComputedStyle(getButton(el)).color).toBe('rgb(255, 77, 79)');
  });
  it('solid 默认色文字由 color-contrast 推导', async () => {
    const el = await renderButton({ color: 'default', variant: 'solid' });
    expect(getComputedStyle(getButton(el)).color).toBe('rgb(255, 255, 255)'); // colorBgSolid 黑色 → 白字
  });
});

describe('形状 / 尺寸 / block', () => {
  it('shape 类', async () => {
    expect(getButton(await renderButton({ shape: 'circle' })).classList.contains('ooa-btn-circle')).toBe(true);
    expect(getButton(await renderButton({ shape: 'round' })).classList.contains('ooa-btn-round')).toBe(true);
    expect(getButton(await renderButton({ shape: 'square' })).classList.contains('ooa-btn-square')).toBe(false); // antd: square 无类
  });
  it('size → -sm/-lg 类（medium/middle 均无类）', async () => {
    expect(getButton(await renderButton({ size: 'small' })).classList.contains('ooa-btn-sm')).toBe(true);
    expect(getButton(await renderButton({ size: 'large' })).classList.contains('ooa-btn-lg')).toBe(true);
    expect(getButton(await renderButton({ size: 'medium' })).classList.contains('ooa-btn-sm')).toBe(false);
    expect(getButton(await renderButton({ size: 'medium' })).classList.contains('ooa-btn-lg')).toBe(false);
  });
  it('block', async () => {
    const el = await renderButton({ block: true });
    const btn = getButton(el);
    // getComputedStyle 返回解析后的 px（width:100% → 撑满容器），不能与 '100%' 字面量比较。
    expect(getComputedStyle(el).display).toBe('block'); // 宿主块级
    expect(parseFloat(getComputedStyle(btn).width)).toBe(
      parseFloat(getComputedStyle(document.body).width),
    ); // 按钮撑满容器宽度
  });
});

describe('disabled', () => {
  it('button disabled + 样式', async () => {
    const el = await renderButton({ disabled: true });
    const btn = getButton(el);
    expect(btn.disabled).toBe(true);
    expect(getComputedStyle(btn).cursor).toBe('not-allowed');
  });
});

describe('loading', () => {
  it('loading 时 aria-busy + -loading 类 + 默认 loading 图标', async () => {
    const el = await renderButton({ loading: true }, '');
    const btn = getButton(el);
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.classList.contains('ooa-btn-loading')).toBe(true);
    expect(el.shadowRoot?.querySelector('.ooa-btn-icon svg')).not.toBeNull();
  });
  it('loading-delay 延迟生效（假定时器）', async () => {
    // 只 fake setTimeout/clearTimeout，避免卡住 renderButton 里的 rAF
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const el = await renderButton({ loading: true, 'loading-delay': '200' }, '');
      expect(getButton(el).classList.contains('ooa-btn-loading')).toBe(false);
      vi.advanceTimersByTime(200);
      await (el as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
      expect(getButton(el).classList.contains('ooa-btn-loading')).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('icon / icon-only / icon-placement', () => {
  it('icon slot 存在且无默认内容 → icon-only 方钮', async () => {
    const el = await fixture(html`<ooa-button><span slot="icon">★</span></ooa-button>`);
    expect(getButton(el).classList.contains('ooa-btn-icon-only')).toBe(true);
    expect(el.shadowRoot?.querySelector('.ooa-btn-icon')).not.toBeNull();
  });
  it('icon-placement=end → -icon-end 类', async () => {
    const el = await renderButton({ 'icon-placement': 'end' }, '');
    expect(getButton(el).classList.contains('ooa-btn-icon-end')).toBe(true);
  });
});

describe('两汉字自动插空格', () => {
  it('单汉字文本命中 -two-chinese-chars', async () => {
    const el = await renderButton({}, '返回');
    expect(getButton(el).classList.contains('ooa-btn-two-chinese-chars')).toBe(true);
  });
  it('auto-insert-space=false 关闭（property 设置，布尔属性无法表达 false）', async () => {
    const el = await renderButton({}, '返回');
    (el as unknown as { autoInsertSpace: boolean }).autoInsertSpace = false;
    await (el as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
    expect(getButton(el).classList.contains('ooa-btn-two-chinese-chars')).toBe(false);
  });
});

describe('anchor 分支', () => {
  it('href → <a>，带 href/target，按钮外观生效', async () => {
    const el = await renderButton({ href: '/x', target: '_blank' }, 'Go');
    const a = getAnchor(el);
    expect(a.getAttribute('href')).toBe('/x');
    expect(a.getAttribute('target')).toBe('_blank');
    // anchor 复用按钮样式（.ooa-btn 标签无关选择器）
    expect(parseFloat(getComputedStyle(a).height)).toBe(32); // controlHeight
  });
  it('disabled 移除 href + aria-disabled + tabindex + -disabled 类', async () => {
    const el = await renderButton({ href: '/x', disabled: true }, 'Go');
    const a = getAnchor(el);
    expect(a.hasAttribute('href')).toBe(false);
    expect(a.getAttribute('aria-disabled')).toBe('true');
    expect(a.getAttribute('tabindex')).toBe('-1');
    expect(a.classList.contains('ooa-btn-disabled')).toBe(true);
  });
});

describe('点击阻断（对位 antd handleClick）', () => {
  it('loading 时 preventDefault', async () => {
    const el = await renderButton({ loading: true }, '');
    const btn = getButton(el);
    const e = new MouseEvent('click', { cancelable: true });
    btn.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
  });
  it('disabled 时 preventDefault', async () => {
    const el = await renderButton({ disabled: true }, '');
    const btn = getButton(el);
    const e = new MouseEvent('click', { cancelable: true });
    btn.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
  });
  it('正常状态不阻断', async () => {
    const el = await renderButton({}, '');
    const e = new MouseEvent('click', { cancelable: true });
    getButton(el).dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false);
  });
});
