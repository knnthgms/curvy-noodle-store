# Curvy Noodle 🍜

The website for Curvy Noodle — handmade planner stickers for bullet journals
and daily planners. It's a fast, mobile-friendly shop and blog with **no
checkout**: customers browse, then tap **Order on WhatsApp** to place an order
in a chat with you.

Built with [Astro](https://astro.build), TypeScript and Tailwind CSS. Hosted
free on Cloudflare Pages. No database, no logins, no shopping cart.

---

## ✏️ Editing content — the easy way (Admin UI)

The site has a built-in editor at **/admin**. Use it to edit products and blog
posts — no code needed, works from any browser.

- **Live site:** go to **https://thecurvynoodleshop.com/admin** and sign in
  with a GitHub personal access token (fine-grained, Contents: Read & Write on
  this repo). Changes are committed to GitHub and Cloudflare rebuilds the site
  automatically (~1–2 min).
- **Locally:** run `yarn dev`, then open **http://localhost:4321/admin**. Same
  flow — it calls the GitHub API, so the token is still required.

**How to create the token:**
1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. New fine-grained personal access token → select `curvy-noodle-store` repo
3. Under *Repository permissions*, set **Contents** to **Read and Write**
4. Generate and copy the token — paste it into the Admin sign-in box
5. The token is saved only in your browser tab and clears when you close it

---

## ✏️ Editing content — the manual way (text files)

If you prefer to edit files directly, all content lives in two folders:

- **Products** → `src/content/products/` — one Markdown file per sticker sheet
- **Blog posts** → `src/content/blog/` — one Markdown file per article

Each file starts with a small settings block between two `---` lines (called
"frontmatter"), then the main text below it. Here's how to do the common jobs.

### Change a product's price

1. Open the product's file in `src/content/products/` (e.g.
   `emotion-tracker-planner-stickers-india.md`).
2. Find the `price:` line and change the number (it's in rupees, no symbol).
3. Save. Done.

To show a **sale price**, add a `compareAtPrice:` line with the original (higher)
price. The site automatically strikes it through and shows a "Save X%" badge:

```yaml
price: 399
compareAtPrice: 499
```

Remove the `compareAtPrice:` line to end the sale.

### Add a new product

Copy an existing product file in `src/content/products/`, rename it (the file
name becomes the web address — use lowercase-words-with-dashes), and edit the
settings:

```yaml
---
title: "My New Sticker Sheet"
price: 99
compareAtPrice: 129        # optional — only for sales
category: "daily-activity" # see the list below
tags: ["planner stickers", "task stickers"]
description: "One short sentence shown on cards and in Google results."
featured: true             # true = also show it on the home page
image: "/images/products/my-new-sticker-sheet.svg"
imageAlt: "Plain-English description of the photo (for screen readers)"
dimensions: "A5 sheet; individual stickers 1.5–2.5 cm"
material: "Premium matte paper, handmade in India"
---

Write the longer description here, in normal text. Leave a blank line
between paragraphs. This shows on the product page.
```

**Categories** you can use (must match exactly): `emotion-mood`,
`daily-activity`, `bundles`, `planner-tracker`. To create a *new* category, ask
a developer — it's a small change in two files (`src/config.ts` and
`src/content.config.ts`).

### Add or edit a blog post

Same idea — copy a file in `src/content/blog/`, rename it, and edit:

```yaml
---
title: "My Post Title"
description: "One or two sentences (under 200 characters) for Google."
date: 2026-06-13
tags: ["planning", "tips"]
coverImage: "/images/blog/my-post-title.svg"
coverImageAlt: "Description of the cover image"
draft: false               # true = hide it (work in progress)
---

Write your article here. Use ## for section headings and ### for
smaller ones — these automatically build the "In this post" menu.
```

Set `draft: true` to keep a post hidden while you work on it.

### Add or replace images

Photos live in the `public/images/` folders:

- Product photos → `public/images/products/`
- Blog covers → `public/images/blog/`

The **file name in the folder must match the `image:` / `coverImage:` line** in
the content file. Easiest approach: name your photo exactly like the line says
(e.g. `emotion-tracker-planner-stickers-india.svg`) and drop it in the folder,
replacing the placeholder.

> **Note:** the current product/blog files point at placeholder image names that
> don't exist yet, so you'll see "broken image" boxes until you add real photos.
> Either drop in photos with those exact names, or change the `image:` line to
> point at a photo you've added. Recommended sizes: products **800×800**, blog
> covers **1200×675**. JPG, PNG, WebP or SVG all work.

### Edit the page text (Home, About, FAQ, Contact)

These are in `src/pages/`:

