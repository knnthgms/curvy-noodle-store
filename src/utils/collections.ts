import { getCollection, type CollectionEntry } from 'astro:content';

export type Product = CollectionEntry<'products'>;
export type Post = CollectionEntry<'blog'>;

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
