import { defineConfig, type Plugin } from 'vite';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

const staticPrecache = [
  '/',
  '/index.html',
  '/privacy/',
  '/privacy/index.html',
  '/terms/',
  '/terms/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/art/study-tape.webp',
  '/art/study-tape.avif',
  '/art/study-tape.png',
];

function serviceWorkerPrecache(): Plugin {
  return {
    name: 'service-worker-precache',
    closeBundle() {
      const outputDirectory = resolve(projectRoot, 'dist');
      const emittedAppAssets = readdirSync(resolve(outputDirectory, 'assets'))
        .filter((fileName) => /\.(?:css|js)$/.test(fileName))
        .map((fileName) => `/assets/${fileName}`)
        .sort();
      const precache = [...staticPrecache, ...emittedAppAssets];
      const outputPath = (path: string): string => {
        if (path === '/' || path === '/index.html') return resolve(outputDirectory, 'index.html');
        if (path === '/privacy/' || path === '/privacy/index.html') return resolve(outputDirectory, 'privacy/index.html');
        if (path === '/terms/' || path === '/terms/index.html') return resolve(outputDirectory, 'terms/index.html');
        return resolve(outputDirectory, path.slice(1));
      };
      const revision = createHash('sha256')
        .update(readFileSync(resolve(projectRoot, 'src/sw-template.js')))
        .update(precache.join('\n'))
        .update(Buffer.concat(precache.map((path) => readFileSync(outputPath(path)))))
        .digest('hex')
        .slice(0, 12);
      const template = readFileSync(resolve(projectRoot, 'src/sw-template.js'), 'utf8');
      writeFileSync(resolve(outputDirectory, 'sw.js'), template
        .replace('__BUILD_ID__', `study-tape-${revision}`)
        .replace('__PRECACHE__', JSON.stringify(precache)));
    },
  };
}

export default defineConfig({
  plugins: [serviceWorkerPrecache()],
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
