/**
 * Merge CSS class names, filtering out falsy values.
 *
 * Uses template-literal–friendly concatenation (no external deps).
 *
 * @example
 * cn('px-4', isActive && 'bg-blue-500', undefined, 'text-white')
 * // => 'px-4 bg-blue-500 text-white'
 */
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(' ')
}

/**
 * Format an ISO date string into a human-readable format.
 *
 * @param date    - ISO 8601 date string or Date object.
 * @param options - Optional `Intl.DateTimeFormatOptions` overrides.
 * @returns A formatted date string (e.g. "Jun 6, 2026").
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(
    typeof date === 'string' ? new Date(date) : date
  )
}

/**
 * Returns a promise that resolves after the given number of milliseconds.
 *
 * Useful for rate-limiting, retries, or artificial delays in development.
 *
 * @param ms - Milliseconds to wait.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Truncate a string to a maximum length, appending an ellipsis if needed.
 *
 * @param text      - The input string.
 * @param maxLength - Maximum character count (default 100).
 * @returns The (possibly truncated) string.
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}
