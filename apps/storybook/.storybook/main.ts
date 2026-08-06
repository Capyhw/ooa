import type { StorybookConfig } from '@storybook/web-components-vite';
import { fileURLToPath, URL } from 'node:url';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  stories: ['../stories/**/*.stories.ts'],
  viteFinal: async (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@ooa/components': fileURLToPath(new URL('../../../packages/components/src/index.ts', import.meta.url)),
      '@ooa/tokens/theme.css': fileURLToPath(new URL('../../../packages/tokens/src/theme.css', import.meta.url)),
      '@ooa/tokens': fileURLToPath(new URL('../../../packages/tokens/src/index.ts', import.meta.url)),
    };
    return config;
  },
};

export default config;
