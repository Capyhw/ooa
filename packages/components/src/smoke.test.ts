import { html } from 'lit';
import { fixture } from './testing/fixture.js';

it('冒烟：browser mode + 本地 fixture 可用', async () => {
  const el = await fixture(html`<div>smoke</div>`);
  expect(el.textContent).toBe('smoke');
});
