import type { APIRoute } from 'astro';
import { CATEGORIES, SITE } from '@config';
import {
  getProducts,
  getPublishedNotes,
  getPublishedPosts,
  notePath,
  postPath,
  productPath,
} from '@utils/collections';
import { formatPrice } from '@utils/format';

/**
 * /llms.txt: a plain-text, Markdown-style site summary for AI assistants and
 * answer engines (see llmstxt.org). It is generated from the content files, so
 * every new post, note and product appears here automatically.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL(SITE.url)).origin;
  const [posts, notes, products] = await Promise.all([
    getPublishedPosts(),
    getPublishedNotes(),
    getProducts(),
  ]);

  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    'Curvy Noodle is a small, India-based shop run by one person. Orders are placed by chatting on WhatsApp (no online checkout). The blog covers planners, bullet journals, stationery shopping and "plan with me" setups, with YouTube videos at https://www.youtube.com/@curvynoodle.',
    '',
    '## Blog (Planning Nook)',
    ...posts.map((post) => `- [${post.data.title}](${base}${postPath(post)}): ${post.data.description}`),
    '',
    '## Noodle Notes (short updates and stationery finds)',
    ...notes.map((note) => `- [${note.data.title}](${base}${notePath(note)})`),
    '',
    '## Shop (handmade planner stickers, prices in INR)',
    ...CATEGORIES.map((category) => `- [${category.label}](${base}/collections/${category.slug}/): ${category.description}`),
    ...products.map(
      (product) => `- [${product.data.title}](${base}${productPath(product)}): ${formatPrice(product.data.price)}. ${product.data.description}`,
    ),
    '',
    '## More',
    `- [About](${base}/about)`,
    `- [FAQs](${base}/faq)`,
    `- [Contact](${base}/contact)`,
    `- [RSS feed](${base}/rss.xml)`,
    `- [Sitemap](${base}/sitemap-index.xml)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
