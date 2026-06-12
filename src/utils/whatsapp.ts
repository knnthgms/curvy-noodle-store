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
