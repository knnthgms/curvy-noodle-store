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

      - label: Allow comments
        name: comments
        widget: boolean
        default: true
        hint: "Untick to hide the comments section on this product page."

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

  # Customer reviews (post-it notes on the home page)
  - name: reviews
    label: Reviews
    label_singular: Review
    description: "Real customer words, shown as tiny post-it notes on the home page. Only add reviews with the customer's permission."
    folder: src/content/reviews
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{name}}"
    extension: md
    format: frontmatter
    summary: "{{name}}: {{quote}}"
    fields:
      - label: One short line for the sticky note
        name: quote
        widget: string
        hint: "Max 50 characters, ideally one line. Use the customer's own words or a faithful short paraphrase. Only the newest 3 reviews show on the home page."
        pattern: ['^.{1,50}$', "1 to 50 characters"]

      - label: Their full original review (kept for reference, not shown)
        name: original
        widget: text
        required: false
        hint: "Paste what they actually wrote, so the short line can always be checked against it."

      - label: Name
        name: name
        widget: string
        hint: "First name, and an initial if you like. e.g. Aanya or Aanya S."

      - label: City or country
        name: location
        widget: string
        required: false

      - label: Date
        name: date
        widget: date
        format: YYYY-MM-DD
        hint: "Newest reviews show first. Only the latest 3 appear on the home page."

      - label: Draft — hide from website
        name: draft
        widget: boolean
        default: false

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

      - label: Last updated
        name: updated
        widget: date
        format: YYYY-MM-DD
        required: false
        hint: "Set this when you meaningfully update an old post. Google and AI tools see it as the modified date."

      - label: FAQ (for search and AI answers)
        name: faq
        widget: list
        required: false
        label_singular: Question
        summary: "{{fields.question}}"
        hint: "Add 3 to 7 real questions readers ask, each with a short, direct answer. They show at the end of the post."
        fields:
          - { label: Question, name: question, widget: string }
          - { label: Answer, name: answer, widget: text, hint: "Plain text, 1 to 3 sentences. Start with the direct answer." }

      - label: YouTube video
        name: video
        widget: object
        required: false
        collapsed: true
        hint: "Only for posts about one of your YouTube videos. It replaces the cover image with the video."
        fields:
          - { label: Video ID, name: youtubeId, widget: string, hint: "The part after v= in the YouTube link, e.g. zCY8Qw7isxk" }
          - { label: Video title, name: title, widget: string }
          - { label: Video description, name: description, widget: text }
          - { label: Upload date, name: uploadDate, widget: date, format: YYYY-MM-DD }
          - { label: Duration, name: duration, widget: string, hint: "ISO format: PT11M4S means 11 minutes 4 seconds" }
          - label: Chapters
            name: chapters
            widget: list
            required: false
            label_singular: Chapter
            summary: "{{fields.name}}"
            fields:
              - { label: Chapter name, name: name, widget: string }
              - { label: Start time in seconds, name: start, widget: number, value_type: int, min: 0, hint: "1:10 is 70 seconds" }

      - label: Post content
        name: body
        widget: markdown
        hint: "Write the full post here. Use ## for section headings."
`;

  return new Response(yaml, {
    headers: { 'Content-Type': 'text/yaml; charset=utf-8' },
  });
};
