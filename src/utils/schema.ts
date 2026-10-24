import { CURRENCY, SITE } from '@config';

/**
 * JSON-LD structured data builders (schema.org).
 * Each function returns a plain object; pages serialise them into
 * <script type="application/ld+json"> via the SEO component.
 */

type JsonLd = Record<string, unknown>;

const absolute = (path: string): string => new URL(path, SITE.url).href;

export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: absolute('/images/branding/logo.PNG'),
    email: SITE.email,
    sameAs: Object.values(SITE.socials),
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
  };
}

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current (last) page. */
  href?: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absolute(item.href) } : {}),
    })),
  };
}

export function productSchema(input: {
  name: string;
  description: string;
  /** Main image first, then any gallery images. */
  images: string[];
  price: number;
  url: string;
  material: string;
  sku: string;
  category: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.images.map((image) => absolute(image)),
    url: absolute(input.url),
    sku: input.sku,
    category: input.category,
    material: input.material,
    brand: { '@type': 'Brand', name: SITE.name },
    offers: {
      '@type': 'Offer',
      price: input.price,
      priceCurrency: CURRENCY.code,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: absolute(input.url),
      seller: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    },
  };
}

/** A list of pages, e.g. the products in a collection or the posts on a blog page. */
export function itemListSchema(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absolute(item.url),
    })),
  };
}

/** A page of a given schema.org type (AboutPage, ContactPage, CollectionPage, Blog...). */
export function pageSchema(input: {
  type: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'Blog';
  name: string;
  description: string;
  url: string;
  /** For list pages: the items on the page. */
  items?: { name: string; url: string }[];
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': input.type,
    name: input.name,
    description: input.description,
    url: absolute(input.url),
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
    ...(input.items && input.items.length > 0 ? { mainEntity: itemListSchema(input.items) } : {}),
  };
}

export interface VideoInput {
  youtubeId: string;
  title: string;
  description: string;
  uploadDate: Date;
  duration: string;
  chapters: { name: string; start: number }[];
}

/** ISO 8601 duration (e.g. PT11M4S) in seconds. */
function durationSeconds(duration: string): number | undefined {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
  if (!match) return undefined;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

/** VideoObject for a YouTube video, with chapters as Clip "key moments". */
export function videoSchema(video: VideoInput, pageUrl: string): JsonLd {
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: [`https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`],
    uploadDate: video.uploadDate.toISOString(),
    duration: video.duration,
    embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
    contentUrl: watchUrl,
    url: absolute(pageUrl),
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    ...(video.chapters.length > 0
      ? {
          hasPart: video.chapters.map((chapter, index) => ({
            '@type': 'Clip',
            name: chapter.name,
            startOffset: chapter.start,
            endOffset: video.chapters[index + 1]?.start ?? durationSeconds(video.duration),
            url: `${watchUrl}&t=${chapter.start}s`,
          })),
        }
      : {}),
  };
}

/** FAQPage structured data. The same questions and answers must be visible on the page. */
export function faqSchema(items: { question: string; answer: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function blogPostingSchema(input: {
  title: string;
  description: string;
  date: Date;
  /** Last meaningful update; defaults to the publish date. */
  updated?: Date;
  url: string;
  image: string;
  keywords?: string[];
  wordCount?: number;
  video?: VideoInput;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    datePublished: input.date.toISOString(),
    dateModified: (input.updated ?? input.date).toISOString(),
    url: absolute(input.url),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absolute(input.url) },
    image: absolute(input.image),
    inLanguage: 'en',
    ...(input.keywords && input.keywords.length > 0 ? { keywords: input.keywords.join(', ') } : {}),
    ...(input.wordCount ? { wordCount: input.wordCount } : {}),
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: {
        '@type': 'ImageObject',
        url: absolute('/images/branding/logo.PNG'),
      },
    },
    ...(input.video
      ? {
          video: {
            '@type': 'VideoObject',
            name: input.video.title,
            description: input.video.description,
            thumbnailUrl: `https://i.ytimg.com/vi/${input.video.youtubeId}/maxresdefault.jpg`,
            uploadDate: input.video.uploadDate.toISOString(),
            embedUrl: `https://www.youtube.com/embed/${input.video.youtubeId}`,
          },
        }
      : {}),
  };
}
