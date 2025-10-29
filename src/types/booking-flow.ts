/**
 * Booking Flow Types
 * Types specific to the new 4-step booking flow redesign
 */

/**
 * Service IDs for the new booking flow
 */
export type ServiceId = 'install' | 'maint' | 'repair' | 'inspect';

/**
 * Service Interface
 * Represents a bookable AC service in the catalog
 */
export interface Service {
  id: ServiceId;
  name: string;
  description: string;
  priceFrom: number; // Starting price in GHC
  imageUrl: string;
}

/**
 * Time Slot Interface
 * Represents an available appointment time slot
 */
export interface TimeSlot {
  start: string; // ISO 8601 datetime string
  end: string;   // ISO 8601 datetime string
  available: boolean;
}

/**
 * Customer Information
 * Contact and location details for the booking
 */
export interface CustomerInfo {
  name: string;
  phone: string;
  countryCode: string; // e.g., "+233"
  email?: string;
  address: string;
  notes?: string;
}

/**
 * Booking Draft Interface
 * Temporary state object persisted across booking steps
 */
export interface BookingDraft {
  service?: Service;
  date?: string; // YYYY-MM-DD format
  timeSlot?: TimeSlot;
  customer?: CustomerInfo;
}

/**
 * Technician Assignment
 * Information about assigned technician
 */
export interface TechnicianAssignment {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  assignedAt: string; // ISO timestamp
}

/**
 * Booking Status for the new flow
 */
export type BookingFlowStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

/**
 * Complete Booking Interface
 * Full booking record after submission
 */
export interface BookingRecord {
  id: string;
  bookingNumber: string; // Format: VRM#####P
  service: Service;
  date: string; // YYYY-MM-DD
  timeSlot: TimeSlot;
  customer: CustomerInfo;
  status: BookingFlowStatus;
  technician?: TechnicianAssignment;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Booking Step
 * Represents the current step in the booking flow
 */
export type BookingStep = 1 | 2 | 3 | 4;

/**
 * Step Labels
 */
export const BOOKING_STEP_LABELS: Record<BookingStep, string> = {
  1: 'Service',
  2: 'Select Date',
  3: 'Details',
  4: 'Done',
};

/**
 * Status Badge Colors
 */
export const BOOKING_STATUS_COLORS: Record<BookingFlowStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  'in-progress': 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

/**
 * Status Labels
 */
export const BOOKING_STATUS_LABELS_FLOW: Record<BookingFlowStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