- **Home** → `src/pages/index.astro`
- **About** → `src/pages/about.astro`
- **FAQ** → `src/pages/faq.astro` (questions/answers are a list near the top)
- **Contact** → `src/pages/contact.astro`

The wording is plain text inside the page — find the sentence you want and edit
it. If you're unsure, change a small bit first and check the preview.

### Brand-wide settings (one place: `src/config.ts`)

Open `src/config.ts` to change things that appear everywhere:

- `whatsappNumber` — **the most important one.** Currently a placeholder
  (`919999999999`). Put your real WhatsApp number here, country code first, no
  `+` or spaces (e.g. `919876543210`).
- `announcement` — the pink bar at the very top.
- `email`, `socials.instagram`, `socials.youtube`.
- `tagline` and `description`.

### Turn on customer testimonials

When you have a few real quotes, open `src/config.ts`, find `SOCIAL_PROOF`, add
them to the `testimonials` list, and set `showSocialProof: true`. The section
stays hidden until both are done.

```ts
export const SOCIAL_PROOF = {
  showSocialProof: true,
  testimonials: [
    { quote: 'These made me actually use my planner!', name: 'Aanya', location: 'Bengaluru' },
  ],
};
```

---

## 🎨 Changing the look (colours & fonts)

### Switch the colour theme

The site ships with **4 ready-made themes**. To change the whole site's colours,
open `src/config.ts` and set `theme` to one of:

- `cream` — the default warm pastel look
- `rosebud` — your rose pink (rgb 217 138 138) front and centre
- `sage` — calm and leafy
- `lavender` — dreamy and purple

```ts
theme: 'rosebud',
```

Save, and every page retones. That's it.

### Mix and match colours

All the themes (and a few extra colours) live in `src/styles/global.css`, near
the top. You can:

- **Tweak a theme** — change any colour value inside a `[data-theme='…']` block.
- **Use an extra colour anywhere** — `rose`, `lavender`, `sky` and `mint` are
  always available as `bg-rose`, `text-rose-deep`, `border-mint`, etc. Add the
  class to any section. For example, to make the newsletter box use your rose:
  find `bg-noodle` in `src/components/NewsletterSignup.astro` and change it to
  `bg-rose`.

Each colour comes in two shades: the plain name (a light surface, e.g.
`bg-rose`) and `-deep` (a darker version for text/buttons, e.g.
`text-rose-deep`). Keep light backgrounds with `-deep` text so everything stays
readable.

### Change the fonts

Fonts are set in `src/styles/global.css` (the `@theme` block) and loaded in
`src/layouts/BaseLayout.astro`. The current trio:

- **Lilita One** — headings (chunky and playful)
- **Noto Sans** — body text
- **Caveat** — handwritten accent (use the `font-hand` class)

To try another font you liked (e.g. Playfair Display, Alfa Slab One, Noto
Serif): run `npm i @fontsource/<font-name>`, add an `import` line in
`BaseLayout.astro` next to the others, then change the matching
`--font-display` / `--font-sans` value in `global.css`.

---

## 📨 Wiring up the contact form

The contact form works without any coding once you connect a free form service.
We've set it up for **[Web3Forms](https://web3forms.com)** (free, no account
needed):

