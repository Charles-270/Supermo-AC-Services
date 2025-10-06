/**
 * Review types for product and order reviews
 */

import type { Timestamp } from 'firebase/firestore';

export interface Review {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  photos?: string[]; // URLs to uploaded photos
  helpful: number; // Count of helpful votes
  verified: boolean; // Verified purchase
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  photos?: File[];
}
