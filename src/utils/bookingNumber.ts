/**
 * Booking Number Generator
 * Generates unique booking numbers in format: VRM#####P
 */

/**
 * Generate a unique booking number
 * Format: VRM + 5 random digits + P
 * Example: VRM11249P
 */
export function generateBookingNumber(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit number
  return `VRM${randomDigits}P`;
}

/**
 * Validate booking number format
 */
export function isValidBookingNumber(bookingNumber: string): boolean {
  const pattern = /^VRM\d{5}P$/;
  return pattern.test(bookingNumber);
}

/**
 * Format booking number for display
 * Adds spacing for better readability
 */
export function formatBookingNumber(bookingNumber: string): string {
  if (!isValidBookingNumber(bookingNumber)) {
    return bookingNumber;
  }
  // VRM 11249 P
  return bookingNumber.replace(/^(VRM)(\d{5})(P)$/, '$1 $2 $3');
}
