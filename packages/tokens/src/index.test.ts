import { expect, test } from 'vitest';
import { lightTheme, themeToCssVariables } from './index.js';

test('serializes semantic tokens as OOA CSS variables', () => {
  expect(themeToCssVariables(lightTheme)).toMatchObject({
    '--ooa-color-primary': '#1677ff',
    '--ooa-border-radius': '6px',
  });
});
