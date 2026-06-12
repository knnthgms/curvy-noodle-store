# The Curvy Noodle Shop 🍜

A fast, mobile-friendly, SEO-optimised storefront and blog for an indie
sticker business. Built with [Astro](https://astro.build), TypeScript and
Tailwind CSS. There is **no checkout** — products link to WhatsApp with a
pre-filled order message.

- **Static site** — no backend, no database, no user accounts
- **All content lives in Markdown** under `src/content/`, versioned in Git
- **Deploys to Cloudflare Pages** (or any static host)

## Quick start

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # production build into dist/
npm run preview    # preview the production build locally
npm run check      # type-check .astro and .ts files
```

Requires Node.js 20+.

## Project structure

```
src/
├── config.ts            # Brand, nav, categories, WhatsApp number — edit me!
├── content.config.ts    # Content collection schemas (products, blog)
├── content/
│   ├── products/        # One .md file per product
│   └── blog/            # One .md file per blog post
├── layouts/
│   └── BaseLayout.astro # Page shell: head, header, footer, analytics
├── components/          # Header, Footer, Hero, ProductCard, BlogCard,
│                        # SearchBar, Breadcrumbs, Pagination, SEO, …
├── pages/               # Routes (file-based routing)
│   ├── index.astro              # Home
│   ├── shop/index.astro         # Shop grid with search + filters
│   ├── shop/[slug].astro        # Product detail (WhatsApp order button)
│   ├── blog/[...page].astro     # Paginated blog listing with search
│   ├── blog/[slug].astro        # Blog post (TOC, share, prev/next)
│   ├── about / contact / 404 / privacy / terms
│   └── search.json.ts           # Static search index (built at build time)
├── styles/global.css    # Tailwind theme tokens + base styles
└── utils/               # formatting, schema.org builders, WhatsApp links
public/
├── images/products|blog|branding   # Placeholder artwork — replace me!
├── favicon.svg
└── robots.txt
```

## Editing content

### Update the brand basics

Almost everything brand-related lives in [`src/config.ts`](src/config.ts):

- **WhatsApp number** — `whatsappNumber` is a placeholder
  (`919999999999`). Replace it with the real number in international
  format, digits only.
- Site name, tagline, email, social URLs and product categories.

The canonical domain is set in [`astro.config.mjs`](astro.config.mjs)
(or via the `SITE_URL` environment variable). Update
[`public/robots.txt`](public/robots.txt) to match your domain.

### Add a product

Create `src/content/products/my-sticker.md` (the filename becomes the URL:
`/shop/my-sticker`):

```markdown
---
title: "My Sticker"
price: 99                      # whole rupees
category: "food-drink"         # food-drink | animals | celestial | plants
tags: ["kawaii", "food"]
description: "One-line summary shown on cards and in search results."
featured: true                 # featured products appear on the home page
image: "/images/products/my-sticker.svg"
imageAlt: "Describe the image for screen readers"
gallery:
  - src: "/images/products/scene-journal.svg"
    alt: "My Sticker styled on a journal"
dimensions: "7 cm × 6 cm"
material: "Waterproof matte vinyl"
---

Long description in Markdown — appears on the product page.
```

Drop the product image into `public/images/products/`. To add a new
category, extend the `CATEGORIES` list in `src/config.ts` **and** the
`category` enum in `src/content.config.ts`.

### Add a blog post

Create `src/content/blog/my-post.md` (filename becomes `/blog/my-post`):

```markdown
---
title: "My Post Title"
description: "Meta description and card blurb (max 200 chars)."
date: 2026-06-12
tags: ["journaling", "tips"]
coverImage: "/images/blog/my-post.svg"
coverImageAlt: "Describe the cover image"
draft: false                   # true hides the post everywhere
---

Write in Markdown. `##` and `###` headings are picked up automatically
for the table of contents.
```

Reading time, the TOC, previous/next links, share buttons and BlogPosting
structured data are all generated automatically.

### Replace the placeholder images

All images in `public/images/` are generated SVG placeholders. Swap them
for real product photos (keep the same paths, or update the frontmatter).
Recommended sizes: products 800×800, blog covers 1200×675, and
`branding/og-default.png` must stay **1200×630 PNG/JPG** (social networks
don't render SVG previews).

## How ordering works

There is no cart. Every product page has an **Order on WhatsApp** button
that opens:

```
https://wa.me/<number>?text=Hi! I would like to order the <Product Name> sticker.
```

The link is generated in [`src/utils/whatsapp.ts`](src/utils/whatsapp.ts).

## Search

Search is fully static and free: `src/pages/search.json.ts` builds a JSON
index of all products and posts at build time. The shop page filters the
product grid client-side (text + category), and the blog page fetches the
index for live post search. No external services.

## SEO

- **Per-page metadata** via the [`SEO`](src/components/SEO.astro)
  component: title template, description, canonical URL, Open Graph,
  Twitter cards.
- **Structured data** (JSON-LD): Organization + WebSite on every page,
  plus Product, BlogPosting and BreadcrumbList where relevant
  (builders in [`src/utils/schema.ts`](src/utils/schema.ts)).
- **Sitemap** at `/sitemap-index.xml` via `@astrojs/sitemap`;
  **robots.txt** in `public/`.
- Semantic HTML, single `h1` per page, alt text required by the content
  schemas.

After changing the domain, update it in `astro.config.mjs` (or `SITE_URL`)
and `public/robots.txt`.

## Analytics

Both integrations are dormant until you set environment variables (see
[`.env.example`](.env.example)):

| Variable | Enables |
| --- | --- |
| `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | Cloudflare Web Analytics (cookie-free) |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |

Set them in the Cloudflare Pages dashboard for production. Because the
site is static, **changing env vars requires a rebuild**.

## Deploying to Cloudflare Pages

1. Push this repository to GitHub/GitLab.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages →
   Connect to Git** and select the repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. (Optional) Add environment variables: `SITE_URL`,
   `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`, `PUBLIC_GA_MEASUREMENT_ID`.
5. Deploy, then attach your custom domain under **Custom domains**.

Every push to the production branch redeploys automatically; other
branches get preview URLs.

## Pre-launch checklist

- [ ] Replace `whatsappNumber` in `src/config.ts`
- [ ] Replace placeholder images in `public/images/`
- [ ] Set the real domain in `astro.config.mjs` and `public/robots.txt`
- [ ] Update social URLs and email in `src/config.ts`
- [ ] Review the placeholder Privacy Policy and Terms pages
- [ ] Wire the contact form / newsletter to a provider (or keep as-is)
- [ ] Set analytics environment variables (optional)
