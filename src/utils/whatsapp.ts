import { SITE } from '@config';

/**
 * Build a wa.me deep link that opens WhatsApp with a pre-filled order
 * message for the given product.
 */
export function whatsappOrderLink(productName: string): string {
  const message = `Hi! I would like to order the ${productName} sticker.`;
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Generic "say hi" WhatsApp link used outside of product pages. */
export function whatsappChatLink(
  message = 'Hi! I have a question about your stickers.',
): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Wrap a direct wa.me URL in the internal `/go/whatsapp` redirect so the
 * click is counted as a conversion in Cloudflare Web Analytics (which only
 * measures page views, not custom events). `label` tags the source/product
 * for Google Analytics, if enabled. See src/pages/go/whatsapp.astro.
 */
export function trackedWhatsAppLink(directUrl: string, label: string): string {
  const params = new URLSearchParams({ to: directUrl, p: label });
  return `/go/whatsapp/?${params.toString()}`;
}
