// Cloudflare Pages Function: anonymous comments for blog posts, Noodle Notes and products.
//
// Setup (Cloudflare dashboard, see README → "Comments"):
//   KV namespace binding  COMMENTS             — stores comments and photos
//   Secret                COMMENTS_ADMIN_TOKEN — lets you review, approve and delete
//
// Endpoints (all under /api/comments):
//   GET    ?slug=notes/my-note        → approved comments for one page (public)
//   GET    ?image=<id>                → an approved comment photo (public); admin can see pending ones
//   POST   multipart or JSON          → add a comment, optionally with a JPEG photo (public, rate limited)
//   GET    ?all=1                     → recent and pending comments on every page (admin)
//   PATCH  ?id=<id>                   → approve a pending photo comment (admin)
//   DELETE ?slug=...&id=...           → remove a comment (admin); add &pending=1 for a pending one
//
// Storage layout in KV:
//   comments:<slug>  JSON array of approved comments for a page
//   pending:<id>     a photo comment waiting for approval (auto-deleted after 30 days)
//   image:<id>       the JPEG bytes, with metadata {approved}
//
// Text-only comments appear straight away. Comments with a photo are held for
// approval while IMAGES_NEED_APPROVAL is true, so nothing unchecked is ever public.

const SLUG_PATTERN = /^(blog|notes|shop)\/[a-z0-9][a-z0-9-]*$/;
const NAME_MAX = 40;
const MESSAGE_MAX = 1000;
const MAX_COMMENTS_PER_PAGE = 300;
const RATE_LIMIT_SECONDS = 60; // KV's minimum TTL
const IMAGES_NEED_APPROVAL = true;
const IMAGE_MAX_BYTES = 1.5 * 1024 * 1024;
const REQUEST_MAX_BYTES = 2 * 1024 * 1024;
const MAX_PENDING_IMAGES = 40;
const PENDING_TTL_SECONDS = 60 * 60 * 24 * 30;
const UUID_PATTERN = /^[0-9a-f-]{36}$/;
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

