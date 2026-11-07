// @ts-check
import { defineConfig } from 'astro/config';
import metaCsp from './integrations/meta-csp.mjs';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://andrewkigara.com',
  output: 'static',
  // /profile is served from profile.html, so links need no trailing slash
  // and GitHub Pages never has to redirect.
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
  integrations: [
    metaCsp({
      directives: [
        "default-src 'self'",
        "img-src 'self'",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    }),
  ],
});
