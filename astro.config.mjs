// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The production URL. Override with the SITE_URL environment variable on
// Cloudflare Pages (e.g. for preview deployments) without touching code.
const site = process.env.SITE_URL ?? 'https://curvynoodle.com';

export default defineConfig({
  site,
  // Fully static output — ideal for Cloudflare Pages (no adapter needed).
  output: 'static',
  integrations: [
    // Exclude the internal WhatsApp redirect from the sitemap.
    sitemap({ filter: (page) => !page.includes('/go/') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
