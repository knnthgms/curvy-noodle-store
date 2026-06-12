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
    logo: absolute('/images/branding/logo.svg'),
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
  image: string;
  price: number;
  url: string;
  material: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: absolute(input.image),
    url: absolute(input.url),
    material: input.material,
    brand: { '@type': 'Brand', name: SITE.name },
    offers: {
      '@type': 'Offer',
      price: input.price,
      priceCurrency: CURRENCY.code,
      availability: 'https://schema.org/InStock',
      url: absolute(input.url),
    },
  };
}

export function blogPostingSchema(input: {
  title: string;
  description: string;
  date: Date;
  url: string;
  image: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    datePublished: input.date.toISOString(),
    url: absolute(input.url),
    image: absolute(input.image),
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: {
        '@type': 'ImageObject',
        url: absolute('/images/branding/logo.svg'),
      },
    },
  };
}