1. Go to [web3forms.com](https://web3forms.com), enter the email address where
   you want messages delivered, and copy the **Access Key** they email you.
2. Add it as an environment variable named `PUBLIC_WEB3FORMS_KEY` (locally in a
   `.env` file; in production in the Cloudflare Pages dashboard — see below).
3. Redeploy. The form now emails you on every submission, with built-in spam
   protection.

Until you add the key, the form politely tells visitors to use Instagram or
WhatsApp instead. (Prefer Formspree or another service? Change the form's
`action` URL in `src/pages/contact.astro`.)

---

## 📊 Analytics & WhatsApp conversion tracking

Analytics are off until you add a key, then they switch on automatically. The
site supports privacy-friendly **Cloudflare Web Analytics** (recommended) and
optionally **Google Analytics 4**.

### Turn on Cloudflare Web Analytics

1. In the Cloudflare dashboard: **Analytics & Logs → Web Analytics → Add a
   site**, enter your domain.
2. Copy the **token** from the snippet it shows.
3. Add it as the environment variable `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` and
   redeploy.

### How WhatsApp conversions are tracked (the important metric)

Cloudflare Web Analytics counts page views, not button clicks. So **every
WhatsApp button on the site goes through a small internal page first**
(`/go/whatsapp`) and then forwards to WhatsApp. That means:

> **The number of visits to `/go/whatsapp` = the number of WhatsApp orders
> started.** That's your conversion count.

To see it: open Cloudflare Web Analytics and look at the **top pages** list — the
hits on `/go/whatsapp` are your WhatsApp conversions. Compare that to total
visits to gauge how well the site turns browsers into orders.

### The metrics worth watching

| Metric (in Cloudflare Web Analytics) | What it tells you |
| --- | --- |
| **Visits** | How many people came to the site |
| **Page views → `/shop` and product pages** | What people browse most |
| **Page views → `/go/whatsapp`** | **WhatsApp orders started (conversions)** |
| `/go/whatsapp` ÷ total visits | Your conversion rate |
| **Top pages** | Your most popular products and posts |
| **Referrers** | Where visitors come from (Instagram, Google…) |

If you also enable Google Analytics (`PUBLIC_GA_MEASUREMENT_ID`), each WhatsApp
click additionally fires a `whatsapp_click` event tagged with the product, so
you can see *which* products drive the most orders. In GA4, mark
`whatsapp_click` as a **Key event (conversion)** under Admin → Events.

---

## 🚀 Deploying to Cloudflare Pages

1. Push this project to GitHub.
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, pick the
   repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add your environment variables under **Settings → Environment variables**
   (see the table below), then **Save and Deploy**.
5. Attach your domain under **Custom domains**. Cloudflare provisions HTTPS/SSL
   automatically.

Every push to your main branch redeploys the live site. Other branches get
preview links.

### Environment variables

| Variable | Purpose | Required? |
| --- | --- | --- |
| `SITE_URL` | Your live domain (e.g. `https://curvynoodle.com`) | Recommended |
| `PUBLIC_WEB3FORMS_CONTACT_KEY` | Makes the contact form send email | Optional |
| `PUBLIC_WEB3FORMS_NEWSLETTER_KEY` | Makes the newsletter form send email | Optional |
| `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | Cloudflare Web Analytics | Optional |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 (e.g. `G-XXXXXXXXXX`) | Optional |
| `PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity session recordings | Optional |

> Add these to a local `.env` file for development (git-ignored, stays private).
> **Changing an environment variable requires a redeploy** to take effect.

---

## 🧑‍💻 For developers

```bash
yarn install
yarn dev           # local dev server at http://localhost:4321
                   # Admin UI at http://localhost:4321/admin
yarn build         # production build into dist/
yarn preview       # preview the production build
yarn astro check   # type-check (.astro + .ts)
```

Requires Node.js 20+. Key locations:

```
public/admin/index.html  # Admin UI — self-contained, talks to GitHub API
src/
├── config.ts            # Brand, nav, categories, socials, testimonials
├── content.config.ts    # Astro content schemas
├── content/{products,blog}/   # Markdown content (edited via Admin UI or directly)
├── layouts/BaseLayout.astro   # Page shell: SEO, header, footer, analytics, sticky CTA
├── components/          # Header, Footer, Hero, ProductCard, BlogCard,
│                        # WhatsAppButton, StickyWhatsApp, SocialProof, SEO, …
├── pages/
│   ├── index / about / contact / faq / 404 / privacy / terms
│   ├── shop/index.astro + shop/[slug].astro     # listing + product detail
│   ├── collections/index.astro + collections/[slug].astro
│   ├── blog/[...page].astro + blog/[slug].astro
│   ├── go/whatsapp.astro    # WhatsApp conversion-tracking redirect
│   └── search.json.ts       # static search index
└── utils/               # whatsapp, schema (JSON-LD), formatting, collections
```

**Architecture note:** Fully static — all pages are pre-rendered at build time.
The admin UI at `public/admin/index.html` is a plain HTML/JS page that calls
the GitHub REST API directly from the browser; no server routes are needed.

- **SEO:** per-page meta + Open Graph/Twitter via `SEO.astro`; JSON-LD for
  Organization, WebSite, Product, BlogPosting, BreadcrumbList and FAQPage;
  `sitemap-index.xml` (excludes `/go/`) and `robots.txt`.
- **Search:** static `/search.json` built at build time; filtered client-side on
  the shop and blog pages. No external service.
- **WhatsApp links** are generated in `src/utils/whatsapp.ts` and routed through
  `/go/whatsapp` for conversion tracking.

### Pre-launch checklist

- [ ] Set the real `whatsappNumber` in `src/config.ts`
- [ ] Add real product photos and blog covers in `public/images/`
- [ ] Set `SITE_URL` and update the domain in `public/robots.txt`
- [ ] Add `PUBLIC_WEB3FORMS_CONTACT_KEY` and `PUBLIC_WEB3FORMS_NEWSLETTER_KEY` for forms
- [ ] Add `PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` for analytics
- [ ] Replace `public/images/branding/og-default.png` with real share artwork
- [ ] Review the placeholder Privacy Policy and Terms pages
- [ ] Create a GitHub fine-grained PAT (Contents: Read & Write) for the Admin UI

