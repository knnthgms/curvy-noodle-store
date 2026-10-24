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
  /**
   * Active colour theme. Options (defined in src/styles/global.css):
   * 'cream' (default), 'rosebud', 'sage', 'lavender'.
   */
  theme: 'cream',
  /** Announcement shown in the site header. */
  announcement: 'Free shipping on orders above ₹500',
  /** WhatsApp number in international format, digits only (no "+"). */
  whatsappNumber: '919353164742',
  /** Human-readable phone number for display. */
  phone: '+91 93531 64742',
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
  { label: 'Store', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Planning Nook', href: '/blog' },
  { label: 'Noodle Notes', href: '/notes' },
  { label: 'About', href: '/about' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Contact', href: '/contact' },
] as const;

/**
 * Product categories, mirroring the original store's collections.
 * `image` and `description` are used on the /collections browse page.
 */
export const CATEGORIES = [
  {
    slug: 'emotion-mood',
    label: 'Emotion & Mood',
    image: '/images/collections/emotion-mood.svg',
    description:
      'Expressive characters for tracking how each day actually felt — happy, tired, anxious, motivated and more.',
    seoTitle: 'Emotion & Mood Planner Stickers India',
    seoDescription:
      'Hand-illustrated emotion and mood planner stickers for bullet journals and daily planners in India: happy, tired, anxious, motivated and more.',
    intro:
      'Emotion and mood planner stickers are hand-illustrated characters that let you log how each day felt at a glance: happy, tired, anxious, motivated and more. Stick one beside the date in your bullet journal or daily planner and you have a mood tracker that takes seconds to keep up.',
    guides: [
      { label: 'How to set up a mood tracker with stickers', href: '/blog/how-to-set-up-a-mood-tracker-in-your-bullet-journal-using-stickers/' },
      { label: '10 habit tracker ideas for your planner', href: '/blog/10-habit-tracker-ideas-for-your-planner-with-stickers-that-make-it-easy/' },
    ],
  },
  {
    slug: 'daily-activity',
    label: 'Daily Activity',
    image: '/images/collections/daily-activity.svg',
    description:
      'Hand-illustrated icons for everyday tasks: work, cooking, exercise, chores, study and rest.',
    seoTitle: 'Daily Activity Planner Stickers India',
    seoDescription:
      'Hand-illustrated daily activity planner stickers for work, cooking, exercise, chores, study and rest. Handmade in India for bullet journals and planners.',
    intro:
      'Daily activity stickers are hand-illustrated icons for everyday tasks: work, cooking, exercise, chores, study and rest. Use them to mark what you did, or plan to do, on each day so a busy planner stays easy to scan.',
    guides: [
      { label: 'How to use planner stickers in your bullet journal', href: '/blog/how-to-use-planner-stickers-in-your-bullet-journal-a-beginners-guide/' },
      { label: 'The best planners to use with sticker sheets in India', href: '/blog/the-best-planners-to-use-with-sticker-sheets-in-india-2026-guide/' },
    ],
  },
  {
    slug: 'bundles',
    label: 'Sticker Bundles',
    image: '/images/collections/bundles.svg',
    description:
      'Best value — big mixed packs with hundreds of stickers across multiple sheets.',
    seoTitle: 'Planner Sticker Bundles India (400+ Stickers)',
    seoDescription:
      'Best-value planner sticker bundles from Curvy Noodle: big mixed packs with hundreds of hand-illustrated emotion and activity stickers across multiple sheets.',
    intro:
      'Sticker bundles are the best-value way to buy: big mixed packs with hundreds of hand-illustrated emotion and activity stickers across multiple sheets, so there is a sticker for almost every kind of day.',
    guides: [
      { label: 'How to use planner stickers in your bullet journal', href: '/blog/how-to-use-planner-stickers-in-your-bullet-journal-a-beginners-guide/' },
      { label: '5 ways planner stickers help you stay consistent', href: '/blog/5-ways-planner-stickers-help-you-stay-consistent-and-actually-use-your-planner/' },
    ],
  },
  {
    slug: 'planner-tracker',
    label: 'Planner & Tracker',
    image: '/images/collections/planner-tracker.svg',
    description:
      'Combined mood-and-activity sheets and trackers for comprehensive daily planning.',
    seoTitle: 'Planner & Tracker Stickers: Mood and Activity',
    seoDescription:
      'Combined mood and activity planner sticker sheets and trackers from Curvy Noodle, handmade in India for comprehensive daily planning in bullet journals.',
    intro:
      'Planner and tracker sheets combine moods and activities on one sheet, so you can log how you felt and what you did in the same place. They suit daily planning in a bullet journal or a weekly planner.',
    guides: [
      { label: 'Plan with me: my weekly planner setup', href: '/blog/plan-with-me-my-weekly-planner-setup-using-curvy-noodle-stickers/' },
      { label: 'Bullet journal setup for beginners in India', href: '/blog/bullet-journal-setup-for-beginners-india-everything-you-need-to-start/' },
    ],
  },
  {
    slug: 'sample-stickers',
    label: 'Sample Packs',
    image: '/images/collections/sample-stickers.svg',
    description:
      'Sample sticker packs of curvy noodle most popular designs.',
    seoTitle: 'Planner Sticker Sample Packs (Trial Size)',
    seoDescription:
      'Try Curvy Noodle planner stickers in a small trial size. Sample packs of the most popular emotion and activity designs, handmade in India.',
    intro:
      'Sample packs let you try the most popular Curvy Noodle designs in a small size before choosing bigger sheets. They are a low-risk place to start if you are new to planner stickers.',
    guides: [
      { label: 'How to use planner stickers in your bullet journal', href: '/blog/how-to-use-planner-stickers-in-your-bullet-journal-a-beginners-guide/' },
    ],
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

