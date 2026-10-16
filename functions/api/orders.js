/**
 * POST /api/orders
 *
 * Creates a Razorpay order after validating item prices against the
 * static catalog built into the site at deploy time. The client never
 * sets the price — we recompute the total here.
 *
 * Required env vars: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 * Optional env var:  ORDERS (KV namespace for order storage)
 *
 * Request body (JSON):
 *   { items: [{ id, qty }], customer: { name, email, phone, address, city, state, pincode } }
 *
 * Response (JSON):
 *   { order_id, amount, currency, key_id }
 */
export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json({ error: 'Checkout is not configured yet.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { items, customer } = body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return json({ error: 'Cart is empty.' }, 400);
  }

  // Load the price catalog built into the static site.
  const catalogUrl = new URL('/api/catalog.json', request.url);
  let catalog;
  try {
    const resp = await env.ASSETS.fetch(catalogUrl.toString());
    catalog = await resp.json();
  } catch {
    return json({ error: 'Could not load product catalog.' }, 500);
  }

  // Validate every item against the catalog and compute the total.
  let subtotalPaise = 0;
  const lineItems = [];
  for (const item of items) {
    const entry = catalog[item.id];
    if (!entry) {
      return json({ error: `Unknown product: ${item.id}` }, 400);
    }
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return json({ error: `Invalid quantity for ${item.id}` }, 400);
    }
    subtotalPaise += entry.price * qty * 100; // convert ₹ to paise
    lineItems.push({ id: item.id, title: entry.title, qty, price: entry.price });
  }

  const SHIPPING_THRESHOLD_PAISE = 500 * 100;
  const SHIPPING_FEE_PAISE = 70 * 100;
  const shippingPaise = subtotalPaise >= SHIPPING_THRESHOLD_PAISE ? 0 : SHIPPING_FEE_PAISE;
  const totalPaise = subtotalPaise + shippingPaise;

  // Create the order on Razorpay.
  const receipt = `cn_${Date.now()}`;
  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  let rzpOrder;
  try {
    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: totalPaise, currency: 'INR', receipt }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      console.error('Razorpay order creation failed:', err);
      return json({ error: 'Payment provider error. Please try again.' }, 502);
    }
    rzpOrder = await resp.json();
  } catch {
    return json({ error: 'Could not reach payment provider.' }, 502);
  }

  // Optionally persist the order to KV for reference.
  if (env.ORDERS) {
    const record = {
      razorpay_order_id: rzpOrder.id,
      receipt,
      items: lineItems,
      subtotal: subtotalPaise / 100,
      shipping: shippingPaise / 100,
      total: totalPaise / 100,
      customer: customer ?? null,
      status: 'pending',
      created_at: Date.now(),
    };
    await env.ORDERS.put(`order:${rzpOrder.id}`, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 90, // 90 days
    });
  }

  return json({
    order_id: rzpOrder.id,
    amount: totalPaise,
    currency: 'INR',
    key_id: env.RAZORPAY_KEY_ID,
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
