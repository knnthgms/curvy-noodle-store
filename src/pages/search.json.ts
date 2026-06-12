import type { APIRoute } from 'astro';
import {
  getProducts,
  getPublishedPosts,
  postPath,
  productPath,
} from '@utils/collections';

/**
 * Static search index, built once at build time and served as a plain
 * JSON file — no external search service required. Consumed by the
 * client-side search on the shop and blog pages.
 */
export const GET: APIRoute = async () => {
  const [products, posts] = await Promise.all([
    getProducts(),
    getPublishedPosts(),
  ]);

  const items = [
    ...products.map((product) => ({
      type: 'product' as const,
      title: product.data.title,
      description: product.data.description,
      url: productPath(product),
      tags: [...product.data.tags, product.data.category],
    })),
    ...posts.map((post) => ({
      type: 'post' as const,
      title: post.data.title,
      description: post.data.description,
      url: postPath(post),
      tags: post.data.tags,
    })),
  ];

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
