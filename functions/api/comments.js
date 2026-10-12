// Cloudflare Pages Function: anonymous comments for blog posts and Noodle Notes.
//
// Setup (Cloudflare dashboard, see README → "Comments"):
//   KV namespace binding  COMMENTS             — stores the comments
//   Secret                COMMENTS_ADMIN_TOKEN — lets you list and delete comments
//
// Endpoints (all under /api/comments):
//   GET    ?slug=notes/my-note        → comments for one page (public)
//   POST   {slug, name, message}      → add a comment (public, rate limited)
//   GET    ?all=1                     → recent comments on every page (admin token)
//   DELETE ?slug=...&id=...           → remove a comment (admin token)
//
// Comments for a page live in one KV value (`comments:<slug>`) as a JSON array.

const SLUG_PATTERN = /^(blog|notes)\/[a-z0-9][a-z0-9-]*$/;
const NAME_MAX = 40;
const MESSAGE_MAX = 1000;
const MAX_COMMENTS_PER_PAGE = 300;
const RATE_LIMIT_SECONDS = 60; // KV's minimum TTL
// Blocks pasted links. Short endings like ".in" are left out so ordinary
// sentences that miss a space after a full stop ("love it.In the...") still work.
const URL_PATTERN = /https?:\/\/|www\.|[a-z0-9-]{2,}\.(com|net|org|ru|xyz|shop|site|online|top|biz)\b/i;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

const clean = (value, max) =>
  String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);

async function shortHash(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isAdmin(request, env) {
  const expected = env.COMMENTS_ADMIN_TOKEN;
  const header = request.headers.get('Authorization') ?? '';
  const given = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  }
  return diff === 0;
}

async function readComments(env, slug) {
  const stored = await env.COMMENTS.get(`comments:${slug}`, 'json');
  return Array.isArray(stored) ? stored : [];
}

const notConfigured = () => json({ error: 'Comments are not switched on yet.' }, 503);

export async function onRequestGet({ request, env }) {
  if (!env.COMMENTS) return notConfigured();
  const url = new URL(request.url);

  // Admin: recent comments across all pages.
  if (url.searchParams.get('all')) {
    if (!isAdmin(request, env)) return json({ error: 'Not allowed.' }, 401);
    const listing = await env.COMMENTS.list({ prefix: 'comments:' });
    const pages = await Promise.all(
      listing.keys.map(async (key) => {
        const slug = key.name.slice('comments:'.length);
        const comments = await readComments(env, slug);
        return comments.map((comment) => ({ ...comment, slug }));
      }),
    );
    const all = pages
      .flat()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 200);
    return json({ comments: all });
  }

  const slug = url.searchParams.get('slug') ?? '';
  if (!SLUG_PATTERN.test(slug)) return json({ error: 'Unknown page.' }, 400);
  return json({ comments: await readComments(env, slug) });
}

export async function onRequestPost({ request, env }) {
  if (!env.COMMENTS) return notConfigured();
  const url = new URL(request.url);

  // Only accept submissions from this site's own pages.
  if (request.headers.get('Origin') !== url.origin) {
    return json({ error: 'Not allowed.' }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 400);
  }

  // Hidden "website" field: real people leave it empty, bots fill it in.
  // Pretend it worked so bots don't learn anything.
  if (body.website) return json({ comment: null }, 201);

  const slug = String(body.slug ?? '');
  const name = clean(body.name, NAME_MAX);
  const message = clean(body.message, MESSAGE_MAX);

  if (!SLUG_PATTERN.test(slug)) return json({ error: 'Unknown page.' }, 400);
  if (!name) return json({ error: 'Please add a name.' }, 400);
  if (!message) return json({ error: 'Please write a comment.' }, 400);
  if (URL_PATTERN.test(message) || URL_PATTERN.test(name)) {
    return json({ error: "Links aren't allowed in comments (it keeps spam out). Please remove the link." }, 400);
  }

  // The page has to exist, so nobody can create comments for made-up URLs.
  if (env.ASSETS) {
    const page = await env.ASSETS.fetch(new URL(`/${slug}/`, url.origin));
    if (page.status !== 200) return json({ error: 'Unknown page.' }, 400);
  }

  // One comment per minute per visitor. The address is hashed, never stored as-is.
  const address = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const limitKey = `ratelimit:${await shortHash(address)}`;
  if (await env.COMMENTS.get(limitKey)) {
    return json({ error: 'Slow down a little! Please wait a minute before commenting again.' }, 429);
  }

  const comments = await readComments(env, slug);
  if (comments.length >= MAX_COMMENTS_PER_PAGE) {
    return json({ error: 'Comments are closed on this page.' }, 403);
  }

  const comment = {
    id: crypto.randomUUID(),
    name,
    message,
    createdAt: new Date().toISOString(),
  };
  comments.push(comment);
  await env.COMMENTS.put(`comments:${slug}`, JSON.stringify(comments));
  await env.COMMENTS.put(limitKey, '1', { expirationTtl: RATE_LIMIT_SECONDS });

  return json({ comment }, 201);
}

export async function onRequestDelete({ request, env }) {
  if (!env.COMMENTS) return notConfigured();
  if (!isAdmin(request, env)) return json({ error: 'Not allowed.' }, 401);

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') ?? '';
  const id = url.searchParams.get('id') ?? '';
  if (!SLUG_PATTERN.test(slug) || !id) return json({ error: 'Bad request.' }, 400);

  const comments = await readComments(env, slug);
  const remaining = comments.filter((comment) => comment.id !== id);
  if (remaining.length === comments.length) return json({ error: 'Comment not found.' }, 404);

  if (remaining.length === 0) {
    await env.COMMENTS.delete(`comments:${slug}`);
  } else {
    await env.COMMENTS.put(`comments:${slug}`, JSON.stringify(remaining));
  }
  return json({ ok: true });
}
