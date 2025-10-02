import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to handle conflicts
 *
 * @example
 * cn('px-4 py-2', 'bg-blue-500', condition && 'text-white')
 * cn('px-4', 'px-6') // Returns 'px-6' (tailwind-merge removes conflicting px-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency for Ghana Cedis (GH₵)
 *
 * @example
 * formatCurrency(1500) // Returns "GH₵ 1,500.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date for Ghana locale
 *
 * @example
 * formatDate(new Date()) // Returns "02/10/2025" (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Format date and time for Ghana locale
 *
 * @example
 * formatDateTime(new Date()) // Returns "02/10/2025, 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Truncate text with ellipsis
 *
 * @example
 * truncate("Long text here", 10) // Returns "Long text..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Debounce function for performance optimization
 * Useful for search inputs, resize handlers, etc.
 *
 * @example
 * const debouncedSearch = debounce((query) => searchAPI(query), 300)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Sleep utility for async operations
 *
 * @example
 * await sleep(1000) // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a random ID
 *
 * @example
 * generateId() // Returns "abc123xyz"
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Check if code is running on client side
 */
export const isClient = typeof window !== 'undefined'

/**
 * Check if code is running on server side
 */
export const isServer = typeof window === 'undefined'
