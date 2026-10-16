export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

const CART_KEY = 'cn_cart';
export const SHIPPING_THRESHOLD = 500;
export const SHIPPING_FEE = 70;

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable — continue without persisting
  }
  window.dispatchEvent(new CustomEvent('cart:change', { detail: items }));
}

export function addToCart(item: Omit<CartItem, 'qty'> & { qty?: number }): void {
  const cart = getCart();
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.qty += item.qty ?? 1;
  } else {
    cart.push({ ...item, qty: item.qty ?? 1 });
  }
  saveCart(cart);
}

export function updateQty(id: string, qty: number): void {
  const cart = getCart();
  const idx = cart.findIndex((c) => c.id === id);
  if (idx === -1) return;
  if (qty <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].qty = qty;
  }
  saveCart(cart);
}

export function removeFromCart(id: string): void {
  saveCart(getCart().filter((c) => c.id !== id));
}

export function clearCart(): void {
  saveCart([]);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function cartShipping(subtotal: number): number {
  return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function cartTotal(items: CartItem[]): number {
  const sub = cartSubtotal(items);
  return sub + cartShipping(sub);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
