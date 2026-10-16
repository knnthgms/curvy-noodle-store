import type { APIRoute } from 'astro';
import { getProducts, productSlug } from '@utils/collections';

// Built at deploy time — Pages Function reads this via env.ASSETS.fetch()
// to validate prices server-side without trusting the client.
export const GET: APIRoute = async () => {
  const products = await getProducts();
  const catalog: Record<string, { price: number; title: string }> = {};
  for (const product of products) {
    catalog[productSlug(product)] = {
      price: product.data.price,
      title: product.data.title,
    };
  }
  return new Response(JSON.stringify(catalog), {
    headers: { 'Content-Type': 'application/json' },
  });
};
