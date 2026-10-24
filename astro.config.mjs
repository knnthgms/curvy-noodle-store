// @ts-check
import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The production URL. Override with the SITE_URL environment variable on
// Cloudflare Pages (e.g. for preview deployments) without touching code.
const site = process.env.SITE_URL ?? 'https://curvynoodle.com';

/**
 * Last-modified dates for the sitemap, read from blog and note frontmatter, so search
 * engines know when content changed. A post's `updated` date wins over its `date`.
 */
const lastModified = new Map();
for (const [folder, urlBase] of [['blog', 'blog'], ['notes', 'notes']]) {
  const dir = new URL(`./src/content/${folder}/`, import.meta.url);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const text = fs.readFileSync(new URL(name, dir), 'utf8');
    const date = /^updated:\s*(\S+)/m.exec(text)?.[1] ?? /^date:\s*(\S+)/m.exec(text)?.[1];
    if (date) lastModified.set(`/${urlBase}/${name.slice(0, -3).toLowerCase()}/`, new Date(date).toISOString());
  }
}

export default defineConfig({
  site,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/go/') && !page.includes('/admin'),
      serialize(item) {
        const lastmod = lastModified.get(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
