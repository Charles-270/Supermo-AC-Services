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
import { BOOKING_PLATFORM_COMMISSION_RATE, TECHNICIAN_PAYOUT_RATE } from '@/types/booking';
import { getServicePrice } from '@/services/pricingService';
import {
  assignJobToTechnician,
  removeJobFromTechnician,
  getTechnicianById,
  incrementTechnicianJobsCompleted,
  updateTechnicianRating,
} from '@/services/technicianService';

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
      servicePackage: formData.servicePackage,
      agreedPrice: await getServicePrice(formData.serviceType),
      serviceDetails: formData.serviceDetails,

      preferredDate: formData.preferredDate as unknown as Timestamp,
      preferredTimeSlot: formData.preferredTimeSlot,

      address: formData.address,
      city: formData.city,
      locationNotes: formData.locationNotes,

      status: 'pending',
      priority: formData.serviceDetails.urgencyLevel || 'normal',
    };

    // Only add alternateDate if it exists (Firestore doesn't allow undefined)
    if (formData.alternateDate) {
      bookingData.alternateDate = formData.alternateDate as unknown as Timestamp;
    }

    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Booking created:', docRef.id);
    console.log('💰 Agreed price set to:', bookingData.agreedPrice);
    console.log('🔧 Service type:', formData.serviceType, 'Price:', bookingData.agreedPrice);
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
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const bookingData = {
      id: bookingSnap.id,
      ...bookingSnap.data(),
    } as Booking;

    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(status === 'completed' && { completedAt: serverTimestamp() }),
    });

    if (
      (status === 'completed' || status === 'cancelled') &&
      bookingData.technicianId
    ) {
      await removeJobFromTechnician(bookingData.technicianId, bookingId);
    }

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
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const bookingData = {
      id: bookingSnap.id,
      ...bookingSnap.data(),
    } as Booking;

    const previousTechnicianId = bookingData.technicianId;
    const technicianProfile = await getTechnicianById(technicianId);

    const bookingUpdates: Record<string, unknown> = {
      technicianId,
      technicianName,
      assignedDate: serverTimestamp(),
      status: 'confirmed',
      updatedAt: serverTimestamp(),
    };

    if (technicianProfile) {
      bookingUpdates.technicianEmail = technicianProfile.email;
      if (technicianProfile.phoneNumber) {
        bookingUpdates.technicianPhone = technicianProfile.phoneNumber;
      }
    }

    await Promise.all([
      updateDoc(bookingRef, bookingUpdates),
      assignJobToTechnician(technicianId, bookingId),
      ...(previousTechnicianId && previousTechnicianId !== technicianId
        ? [removeJobFromTechnician(previousTechnicianId, bookingId)]
        : []),
    ]);

    console.log('✅ Technician assigned to booking:', bookingId, '→', technicianName);
  } catch (error) {
    console.error('Error assigning technician:', error);
    throw new Error('Failed to assign technician');
  }
}

/**
 * Update booking with service completion details and track revenue
 */
export async function completeBooking(
  bookingId: string,
  completionData: {
    finalCost: number;
    serviceNotes: string;
    beforePhotos?: string[];
    afterPhotos?: string[];
    laborHours?: number;
  }
): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const bookingData = {
      id: bookingSnap.id,
      ...bookingSnap.data(),
    } as Booking;

    // Calculate revenue breakdown
    const finalCost = completionData.finalCost;
    const platformCommission = finalCost * BOOKING_PLATFORM_COMMISSION_RATE; // 10%
    const technicianPayout = finalCost * TECHNICIAN_PAYOUT_RATE; // 90%

    // Update booking with completion details - explicitly list fields to avoid serialization issues
    const updateData: Record<string, unknown> = {
      finalCost: completionData.finalCost,
      serviceNotes: completionData.serviceNotes,
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add optional fields only if they exist
    if (completionData.beforePhotos) {
      updateData.beforePhotos = completionData.beforePhotos;
    }
    if (completionData.afterPhotos) {
      updateData.afterPhotos = completionData.afterPhotos;
    }
    if (completionData.laborHours !== undefined) {
      updateData.laborHours = completionData.laborHours;
    }

    await updateDoc(bookingRef, updateData);

    // Create revenue record for admin tracking
    const revenueRef = collection(db, 'revenue');
    await addDoc(revenueRef, {
      bookingId: bookingId,
      customerId: bookingData.customerId,
      technicianId: bookingData.technicianId,
      serviceType: bookingData.serviceType,
      servicePackage: bookingData.servicePackage,
      agreedPrice: bookingData.agreedPrice || 0,
      finalCost: finalCost,
      platformCommission: platformCommission,
      technicianPayout: technicianPayout,
      completedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    if (bookingData.technicianId) {
      await removeJobFromTechnician(bookingData.technicianId, bookingId);
      // Sync: Update technician's total jobs completed count
      await incrementTechnicianJobsCompleted(bookingData.technicianId);
    }

    console.log('✅ Booking completed:', bookingId);
    console.log('💰 Revenue tracked - Commission:', platformCommission, 'Technician Payout:', technicianPayout);
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
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const bookingData = {
      id: bookingSnap.id,
      ...bookingSnap.data(),
    } as Booking;

    await updateDoc(bookingRef, {
      customerRating: rating,
      customerReview: review,
      updatedAt: serverTimestamp(),
    });

    // Sync: Update technician's average rating based on all ratings
    if (bookingData.technicianId) {
      await updateTechnicianRating(bookingData.technicianId);
    }

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
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const bookingData = {
      id: bookingSnap.id,
      ...bookingSnap.data(),
    } as Booking;

    await updateDoc(bookingRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });

    if (bookingData.technicianId) {
      await removeJobFromTechnician(bookingData.technicianId, bookingId);
    }

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
