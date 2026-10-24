import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Product catalogue. One Markdown file per product in `src/content/products/`.
 * The filename (minus `.md`) becomes the URL slug unless `slug` is set
 * explicitly in frontmatter.
 */
const products = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/products' }),
  schema: z.object({
    title: z.string(),
    /** Optional explicit slug; defaults to the filename. */
    slug: z.string().optional(),
    /** Price in whole rupees (INR). */
    price: z.number().positive(),
    /** Original price shown struck through when the product is on sale. */
    compareAtPrice: z.number().positive().optional(),
    category: z.enum([
      'emotion-mood',
      'daily-activity',
      'bundles',
      'planner-tracker',
      'sample-stickers',  
    ]),
    tags: z.array(z.string()).default([]),
    /** Short summary used on cards and in meta descriptions. */
    description: z.string().max(200),
    /** Featured products appear on the home page. */
    featured: z.boolean().default(false),
    /** Main image, served from /public (e.g. /images/products/foo.svg). */
    image: z.string(),
    imageAlt: z.string(),
    /** Additional gallery images shown on the product page. */
    gallery: z
      .array(z.object({ src: z.string(), alt: z.string() }))
      .default([]),
    dimensions: z.string(),
    material: z.string(),
    /** Show the comments section on the product page. */
    comments: z.boolean().default(true),
    /** Short title for Google (about 45 characters). Falls back to `title`. */
    seoTitle: z.string().optional(),
  }),
});

/**
 * Blog. One Markdown file per post in `src/content/blog/`.
 * Posts with `draft: true` are excluded from listings, feeds and search.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string(),
    coverImageAlt: z.string(),
    draft: z.boolean().default(false),
    /** Show the comments section under the post. */
    comments: z.boolean().default(true),
    /** Short title for Google (about 45 characters). Falls back to `title`. */
    seoTitle: z.string().optional(),
    /** Date of the last meaningful update (shown to search engines as dateModified). */
    updated: z.coerce.date().optional(),
    /**
     * Questions and answers shown at the end of the post and sent to search and
     * AI answer engines as FAQPage structured data. Plain text answers only,
     * and they must match what a reader sees on the page.
     */
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .default([]),
    /** A YouTube video this post is about: embedded, with VideoObject structured data. */
    video: z
      .object({
        youtubeId: z.string(),
        title: z.string(),
        description: z.string(),
        uploadDate: z.coerce.date(),
        /** ISO 8601 duration, e.g. PT11M4S. */
        duration: z.string(),
        /** Chapters: name and start time in seconds. Become "key moments". */
        chapters: z
          .array(z.object({ name: z.string(), start: z.number().int().min(0) }))
          .default([]),
      })
      .optional(),
  }),
});

/**
 * Noodle Notes: short, casual updates (stationery finds, desk shots, what
 * I'm using right now). One Markdown file per note in `src/content/notes/`.
 * Notes with `draft: true` are excluded from listings.
 */
const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    /** Optional photo, served from /public (e.g. /images/notes/desk.jpg). */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    /** Show the comments section under the note. */
    comments: z.boolean().default(true),
  }),
});

/**
 * Customer reviews, shown as post-it notes on the home page. One Markdown file
 * per review in `src/content/reviews/` (frontmatter only). Only add real words
 * from real customers, with their permission.
 */
const reviews = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/reviews' }),
  schema: z.object({
    /** One short line shown on the post-it (max 50 characters), taken from what they said. */
    quote: z.string().max(50),
    /** The customer's full original review. Kept for reference, never shown. */
    original: z.string().optional(),
    /** First name (and initial if you like). */
    name: z.string(),
    location: z.string().optional(),
    /** Used for ordering: newest reviews show first. */
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { products, blog, notes, reviews };
