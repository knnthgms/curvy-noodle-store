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

## Comments

Anonymous comments (any name, no login) appear on blog posts, Noodle Notes and product pages.

- **UI:** `src/components/Comments.astro`, given a slug like `blog/<id>`, `notes/<id>` or `shop/<slug>`.
- **Backend:** `functions/api/comments.js` (Cloudflare Pages Function) stores comments in a **KV namespace bound as `COMMENTS`**. The `COMMENTS_ADMIN_TOKEN` secret protects listing and deleting.
- **Moderation:** `/admin/comments` (paste the admin token). Not in the sitemap.
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
  components/
    Header.astro         ← Nav (lg breakpoint), hamburger menu
    Comments.astro       ← Anonymous comments section (blog, notes, products)
    NoteCard.astro       ← Noodle Notes card (snippet + Read more)
    RelatedNotes.astro   ← "From Noodle Notes" sidebar on blog posts
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
  utils/
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
