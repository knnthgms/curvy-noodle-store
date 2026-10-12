import { getCollection, type CollectionEntry } from 'astro:content';

export type Product = CollectionEntry<'products'>;
export type Post = CollectionEntry<'blog'>;

export type Note = CollectionEntry<'notes'>;

/** URL slug for a product (frontmatter override or filename). */
export function productSlug(product: Product): string {
  return product.data.slug ?? product.id;
}

/** Absolute path to a product page. */
export function productPath(product: Product): string {
  return `/shop/${productSlug(product)}/`;
}

/** Absolute path to a blog post. */
export function postPath(post: Post): string {
  return `/blog/${post.id}/`;
}

/** All products, alphabetical by title. */
export async function getProducts(): Promise<Product[]> {
  const products = await getCollection('products');
  return products.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

/** Products in a given category, alphabetical by title. */
export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.data.category === category);
}

/** Published (non-draft) posts, newest first. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Absolute path to a Noodle Note. */
export function notePath(note: Note): string {
  return `/notes/${note.id}/`;
}

/** Published (non-draft) notes, newest first. */
export async function getPublishedNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  return notes.sort(
    (a, b) =>
      b.data.date.valueOf() - a.data.date.valueOf() || b.id.localeCompare(a.id),
  );
}

/** Plain-text excerpt of a note's Markdown body, cut at `max` characters. */
export function noteExcerpt(note: Note, max = 160): string {
  const text = (note.body ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

/**
 * Products related to the given one: same category first, then other
 * products as filler, never the product itself. Capped at `limit`.
 */
export function relatedProducts(
  product: Product,
  all: Product[],
  limit = 3,
): Product[] {
  const others = all.filter((p) => p.id !== product.id);
  const sameCategory = others.filter(
    (p) => p.data.category === product.data.category,
  );
  const rest = others.filter((p) => p.data.category !== product.data.category);
  return [...sameCategory, ...rest].slice(0, limit);
}
