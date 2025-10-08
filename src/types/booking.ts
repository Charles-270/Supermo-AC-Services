/**
 * Booking Types and Interfaces
 * Service booking system for HVAC services
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Service Types
 */
export type ServiceType = 'installation' | 'maintenance' | 'repair' | 'inspection';

/**
 * AC Unit Types
 */
export type ACUnitType = 'split' | 'window' | 'central' | 'portable' | 'other';

/**
 * Booking Status
 */
export type BookingStatus =
  | 'pending'           // Awaiting admin assignment
  | 'confirmed'         // Assigned to technician
  | 'en_route'          // Technician traveling to location
  | 'arrived'           // Technician on-site
  | 'in_progress'       // Technician working
  | 'completed'         // Job finished
  | 'cancelled'         // Cancelled by customer/admin
  | 'rescheduled';      // Date changed

/**
 * Priority Level
 */
export type PriorityLevel = 'normal' | 'urgent' | 'emergency';

/**
 * Service Details per Type
 */
export interface ServiceDetails {
  // Installation
  acUnitType?: ACUnitType;
  roomCount?: number;
  hasExistingUnit?: boolean;

  // Maintenance
  lastServiceDate?: Date;
  servicePlan?: 'basic' | 'premium' | 'vip';

  // Repair
  issueDescription?: string;
  urgencyLevel?: PriorityLevel;

  // Inspection
  propertyType?: 'residential' | 'commercial';
  unitCount?: number;
}

/**
 * Booking Interface
 * Stored in Firestore 'bookings' collection
 */
export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Service Information
  serviceType: ServiceType;
  serviceDetails: ServiceDetails;

  // Scheduling
  preferredDate: Timestamp;
  preferredTimeSlot: 'morning' | 'afternoon' | 'evening';
  alternateDate?: Timestamp;

  // Location
  address: string;
  city: string;
  locationNotes?: string;

  // Assignment
  technicianId?: string;
  technicianName?: string;
  technicianEmail?: string;
  technicianPhone?: string;
  assignedDate?: Timestamp;

  // Status & Tracking
  status: BookingStatus;
  priority: PriorityLevel;
  estimatedDuration?: number; // in minutes
  estimatedCost?: number;

  // Completion Details
  actualStartTime?: Timestamp;
  actualEndTime?: Timestamp;
  finalCost?: number;
  serviceNotes?: string;
  laborHours?: number;
  partsUsed?: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  customerSignature?: string; // Base64 data URL
  customerRating?: number; // 1-5 stars
  customerReview?: string;

  // Photos
  beforePhotos?: string[]; // Storage URLs
  afterPhotos?: string[];

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;

  // Metadata
  paymentStatus?: 'pending' | 'partial' | 'paid';
  paymentMethod?: 'cash' | 'momo' | 'card';
  invoiceUrl?: string;
}

/**
 * Booking Form Data
 * Used in booking creation flow
 */
export interface BookingFormData {
  serviceType: ServiceType;
  serviceDetails: ServiceDetails;
  preferredDate: Date;
  preferredTimeSlot: 'morning' | 'afternoon' | 'evening';
  alternateDate?: Date;
  address: string;
  city: string;
  locationNotes?: string;
  customerPhone: string;
}

/**
 * Service Type Labels
 */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  installation: 'AC Installation',
  maintenance: 'AC Maintenance',
  repair: 'AC Repair',
  inspection: 'AC Inspection',
};

/**
 * Service Type Descriptions
 */
export const SERVICE_TYPE_DESCRIPTIONS: Record<ServiceType, string> = {
  installation: 'Install new air conditioning units in your property',
  maintenance: 'Regular servicing to keep your AC running efficiently',
  repair: 'Fix issues and restore AC functionality',
  inspection: 'Professional assessment of AC system condition',
};

/**
 * Service Type Pricing (Ghana Cedis - GHS)
 */
export const SERVICE_BASE_PRICING: Record<ServiceType, number> = {
  installation: 500,
  maintenance: 150,
  repair: 200,
  inspection: 100,
};

/**
 * Time Slot Labels
 */
export const TIME_SLOT_LABELS = {
  morning: 'Morning (8:00 AM - 12:00 PM)',
  afternoon: 'Afternoon (12:00 PM - 4:00 PM)',
  evening: 'Evening (4:00 PM - 8:00 PM)',
};

/**
 * Status Labels
 */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending Assignment',
  confirmed: 'Confirmed',
  en_route: 'En Route',
  arrived: 'Arrived On-Site',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rescheduled: 'Rescheduled',
};

/**
 * Status Badge Variants (for UI)
 */
export const BOOKING_STATUS_VARIANTS: Record<BookingStatus, 'default' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  confirmed: 'default',
  en_route: 'default',
  arrived: 'default',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'destructive',
  rescheduled: 'warning',
};

/**
 * Ghana Cities (for dropdown)
 */
export const GHANA_CITIES = [
  'Accra',
  'Kumasi',
  'Tema',
  'Takoradi',
  'Tamale',
  'Cape Coast',
  'Koforidua',
  'Sunyani',
  'Ho',
  'Wa',
  'Other',
];
