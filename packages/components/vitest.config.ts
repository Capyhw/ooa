import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
// Vitest v4：browser provider 改为 factory 形式（字符串 'playwright' 已废弃）
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  resolve: {
    alias: {
      '@ooa/tokens/theme.css': fileURLToPath(new URL('../tokens/src/theme.css', import.meta.url)),
      '@ooa/tokens': fileURLToPath(new URL('../tokens/src/index.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    include: ['src/**/*.test.ts'],
  },
});
