import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@ooa/tokens/theme.css': fileURLToPath(new URL('../tokens/src/theme.css', import.meta.url)),
      '@ooa/tokens': fileURLToPath(new URL('../tokens/src/index.ts', import.meta.url)),
    },
  },
  build: {
    target: 'es2015',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['lit', 'lit/decorators.js', '@lit/context', '@ooa/tokens'],
    },
  },
});
