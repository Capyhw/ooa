import { html } from 'lit';
import { expect } from 'vitest';
import { fixture } from '../../../testing/fixture.js';
import '../ooa-button.js';
import '../button-group.js';

/** 取组内第 index 个按钮的 .ooa-btn（shadow 内 button/a）。 */
function getBtn(group: HTMLElement, index: number): HTMLElement {
  const btn = group.querySelectorAll('ooa-button')[index]?.shadowRoot?.querySelector('.ooa-btn');
  if (!btn) throw new Error(`no .ooa-btn at index ${index}`);
  return btn as HTMLElement;
}

async function waitSettled(el: HTMLElement): Promise<void> {
  await (el as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
}

describe('ooa-button-group', () => {
  it('渲染 .ooa-btn-group 容器', async () => {
    const el = await fixture(html`<ooa-button-group><ooa-button>1</ooa-button></ooa-button-group>`);
    expect(el.shadowRoot?.querySelector('.ooa-btn-group')).not.toBeNull();
  });

  it('组内按钮继承 group size（size 解析链 props → group → config）', async () => {
    const el = await fixture(html`
      <ooa-button-group size="small">
        <ooa-button>1</ooa-button>
        <ooa-button type="primary">2</ooa-button>
      </ooa-button-group>`);
    await waitSettled(el);
    expect(getBtn(el, 0).classList.contains('ooa-btn-sm')).toBe(true);
    expect(getBtn(el, 1).classList.contains('ooa-btn-sm')).toBe(true);
  });

  it('显式 size 优先于 group size', async () => {
    const el = await fixture(html`
      <ooa-button-group size="small">
        <ooa-button size="large">1</ooa-button>
      </ooa-button-group>`);
    await waitSettled(el);
    expect(getBtn(el, 0).classList.contains('ooa-btn-lg')).toBe(true);
  });

  it('相邻按钮负 margin 合并边框（-lineWidth，margin 加在宿主上）', async () => {
    const el = await fixture(html`
      <ooa-button-group>
        <ooa-button>1</ooa-button>
        <ooa-button>2</ooa-button>
      </ooa-button-group>`);
    await waitSettled(el);
    const host2 = el.querySelectorAll('ooa-button')[1];
    expect(parseFloat(getComputedStyle(host2).marginInlineStart)).toBe(-1); // -lineWidth
  });

  it('非首/末按钮圆角清零', async () => {
    const el = await fixture(html`
      <ooa-button-group>
        <ooa-button>1</ooa-button>
        <ooa-button>2</ooa-button>
        <ooa-button>3</ooa-button>
      </ooa-button-group>`);
    await waitSettled(el);
    const first = getBtn(el, 0);
    const middle = getBtn(el, 1);
    const last = getBtn(el, 2);
    // 中间按钮左右圆角均 0
    expect(parseFloat(getComputedStyle(middle).borderStartStartRadius)).toBe(0);
    expect(parseFloat(getComputedStyle(middle).borderEndEndRadius)).toBe(0);
    // 首按钮右圆角 0、末按钮左圆角 0
    expect(parseFloat(getComputedStyle(first).borderEndEndRadius)).toBe(0);
    expect(parseFloat(getComputedStyle(last).borderStartStartRadius)).toBe(0);
  });
});
