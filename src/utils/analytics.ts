/**
 * Typed, browser-only analytics helpers.
 * Import from a <script> block (not Astro frontmatter).
 *
 * Wraps window.gtag (GA4) and window.clarity so events fire consistently
 * whether or not either tool is loaded (both queue until the SDK arrives).
 */

export interface EcomItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
}

type Gtag = (command: string, ...args: unknown[]) => void;
type Clarity = (command: string, ...args: unknown[]) => void;

function g(event: string, params?: Record<string, unknown>) {
  const fn = (window as unknown as { gtag?: Gtag }).gtag;
  if (fn) fn('event', event, params);
}

function c(command: string, ...args: unknown[]) {
  const fn = (window as unknown as { clarity?: Clarity }).clarity;
  if (fn) fn(command, ...args);
}

/** GA4 standard — product detail page viewed. */
export function trackViewItem(item: EcomItem) {
  g('view_item', { currency: 'INR', value: item.price ?? 0, items: [item] });
  c('set', 'product_id', item.item_id);
  c('set', 'page_type', 'product');
}

/** GA4 standard — product list rendered (shop, collection, home featured, related). */
export function trackViewItemList(items: EcomItem[], listName: string, listId = listName) {
  g('view_item_list', { item_list_id: listId, item_list_name: listName, items });
  c('set', 'page_type', listId.startsWith('collection_') ? 'collection' : 'shop');
}

/** GA4 standard — user clicked a product card. */
export function trackSelectItem(item: EcomItem, listName: string) {
  g('select_item', { item_list_name: listName, items: [item] });
}

/** GA4 standard + Clarity — search performed. */
export function trackSearch(query: string, resultCount: number) {
  g('search', { search_term: query, result_count: resultCount });
  c('event', 'search');
}

/** GA4 custom — category filter applied. */
export function trackFilterApplied(value: string) {
  g('filter_applied', { filter_type: 'category', filter_value: value });
}

/** GA4 custom + Clarity — WhatsApp CTA clicked. */
export function trackWhatsAppClick(label: string, item?: EcomItem) {
  g('whatsapp_click', {
    event_category: 'conversion',
    event_label: label,
    transport_type: 'beacon',
    ...(item && { items: [item], value: item.price, currency: 'INR' }),
  });
  c('event', 'whatsapp_click');
}

/** GA4 custom + Clarity — newsletter form submitted. */
export function trackNewsletterSubmit() {
  g('newsletter_submit', { event_category: 'engagement' });
  c('event', 'newsletter_submit');
}

/** GA4 custom — gallery thumbnail clicked to swap the main image. */
export function trackGalleryImageView(productId: string, position: number) {
  g('gallery_image_view', { product_id: productId, image_position: position });
}
