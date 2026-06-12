/**
 * Central site configuration.
 * Edit this file to update brand details, navigation, categories and socials —
 * every component reads from here, so changes propagate site-wide.
 */

export const SITE = {
  name: 'The Curvy Noodle Shop',
  tagline:
    'Cute stickers for journals, laptops, water bottles, and everyday adventures.',
  description:
    'The Curvy Noodle Shop is a tiny independent sticker studio making playful, handmade-style stickers for journals, planners, laptops and water bottles. Browse the shop and order over WhatsApp.',
  url: import.meta.env.SITE ?? 'https://thecurvynoodleshop.com',
  locale: 'en',
  /**
   * WhatsApp number in international format, digits only (no "+").
   * PLACEHOLDER — replace with the real business number before launch.
   */
  whatsappNumber: '919999999999',
  email: 'hello@thecurvynoodleshop.com',
  /** Social profile URLs (placeholders — update before launch). */
  socials: {
    instagram: 'https://www.instagram.com/thecurvynoodleshop',
    pinterest: 'https://www.pinterest.com/thecurvynoodleshop',
  },
  /** Default Open Graph image (1200x630). Replace with real artwork. */
  defaultOgImage: '/images/branding/og-default.png',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Product categories. The slug is stored in product frontmatter. */
export const CATEGORIES = [
  { slug: 'food-drink', label: 'Food & Drink' },
  { slug: 'animals', label: 'Animals' },
  { slug: 'celestial', label: 'Celestial' },
  { slug: 'plants', label: 'Plants' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

/** Look up a category's display label from its slug. */
export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

/** Prices are stored as whole rupees in product frontmatter. */
export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
} as const;
