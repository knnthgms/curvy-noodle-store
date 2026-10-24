# Curvy Noodle — Claude Code guide

Astro 5 static site for [The Curvy Noodle Shop](https://curvynoodle.com), a sticker store.  
Hosted on **Cloudflare Pages**. Content is Markdown files committed to this repo.  
Admin UI: Decap CMS at `/admin` (Cloudflare Pages Functions handle GitHub OAuth).

---

## Architecture at a glance

| Layer | Technology |
|---|---|
| Framework | Astro 5 (static output, no SSR) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Content | Markdown + Astro Content Collections (`src/content/`) |
| Images | Stored in `public/images/` — no Astro image optimization |
| Hosting | Cloudflare Pages — build cmd `astro build`, output dir `dist` |
| CMS | Decap CMS at `/admin` (GitHub OAuth via `functions/api/`) |
| Tracking | `src/utils/whatsapp.ts` wraps WhatsApp links through `/go/whatsapp` |

---

## Core rules — don't break these

### Navigation breakpoint
The header desktop nav uses **`lg:` (1024 px)** as its show/hide breakpoint — not `md:`.  
There are 8 nav links; they don't fit at md (768 px).  
When changing: `hidden lg:block` (desktop nav) and `lg:hidden` (hamburger + mobile menu) must stay in sync.

### WhatsApp FAB
`src/components/StickyWhatsApp.astro` — the `<a>` has `gap-0` at rest (so the button is a perfect circle) and `hover:gap-2 focus-visible:gap-2` to add space when the "Order on WhatsApp" label expands.  
Never add `gap-2` unconditionally — it breaks the round shape.  
The `span` must stay `sm:inline` with `max-w-0` at rest so it's invisible but transitions cleanly.

### Content schemas are strict
`src/content.config.ts` uses Zod. A field being wrong type or length fails the build.  
Key limits:
- `description` on products and blog posts: **max 200 characters**
- Product `category` must be one of: `emotion-mood | daily-activity | bundles | planner-tracker | sample-stickers`
- `dimensions` and `material` are **required** on products (no default)

### WhatsApp link tracking
All WhatsApp links must go through `trackedWhatsAppLink()` from `src/utils/whatsapp.ts`, NOT hardcoded `wa.me` URLs. Tracked links route through `/go/whatsapp` which counts conversions.

### Decap CMS config
`src/pages/admin/config.yml.ts` generates `/admin/config.yml` at build time.  
The `base_url` for OAuth is read from `SITE_URL` env var (set in Cloudflare Pages settings).  
Do not put a static `config.yml` in `public/admin/` — it would conflict and take precedence.

### Inline scripts in admin
`src/pages/admin/` — any future custom scripts here need `is:inline` (not Astro's default module processing) because they run in a non-module context.

---

## Adding content

### Planning Nook (blog posts)

Blog posts live in `src/content/blog/`. Each is a `.md` file.

**Filename convention:** `slug-goes-here.md`  
The filename becomes the URL: `/blog/slug-goes-here`

**Required frontmatter:**

```yaml
---
title: "Your Post Title Here"
description: "One-sentence summary, max 200 characters. Shown in Google results."
date: 2026-10-15          # YYYY-MM-DD, used for sorting
tags: ["planner stickers", "bullet journal"]
coverImage: "/images/blog/your-cover-image.jpg"
coverImageAlt: "Describe the cover photo (screen readers + Google Images)"
draft: false              # true = hidden from the site
---

Post body in Markdown here.
```

**Images:** add photos to `public/images/blog/` and reference as `/images/blog/filename.jpg`.  
Recommended size: 1200×675 px (16:9).

**Optional SEO/AEO fields** (see the SEO & AEO standard below): `updated: 2026-11-02`, `faq:` (list of `question`/`answer`), and `video:` (`youtubeId`, `title`, `description`, `uploadDate`, `duration`, `chapters` as `name` + `start` seconds). A post with `video` shows the lazy YouTube player in place of the cover image, a chapters list, and `VideoObject` data.

**Via Decap CMS:** go to `/admin` → Blog posts → New blog post.

---

### Noodle Notes

Short personal notes live in `src/content/notes/`. Each is a `.md` file.

**Filename convention:** `YYYY-MM-DD-note-slug.md`  
Example: `2026-10-12-cute-2027-planner-from-london.md`  
The URL keeps the date prefix: `/notes/2026-10-12-cute-2027-planner-from-london`.

**Required frontmatter:**

```yaml
---
title: "Short note title"
date: 2026-10-12          # YYYY-MM-DD
tags: ["cool stationery finds"]
image: "/images/notes/main-photo.jpg"        # optional but recommended
imageAlt: "Describe the photo"               # required if image is set
draft: false
comments: true            # false = hides the comment section
---

Note body in Markdown here. These are casual, first-person. Short is fine.
```

**Images:** add photos to `public/images/notes/` and reference as `/images/notes/filename.jpg`.  
These are personal/casual photos — any size works, portrait or landscape.

**Via Decap CMS:** go to `/admin` → Noodle Notes → New Note (the `notes` collection is in `src/pages/admin/config.yml.ts`).

The `/notes` page and the home page strip show only a short snippet (`noteExcerpt()` in `src/utils/collections.ts`) with a "Read more" link. The full text is on the note's own page.

---

### Reviews (post-it notes on the home page)

Customer reviews live in `src/content/reviews/` as frontmatter-only `.md` files
(`quote` = one short line, max 50 chars, shown on the post-it; `original` = the
customer's full review, kept for reference and never shown; `name`, optional
`location`, `date`, `draft`). Add them via `/admin` → Reviews. `ReviewNotes.astro`
shows the newest 3 as tiny one-line post-its (theme colours) above "Featured
stickers" and renders nothing when there are none. The `quote` must stay faithful to
the `original`.
**Only add real reviews with the customer's permission. Never invent, edit the meaning of,
or paraphrase testimonials.** Don't add `Review`/`AggregateRating` structured data for the
shop's own reviews (search engines treat self-serving review markup as spam).

---

### Products

Products live in `src/content/products/`. Each is a `.md` file.

**Via Decap CMS:** go to `/admin` → Products (recommended — handles image uploads).

**Manual frontmatter:**

```yaml
---
title: "Full product name"
price: 99                               # whole rupees
compareAtPrice: 149                     # optional — shows strikethrough + "Save X%" badge
category: "daily-activity"             # one of the 5 valid values
description: "Max 200 chars"
featured: false                        # true = shown on home page
image: "/images/products/main.jpg"
imageAlt: "Alt text"
gallery:
  - src: /images/products/photo2.jpg
    alt: "Alt text"
tags: ["planner stickers"]
dimensions: "A5 sheet; individual stickers 1.5–2.5 cm"
material: "Premium matte paper, handmade in India"
comments: true                         # optional, false = hides the comment section
---

Full product description in Markdown.
```

---

## SEO & AEO standard (applies to ALL content, by default)

Every new blog post, note, product and page must be optimised for **SEO** (search engines) and **AEO** (answer engines and AI assistants such as Google AI Overviews, ChatGPT, Perplexity). Do this without being asked. The owner has said it is a standing rule.

**Every page type has its own structured data**: blog posts (`BlogPosting` + `FAQPage` + `VideoObject`), products (`Product` with images, sku, offer, plus a generated `FAQPage` from the shipping and returns policy), collections and the shop (`CollectionPage` + `ItemList`), blog and notes lists (`Blog` / `CollectionPage`, with page numbers in titles so pages 2+ are not duplicates), About, Contact and FAQ pages. Keep descriptions between 120 and 160 characters and unique on every page. The sitemap carries `lastmod` from `updated`/`date`. Paths in internal links must match the built lowercase URLs exactly.

**What the site already does automatically** (don't rebuild it, just feed it good frontmatter): canonical URL, Open Graph and Twitter tags (with image alt), `article:` publish/modified times and tags, a robots meta that allows large snippets, JSON-LD (`Organization`, `WebSite`, `BreadcrumbList`, `BlogPosting` with dateModified/keywords/wordCount, plus `FAQPage` from `faq` and `VideoObject` with chapter clips from `video`), sitemap, `/rss.xml`, an auto-generated `/llms.txt`, related-post links, and a visible "Updated" date when `updated` is set.

**Checklist for a blog post**
1. **Title**: one H1 only (the `title`, can be long and friendly). Add `seoTitle` (about 45 characters, main topic words first) so the Google `<title>` stays under about 60 characters with the brand suffix. Same `seoTitle` field exists on products.
2. **Description**: 120 to 160 characters, states the answer or benefit, includes the main keyword naturally.
3. **Answer first (AEO)**: open with a 40 to 60 word direct answer to the main question, then a short "The short version" blockquote. Use question-style H2s ("What is...", "How do you...", "Is it...") and answer in the first sentence under each, then expand. Keep paragraphs short and use lists, steps and tables.
4. **FAQ**: add 3 to 7 real reader questions to the `faq` frontmatter, plain-text answers of 1 to 3 sentences that start with the direct answer. The FAQ is shown on the page and sent as `FAQPage` data, so it must match.
5. **Video posts**: when a post is about a YouTube video, fill `video` (id, title, description, upload date, ISO duration, chapters in seconds). Link chapter timestamps in the body.
6. **Internal links**: at least 3 links to related posts, notes, products or collections (use lowercase paths exactly as built, e.g. `/blog/the-best-stationery-websites-in-india/`, because Cloudflare is case-sensitive). Link out to primary sources for facts.
7. **Images**: every image has specific alt text (never "Placeholder cover for..."); the cover is a **JPG or PNG, 16:9, at least 1200 px wide** (social platforms do not show SVG previews), with `coverImageAlt` describing it. Credit image sources honestly. **Page speed is a ranking factor: never commit an image over about 1 MB or longer than 1800 px.** After adding any photo to `public/images/`, run `npm run optimize:images` (it resizes, converts photo PNGs to JPEG, and fixes references; `-- --check` just lists oversized files). Phone photos straight from the camera are 5 to 15 MB, so this matters.
8. **Tags** are the topic keywords (lowercase, 3 to 6). Set `updated` whenever an old post is meaningfully changed.
9. **Facts**: verify every claim, price, size and link before publishing. Never invent details, results or quotes. Say plainly what is unknown.
10. **Notes and products**: descriptive title, a first sentence that works as a standalone summary, alt text on all images, and (products) specific size, material and price details.

After writing, build the site and check the rendered page: title and description length, one H1, JSON-LD present and matching visible content, working links.

---

## Comments

Anonymous comments (any name, no login) appear on blog posts, Noodle Notes and product pages.

- **UI:** `src/components/Comments.astro`, given a slug like `blog/<id>`, `notes/<id>` or `shop/<slug>`.
- **Backend:** `functions/api/comments.js` (Cloudflare Pages Function) stores comments in a **KV namespace bound as `COMMENTS`**. The `COMMENTS_ADMIN_TOKEN` secret protects listing and deleting.
- **Moderation:** `/admin/comments` (paste the admin token). Not in the sitemap. Lists photo comments waiting for approval (Approve / Delete) and recent comments.
- **Photos:** one optional JPEG per comment. The browser resizes and re-encodes it (`preparePhoto()` in `Comments.astro`); the function accepts only files starting with the JPEG bytes, max 1.5 MB, and stores them in KV as `image:<id>`. Photo comments are **held as `pending:<id>`** until approved (`IMAGES_NEED_APPROVAL`), and unapproved items expire after 30 days. Approved photos are served from `/api/comments?image=<id>` with `nosniff` and a sandbox CSP header. Don't loosen these.
- **Replies:** one level deep. A reply is a comment with `parentId` set to the id of the top-level comment that starts its thread (replying to a reply resolves to the same thread on the server). Text only, max 50 per thread, same spam rules as comments. Deleting a comment deletes its replies. The UI is rebuilt from the flat list by `render()` in `Comments.astro`.
- **Owner replies:** sending a reply with the valid admin token (`Authorization: Bearer …`, done from `/admin/comments` → "Reply as the shop") stores it with `owner: true` and the fixed name "Curvy Noodle". The server decides this from the token only, never from form fields. Owner replies may contain links and skip the rate limit; `withLinks()` in `Comments.astro` makes only those links clickable (http/https only). Don't linkify visitor comments.
- **Per-page switch:** `comments: false` in frontmatter (also an "Allow comments" toggle in Decap) hides the section on that entry.
- **New sections:** to add comments elsewhere, add the section to `SLUG_PATTERN` in `functions/api/comments.js` and render `<Comments slug="section/id" />`. The function checks that the page exists before accepting a comment, and slugs must be lowercase letters, digits and hyphens.
- **Not configured?** Without the KV binding the API returns 503 and the page shows "Comments will be switched on soon." Setup steps are in the README under "Comments".
- Comment text is stored as plain text and rendered with `textContent`. Never switch it to `innerHTML`.

---

## Decap CMS setup (first-time only)

See [`docs/decap-cms-setup.md`](docs/decap-cms-setup.md) for the GitHub OAuth App creation and Cloudflare env var steps.

---

## Dev server

```bash
npm run dev        # starts on http://localhost:4321
npm run build      # builds to dist/
npm run preview    # serves the dist/ build locally
```

Astro's HMR works for most changes. If styles don't update, restart the dev server — HMR can cache the old CSS module while serving the new one.

---

## File map (key files)

```
src/
  config.ts              ← NAV_LINKS, SITE constants, CATEGORIES
  content.config.ts      ← Zod schemas for blog, products, notes
  content/
    blog/                ← Planning Nook posts
    products/            ← Product listings
    notes/               ← Noodle Notes
    reviews/             ← Customer reviews (post-it notes)
  components/
    Header.astro         ← Nav (lg breakpoint), hamburger menu
    Comments.astro       ← Anonymous comments section (blog, notes, products)
    NoteCard.astro       ← Noodle Notes card (snippet + Read more)
    ReviewNotes.astro    ← Customer reviews on post-it notes (home page)
    RelatedNotes.astro   ← "From Noodle Notes" sidebar on blog posts
    YouTubeEmbed.astro   ← Click-to-load YouTube player (youtube-nocookie) for video posts
    YouTubeChannelCta.astro ← "Watch Curvy Noodle on YouTube" + View channel button, bottom of every blog post
    StickyWhatsApp.astro ← WhatsApp FAB (gap-0 at rest!)
    Footer.astro
  layouts/
    BaseLayout.astro     ← Wraps every page; injects StickyWhatsApp
  pages/
    admin/
      index.astro        ← Decap CMS entry point
      config.yml.ts      ← Generates /admin/config.yml at build time
    notes/               ← Noodle Notes listing + detail pages
    blog/                ← Planning Nook listing + detail pages
  pages/
    rss.xml.ts           ← RSS feed of posts and notes
    llms.txt.ts          ← Auto-generated site summary for AI assistants
  utils/
    schema.ts            ← JSON-LD builders (BlogPosting, FAQPage, VideoObject...)
    whatsapp.ts          ← WhatsApp link helpers (always use these)

functions/
  api/
    auth.js              ← Cloudflare Pages Function: GitHub OAuth start
    callback.js          ← Cloudflare Pages Function: GitHub OAuth callback
    comments.js          ← Cloudflare Pages Function: comments API (KV binding COMMENTS)

public/
  images/
    blog/                ← Blog cover images
    notes/               ← Note photos
    products/            ← Product photos
    branding/            ← Logo, favicon
```
