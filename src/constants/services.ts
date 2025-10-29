/**
 * Service Catalog Constants
 * Service data with images and pricing for the booking flow
 */

import type { Service } from '@/types/booking-flow';

/**
 * Available AC Services
 * Real service data with images
 * Note: Using Unsplash images as temporary placeholders until custom images are uploaded to Firebase Storage
 */
export const SERVICES: Service[] = [
  {
    id: 'install',
    name: 'AC Installation',
    description: 'Install new air conditioning units in your property.',
    priceFrom: 500.00,
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 'maint',
    name: 'AC Maintenance',
    description: 'Regular servicing to keep your AC running efficiently.',
    priceFrom: 150.00,
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 'repair',
    name: 'AC Repair',
    description: 'Fix issues and restore AC functionality.',
    priceFrom: 200.00,
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 'inspect',
    name: 'AC Inspection',
    description: 'Professional assessment of AC system condition.',
    priceFrom: 100.00,
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&q=80',
  },
];

/**
 * Get service by ID
 */
export function getServiceById(id: string): Service | undefined {
  return SERVICES.find(service => service.id === id);
}

/**
 * Search services by query
 */
export function searchServices(query: string): Service[] {
  if (!query.trim()) {
    return SERVICES;
  }

  const lowerQuery = query.toLowerCase();
  return SERVICES.filter(service =>
    service.name.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery)
  );
}
