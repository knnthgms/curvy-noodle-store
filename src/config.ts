/**
 * Central site configuration.
 * Edit this file to update brand details, navigation, categories and socials —
 * every component reads from here, so changes propagate site-wide.
 */

export const SITE = {
  name: 'Curvy Noodle',
  tagline:
    'Handmade planner stickers for bullet journals & daily planners — shipped across India.',
  description:
    'Welcome to your new favourite planner stickers store. Curvy Noodle makes handmade planner stickers for bullet journals and daily planners — emotion trackers, daily activity sheets and bundles, shipped across India.',
  url: import.meta.env.SITE ?? 'https://curvynoodle.com',
  locale: 'en',
  /** Announcement shown in the site header. */
  announcement: 'Free shipping on orders above ₹500',
  /**
   * WhatsApp number in international format, digits only (no "+").
   * PLACEHOLDER — replace with the real business number before launch.
   */
  whatsappNumber: '919999999999',
  email: 'curvynoodle04@gmail.com',
  socials: {
    instagram: 'https://www.instagram.com/curvy_noodle/',
    youtube: 'https://youtube.com/@curvynoodle',
  },
  /** Default Open Graph image (1200x630). TODO: replace with real artwork. */
  defaultOgImage: '/images/branding/og-default.png',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Planning Nook', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Contact', href: '/contact' },
] as const;

/**
 * Product categories, mirroring the original store's collections.
 * `emoji` and `description` are used on the /collections browse page.
 */
export const CATEGORIES = [
  {
    slug: 'emotion-mood',
    label: 'Emotion & Mood',
    emoji: '😊',
    description:
      'Expressive characters for tracking how each day actually felt — happy, tired, anxious, motivated and more.',
  },
  {
    slug: 'daily-activity',
    label: 'Daily Activity',
    emoji: '✅',
    description:
      'Hand-illustrated icons for everyday tasks: work, cooking, exercise, chores, study and rest.',
  },
  {
    slug: 'bundles',
    label: 'Sticker Bundles',
    emoji: '🎁',
    description:
      'Best value — big mixed packs with hundreds of stickers across multiple sheets.',
  },
  {
    slug: 'planner-tracker',
    label: 'Planner & Tracker',
    emoji: '📅',
    description:
      'Combined mood-and-activity sheets and trackers for comprehensive daily planning.',
  },
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

/**
 * Social proof / testimonials.
 * Set `showSocialProof` to true once you have a few real testimonials below.
 * The section is hidden automatically while the list is empty.
 */
export const SOCIAL_PROOF = {
  showSocialProof: false,
  testimonials: [
    // Example shape — replace with real customer quotes, then flip the flag:
    // {
    //   quote: 'These stickers made me actually stick with my planner!',
    //   name: 'Aanya',
    //   location: 'Bengaluru',
    // },
  ] as { quote: string; name: string; location?: string }[],
} as const;
