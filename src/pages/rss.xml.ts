import type { APIRoute } from 'astro';
import { SITE } from '@config';
import { getPublishedNotes, getPublishedPosts, notePath, noteExcerpt, postPath } from '@utils/collections';

/**
 * RSS feed of blog posts and Noodle Notes, newest first. Feed readers, search
 * engines and AI tools use it to discover new content quickly.
 */
const escapeXml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL(SITE.url)).origin;
  const [posts, notes] = await Promise.all([getPublishedPosts(), getPublishedNotes()]);

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      url: `${base}${postPath(post)}`,
      date: post.data.updated ?? post.data.date,
      description: post.data.description,
      categories: post.data.tags,
    })),
    ...notes.map((note) => ({
      title: note.data.title,
      url: `${base}${notePath(note)}`,
      date: note.data.date,
      description: noteExcerpt(note, 280),
      categories: note.data.tags,
    })),
  ].sort((a, b) => b.date.valueOf() - a.date.valueOf());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}: blog and Noodle Notes</title>
    <link>${base}/</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
${item.categories.map((category) => `      <category>${escapeXml(category)}</category>`).join('\n')}
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
