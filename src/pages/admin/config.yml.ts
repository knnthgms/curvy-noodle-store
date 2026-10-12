import type { APIRoute } from 'astro';

// Served at /admin/config.yml — Decap CMS fetches this automatically on load.
// The site base URL comes from SITE_URL env var (set in Cloudflare Pages settings),
// so the OAuth backend URL is always correct without hardcoding it.
export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://curvynoodle.com').replace(/\/$/, '');

  const yaml = `# Decap CMS configuration — auto-generated from src/pages/admin/config.yml.ts
# https://decapcms.org/docs/configuration-options/

backend:
  name: github
  repo: knnthgms/curvy-noodle-store
  branch: main
  # OAuth proxy — Cloudflare Pages Function at functions/api/auth.js
  base_url: ${base}
  auth_endpoint: api/auth

site_url: ${base}
display_url: ${base}

locale: en

# Global media defaults (required by Decap). Individual collections override
# these with their own media_folder/public_folder below.
media_folder: public/images
public_folder: /images

# ── Collections ────────────────────────────────────────────────────────────────

collections:
  # Products
  - name: products
    label: Products
    label_singular: Product
    description: "Edit sticker sheet listings — prices, descriptions, photos, and gallery images."
    folder: src/content/products
    create: true
    slug: "{{slug}}"
    extension: md
    format: frontmatter
    summary: "{{title}} — ₹{{fields.price}}"
    # Media for this collection goes into public/images/products/
    media_folder: /public/images/products
    public_folder: /images/products
    fields:
      - label: Product name
        name: title
        widget: string
        hint: "The full product name shown on the site."

      - label: "Selling price (₹)"
        name: price
        widget: number
        value_type: int
        min: 1

      - label: "Original price — leave blank when not on sale (₹)"
        name: compareAtPrice
        widget: number
        value_type: int
        min: 1
        required: false
        hint: "When set, a strikethrough price and 'Save X%' badge appear on the product card."

      - label: Collection
        name: category
        widget: select
        options:
          - { label: "Daily Activity",   value: "daily-activity" }
          - { label: "Emotion & Mood",   value: "emotion-mood" }
          - { label: "Bundles",          value: "bundles" }
          - { label: "Planner Tracker",  value: "planner-tracker" }
          - { label: "Sample Stickers",  value: "sample-stickers" }

      - label: Short description
        name: description
        widget: text
        hint: "Shown on product cards and in Google search results. Max 200 characters."
        pattern: ['^[\\s\\S]{0,200}$', "Max 200 characters"]

      - label: Show on home page
        name: featured
        widget: boolean
        default: false
        hint: "Tick to include this product in the featured row on the home page."

      - label: Main photo
        name: image
        widget: image
        hint: "Recommended: square crop, at least 800×800 px."

      - label: Main photo alt text
        name: imageAlt
        widget: string
        hint: "Describe the photo for screen readers and Google Images."

      - label: Gallery photos
        name: gallery
        widget: list
        label_singular: Photo
        required: false
        summary: "{{fields.alt}}"
        fields:
          - label: Photo
            name: src
            widget: image
          - label: Alt text
            name: alt
            widget: string

      - label: Tags
        name: tags
        widget: list
        allow_add: true
        required: false
        hint: "Keywords used for filtering. e.g. planner stickers, emotion stickers."

      - label: Dimensions
        name: dimensions
        widget: string
        hint: "e.g. A5 sheet; individual stickers 1.5–2.5 cm"

      - label: Material
        name: material
        widget: string
        hint: "e.g. Premium matte paper, handmade in India"

      - label: Full description
        name: body
        widget: markdown
        hint: "The full product description shown on the product page."

  # Noodle Notes (short updates)
  - name: notes
    label: Noodle Notes
    label_singular: Note
    description: "Quick updates: a photo, a few lines and a tag. Takes a couple of minutes."
    folder: src/content/notes
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    extension: md
    format: frontmatter
    summary: "{{title}} — {{date}}"
    # Media for this collection goes into public/images/notes/
    media_folder: /public/images/notes
    public_folder: /images/notes
    fields:
      - label: Title
        name: title
        widget: string
        hint: "A short, friendly headline. e.g. 'Desk setup for the week'."

      - label: Date
        name: date
        widget: date
        format: YYYY-MM-DD
        hint: "Used for sorting. Newest notes appear first."

      - label: Photo
        name: image
        widget: image
        required: false
        hint: "Optional. Landscape or square works best (about 1200×900 px)."

      - label: Photo alt text
        name: imageAlt
        widget: string
        required: false
        hint: "Describe the photo for screen readers. Fill this in if you add a photo."

      - label: Tags
        name: tags
        widget: list
        allow_add: true
        required: false
        hint: "e.g. desk, new find, planner, washi."

      - label: Draft — hide from website
        name: draft
        widget: boolean
        default: false

      - label: Allow comments
        name: comments
        widget: boolean
        default: true
        hint: "Untick to hide the comments section on this note."

      - label: Note
        name: body
        widget: markdown
        hint: "Keep it short: one to three sentences is plenty."

  # Blog posts
  - name: blog
    label: Blog posts
    label_singular: Blog post
    description: "Write and publish blog articles."
    folder: src/content/blog
    create: true
    slug: "{{slug}}"
    extension: md
    format: frontmatter
    summary: "{{title}} — {{date}}"
    # Media for this collection goes into public/images/blog/
    media_folder: /public/images/blog
    public_folder: /images/blog
    fields:
      - label: Title
        name: title
        widget: string

      - label: Short description
        name: description
        widget: text
        hint: "Shown in Google results and on the blog listing. Max 200 characters."
        pattern: ['^[\\s\\S]{0,200}$', "Max 200 characters"]

      - label: Publish date
        name: date
        widget: date
        format: YYYY-MM-DD
        hint: "The date shown on the post and used for sorting."

      - label: Draft — hide from website
        name: draft
        widget: boolean
        default: false
        hint: "Tick to save without making the post visible on the site."

      - label: Cover image
        name: coverImage
        widget: image
        hint: "Recommended: 1200×675 px (16:9)."

      - label: Cover image alt text
        name: coverImageAlt
        widget: string

      - label: Tags
        name: tags
        widget: list
        allow_add: true
        required: false

      - label: Allow comments
        name: comments
        widget: boolean
        default: true
        hint: "Untick to hide the comments section on this post."

      - label: Post content
        name: body
        widget: markdown
        hint: "Write the full post here. Use ## for section headings."
`;

  return new Response(yaml, {
    headers: { 'Content-Type': 'text/yaml; charset=utf-8' },
  });
};
