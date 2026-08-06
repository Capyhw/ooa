import { html } from 'lit';
import { render } from 'vitest-browser-lit';
import { expect, test } from 'vitest';
import './ooa-button.js';

test('renders a native button and respects disabled state', async () => {
  const screen = render(html`<ooa-button disabled>Save</ooa-button>`);
  await expect.element(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});
