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
  }),
});

export const collections = { products, blog };
