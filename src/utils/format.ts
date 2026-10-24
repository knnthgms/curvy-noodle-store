import { CURRENCY } from '@config';

/** Format a whole-rupee price for display, e.g. 149 → "₹149". */
export function formatPrice(price: number): string {
  return `${CURRENCY.symbol}${price.toLocaleString('en-IN')}`;
}

/** Human-readable date, e.g. "12 June 2026". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** ISO date string (yyyy-mm-dd) for <time datetime> and structured data. */
export function isoDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

/** Seconds as a clock time, e.g. 70 → "1:10". */
export function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

/**
 * Estimated reading time in whole minutes, assuming ~200 words per minute.
 * Always returns at least 1.
 */
export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
