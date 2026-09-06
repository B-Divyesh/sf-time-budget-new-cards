import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const configPath = fileURLToPath(new URL('../public/staticwebapp.config.json', import.meta.url));
const config = JSON.parse(readFileSync(configPath, 'utf8')) as {
  globalHeaders: Record<string, string>;
  routes: Array<{ route: string; headers: Record<string, string> }>;
  responseOverrides: Record<string, { rewrite: string }>;
  mimeTypes: Record<string, string>;
};

describe('static deployment policy', () => {
  it('makes hashed assets immutable while the service worker revalidates', () => {
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers['Cache-Control'])
      .toBe('public, max-age=31536000, immutable');
    expect(config.routes.find((route) => route.route === '/sw.js')?.headers['Cache-Control'])
      .toBe('no-cache, must-revalidate');
  });

  it('ships restrictive browser security headers', () => {
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['Content-Security-Policy']).toContain("script-src 'self'");
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  });

  it('serves a designed 404 and the manifest with its standard MIME type', () => {
    expect(config.responseOverrides['404']?.rewrite).toBe('/404.html');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.routes.find((route) => route.route === '/manifest.webmanifest')?.headers['Content-Type'])
      .toContain('application/manifest+json');
  });
});
