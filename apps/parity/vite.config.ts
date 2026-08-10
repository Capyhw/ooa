import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ooa/components': fileURLToPath(new URL('../../packages/components/src/index.ts', import.meta.url)),
      '@ooa/tokens/theme.css': fileURLToPath(new URL('../../packages/tokens/src/theme.css', import.meta.url)),
      '@ooa/tokens': fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 7857,
  },
});
