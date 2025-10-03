/**
 * Booking Service
 * Manages Firestore booking operations
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit as firestoreLimit,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Booking, BookingFormData, BookingStatus } from '@/types/booking';

/**
 * Create a new booking
 */
export async function createBooking(
  formData: BookingFormData,
  userId: string,
  userName: string,
  userEmail: string
): Promise<string> {
  try {
    const bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: userId,
      customerName: userName,
      customerEmail: userEmail,
      customerPhone: formData.customerPhone,

      serviceType: formData.serviceType,
      serviceDetails: formData.serviceDetails,

      preferredDate: formData.preferredDate as unknown as Timestamp,
      preferredTimeSlot: formData.preferredTimeSlot,
      alternateDate: formData.alternateDate as unknown as Timestamp | undefined,

      address: formData.address,
      city: formData.city,
      locationNotes: formData.locationNotes,

      status: 'pending',
      priority: formData.serviceDetails.urgencyLevel || 'normal',
    };

    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Booking created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }
}

/**
 * Get user's bookings
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('customerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    return bookings;
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw new Error('Failed to fetch bookings');
  }
}

/**
 * Get all bookings (Admin only)
 */
export async function getAllBookings(limitCount: number = 50): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    return bookings;
  } catch (error) {
    console.error('Error getting all bookings:', error);
    throw new Error('Failed to fetch all bookings');
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (bookingSnap.exists()) {
      return {
        id: bookingSnap.id,
        ...bookingSnap.data(),
      } as Booking;
    }

    return null;
  } catch (error) {
    console.error('Error getting booking:', error);
    throw new Error('Failed to fetch booking');
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(status === 'completed' && { completedAt: serverTimestamp() }),
    });

    console.log('✅ Booking status updated:', bookingId, '→', status);
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status');
  }
}

/**
 * Assign technician to booking
 */
export async function assignTechnician(
  bookingId: string,
  technicianId: string,
  technicianName: string
): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      technicianId,
      technicianName,
      assignedDate: serverTimestamp(),
      status: 'confirmed',
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Technician assigned to booking:', bookingId, '→', technicianName);
  } catch (error) {
    console.error('Error assigning technician:', error);
    throw new Error('Failed to assign technician');
  }
}

/**
 * Update booking with service completion details
 */
export async function completeBooking(
  bookingId: string,
  completionData: {
    finalCost: number;
    serviceNotes: string;
    afterPhotos?: string[];
  }
): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      ...completionData,
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Booking completed:', bookingId);
  } catch (error) {
    console.error('Error completing booking:', error);
    throw new Error('Failed to complete booking');
  }
}

/**
 * Add customer rating and review
 */
export async function addBookingReview(
  bookingId: string,
  rating: number,
  review: string
): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      customerRating: rating,
      customerReview: review,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Booking review added:', bookingId);
  } catch (error) {
    console.error('Error adding booking review:', error);
    throw new Error('Failed to add review');
  }
}

/**
 * Cancel booking
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Booking cancelled:', bookingId);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw new Error('Failed to cancel booking');
  }
}

/**
 * Get bookings by status
 */
export async function getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    return bookings;
  } catch (error) {
    console.error('Error getting bookings by status:', error);
    throw new Error('Failed to fetch bookings by status');
  }
}

/**
 * Get technician's assigned bookings
 */
export async function getTechnicianBookings(technicianId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('technicianId', '==', technicianId),
      orderBy('preferredDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    return bookings;
  } catch (error) {
    console.error('Error getting technician bookings:', error);
    throw new Error('Failed to fetch technician bookings');
  }
}
