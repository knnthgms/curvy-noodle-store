// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The production URL. Override with the SITE_URL environment variable on
// Cloudflare Pages (e.g. for preview deployments) without touching code.
const site = process.env.SITE_URL ?? 'https://thecurvynoodleshop.com';

export default defineConfig({
  site,
  // Fully static output — ideal for Cloudflare Pages (no adapter needed).
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
