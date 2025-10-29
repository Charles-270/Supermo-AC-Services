/**
 * Booking Storage Utilities
 * Session storage management for BookingDraft persistence
 */

import type { BookingDraft } from '@/types/booking-flow';

const STORAGE_KEY = 'coolair_booking_draft';

/**
 * Save booking draft to session storage
 */
export function saveBookingDraft(draft: BookingDraft): void {
  try {
    const serialized = JSON.stringify(draft);
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save booking draft:', error);
  }
}

/**
 * Load booking draft from session storage
 */
export function loadBookingDraft(): BookingDraft | null {
  try {
    const serialized = sessionStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized) as BookingDraft;
  } catch (error) {
    console.error('Failed to load booking draft:', error);
    return null;
  }
}

/**
 * Clear booking draft from session storage
 */
export function clearBookingDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear booking draft:', error);
  }
}

/**
 * Update specific field in booking draft
 */
export function updateBookingDraft(updates: Partial<BookingDraft>): void {
  try {
    const current = loadBookingDraft() || {};
    const updated = { ...current, ...updates };
    saveBookingDraft(updated);
  } catch (error) {
    console.error('Failed to update booking draft:', error);
  }
}

/**
 * Check if booking draft exists
 */
export function hasBookingDraft(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}