async function listPending(env) {
  const listing = await env.COMMENTS.list({ prefix: 'pending:' });
  const items = await Promise.all(listing.keys.map((key) => env.COMMENTS.get(key.name, 'json')));
  return items.filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// A real JPEG starts with the bytes FF D8 FF.
const looksLikeJpeg = (bytes) => bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

const notConfigured = () => json({ error: 'Comments are not switched on yet.' }, 503);

async function serveImage(env, request, id) {
  if (!UUID_PATTERN.test(id)) return json({ error: 'Not found.' }, 404);
  const { value, metadata } = await env.COMMENTS.getWithMetadata(`image:${id}`, 'arrayBuffer');
  const admin = isAdmin(request, env);
  if (!value || (!metadata?.approved && !admin)) return json({ error: 'Not found.' }, 404);
  return new Response(value, {
    headers: {
      'Content-Type': 'image/jpeg',
      // Photos are shown only as pictures: never sniffed, never run as a page.
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cache-Control': metadata?.approved ? 'public, max-age=86400' : 'private, no-store',
    },
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.COMMENTS) return notConfigured();
  const url = new URL(request.url);

  const imageId = url.searchParams.get('image');
  if (imageId) return serveImage(env, request, imageId);

  // Admin: recent comments across all pages, plus anything waiting for approval.
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
    return json({ comments: all, pending: await listPending(env) });
  }

  const slug = url.searchParams.get('slug') ?? '';
  if (!SLUG_PATTERN.test(slug)) return json({ error: 'Unknown page.' }, 400);
  return json({ comments: await readComments(env, slug) });
}

async function readSubmission(request) {
  const type = request.headers.get('Content-Type') ?? '';
  if (type.includes('multipart/form-data')) {
    const form = await request.formData();
    const photo = form.get('image');
    return {
      fields: {
        slug: form.get('slug'),
        name: form.get('name'),
        message: form.get('message'),
        website: form.get('website'),
      },
      photo: photo && typeof photo === 'object' && photo.size > 0 ? photo : null,
    };
  }
  return { fields: await request.json(), photo: null };
}

export async function onRequestPost({ request, env }) {
  if (!env.COMMENTS) return notConfigured();
  const url = new URL(request.url);

  // Only accept submissions from this site's own pages.
  if (request.headers.get('Origin') !== url.origin) {
    return json({ error: 'Not allowed.' }, 403);
  }
  if (Number(request.headers.get('Content-Length') ?? 0) > REQUEST_MAX_BYTES) {
    return json({ error: 'That photo is too big. Please choose a smaller one.' }, 413);
  }

  let fields;
  let photo;
  try {
    ({ fields, photo } = await readSubmission(request));
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 400);
  }

  // Hidden "website" field: real people leave it empty, bots fill it in.
  // Pretend it worked so bots don't learn anything.
  if (fields.website) return json({ comment: null }, 201);

  const slug = String(fields.slug ?? '');
  const name = clean(fields.name, NAME_MAX);
  const message = clean(fields.message, MESSAGE_MAX);

  if (!SLUG_PATTERN.test(slug)) return json({ error: 'Unknown page.' }, 400);
  if (!name) return json({ error: 'Please add a name.' }, 400);
  if (!message && !photo) return json({ error: 'Please write a comment or add a photo.' }, 400);
  if (URL_PATTERN.test(message) || URL_PATTERN.test(name)) {
    return json({ error: "Links aren't allowed in comments (it keeps spam out). Please remove the link." }, 400);
  }

  let photoBytes = null;
  if (photo) {
    if (photo.size > IMAGE_MAX_BYTES) {
      return json({ error: 'That photo is too big. Please choose a smaller one.' }, 413);
    }
    photoBytes = new Uint8Array(await photo.arrayBuffer());
    if (!looksLikeJpeg(photoBytes)) {
      return json({ error: 'Please upload a JPG or PNG photo.' }, 400);
    }
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

  const comment = {
    id: crypto.randomUUID(),
    name,
    message,
    createdAt: new Date().toISOString(),
  };

  // Photo comments wait for approval, so nothing unchecked is ever public.
  if (photoBytes && IMAGES_NEED_APPROVAL) {
    const waiting = await env.COMMENTS.list({ prefix: 'pending:' });
    if (waiting.keys.length >= MAX_PENDING_IMAGES) {
      return json({ error: 'Photo comments are paused for a bit. You can still comment without a photo!' }, 503);
    }
    await env.COMMENTS.put(`image:${comment.id}`, photoBytes, {
      metadata: { approved: false },
      expirationTtl: PENDING_TTL_SECONDS,
    });
    await env.COMMENTS.put(`pending:${comment.id}`, JSON.stringify({ ...comment, slug, image: comment.id }), {
      expirationTtl: PENDING_TTL_SECONDS,
    });
    await env.COMMENTS.put(limitKey, '1', { expirationTtl: RATE_LIMIT_SECONDS });
    return json({ pending: true }, 202);
  }

  const comments = await readComments(env, slug);
  if (comments.length >= MAX_COMMENTS_PER_PAGE) {
    return json({ error: 'Comments are closed on this page.' }, 403);
  }
  if (photoBytes) {
    await env.COMMENTS.put(`image:${comment.id}`, photoBytes, { metadata: { approved: true } });
    comment.image = comment.id;
  }
  comments.push(comment);
  await env.COMMENTS.put(`comments:${slug}`, JSON.stringify(comments));
  await env.COMMENTS.put(limitKey, '1', { expirationTtl: RATE_LIMIT_SECONDS });

  return json({ comment }, 201);
}

// Approve a pending photo comment: it moves onto its page and the photo goes public.
export async function onRequestPatch({ request, env }) {
  if (!env.COMMENTS) return notConfigured();
  if (!isAdmin(request, env)) return json({ error: 'Not allowed.' }, 401);

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!UUID_PATTERN.test(id)) return json({ error: 'Bad request.' }, 400);

  const pending = await env.COMMENTS.get(`pending:${id}`, 'json');
  if (!pending) return json({ error: 'Comment not found.' }, 404);

  const comments = await readComments(env, pending.slug);
  if (comments.length >= MAX_COMMENTS_PER_PAGE) {
    return json({ error: 'That page already has the maximum number of comments.' }, 403);
  }

  const { value } = await env.COMMENTS.getWithMetadata(`image:${id}`, 'arrayBuffer');
  if (value) {
    // Re-saving without a time limit makes the approved photo permanent.
    await env.COMMENTS.put(`image:${id}`, value, { metadata: { approved: true } });
  }
  const { slug, ...comment } = pending;
  if (!value) delete comment.image;
  comments.push(comment);
  await env.COMMENTS.put(`comments:${slug}`, JSON.stringify(comments));
  await env.COMMENTS.delete(`pending:${id}`);
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  if (!env.COMMENTS) return notConfigured();
  if (!isAdmin(request, env)) return json({ error: 'Not allowed.' }, 401);

  const url = new URL(request.url);
  const id = url.searchParams.get('id') ?? '';

  // A pending photo comment that was never approved.
  if (url.searchParams.get('pending')) {
    if (!UUID_PATTERN.test(id)) return json({ error: 'Bad request.' }, 400);
    const pending = await env.COMMENTS.get(`pending:${id}`, 'json');
    if (!pending) return json({ error: 'Comment not found.' }, 404);
    await env.COMMENTS.delete(`pending:${id}`);
    await env.COMMENTS.delete(`image:${id}`);
    return json({ ok: true });
  }

  const slug = url.searchParams.get('slug') ?? '';
  if (!SLUG_PATTERN.test(slug) || !id) return json({ error: 'Bad request.' }, 400);

  const comments = await readComments(env, slug);
  const target = comments.find((comment) => comment.id === id);
  if (!target) return json({ error: 'Comment not found.' }, 404);
  const remaining = comments.filter((comment) => comment.id !== id);

  if (target.image) await env.COMMENTS.delete(`image:${target.image}`);
  if (remaining.length === 0) {
    await env.COMMENTS.delete(`comments:${slug}`);
  } else {
    await env.COMMENTS.put(`comments:${slug}`, JSON.stringify(remaining));
  }
  return json({ ok: true });
}
