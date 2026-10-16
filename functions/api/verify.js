/**
 * POST /api/verify
 *
 * Verifies a Razorpay payment signature via HMAC-SHA256 using the Web
 * Crypto API (no Node.js Buffer needed — Workers-compatible).
 *
 * Required env vars: RAZORPAY_KEY_SECRET
 * Optional env var:  ORDERS (KV namespace — marks the order as paid)
 *
 * Request body (JSON):
 *   { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 *
 * Response (JSON):
 *   200 { ok: true, payment_id }
 *   400 { error: "..." }
 */
export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_SECRET) {
    return json({ error: 'Not configured.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {};
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return json({ error: 'Missing payment fields.' }, 400);
  }

  // Compute expected signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.RAZORPAY_KEY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const message = `${razorpay_order_id}|${razorpay_payment_id}`;
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (expected !== razorpay_signature) {
    return json({ error: 'Payment verification failed.' }, 400);
  }

  // Mark the order as paid in KV if the namespace is bound.
  if (env.ORDERS) {
    const raw = await env.ORDERS.get(`order:${razorpay_order_id}`);
    if (raw) {
      const record = JSON.parse(raw);
      record.status = 'paid';
      record.payment_id = razorpay_payment_id;
      record.paid_at = Date.now();
      await env.ORDERS.put(`order:${razorpay_order_id}`, JSON.stringify(record), {
        expirationTtl: 60 * 60 * 24 * 90,
      });
    }
  }

  return json({ ok: true, payment_id: razorpay_payment_id });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
