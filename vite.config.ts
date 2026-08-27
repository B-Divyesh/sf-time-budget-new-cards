import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(projectRoot, 'index.html'),
        privacy: resolve(projectRoot, 'privacy/index.html'),
        terms: resolve(projectRoot, 'terms/index.html'),
      },
    },
  },
});
