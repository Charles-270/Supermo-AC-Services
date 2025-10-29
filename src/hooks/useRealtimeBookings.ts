/**
 * Real-time Bookings Hook
 * Provides live updates for bookings using Firestore onSnapshot
 */

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import type { Booking, BookingStatus } from '@/types/booking';

interface UseRealtimeBookingsOptions {
  customerId?: string;
  technicianId?: string;
  status?: BookingStatus;
  limit?: number;
}

interface UseRealtimeBookingsResult {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  unsubscribe: () => void;
}

/**
 * Hook to get real-time booking updates
 * Automatically subscribes to Firestore changes and updates state
 */
export function useRealtimeBookings(
  options: UseRealtimeBookingsOptions = {}
): UseRealtimeBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Build query constraints
    const constraints: QueryConstraint[] = [];

    if (options.customerId) {
      constraints.push(where('customerId', '==', options.customerId));
    }

    if (options.technicianId) {
      constraints.push(where('technicianId', '==', options.technicianId));
    }

    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    // Always order by creation date (newest first)
    constraints.push(orderBy('createdAt', 'desc'));

    // Create query
    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(bookingsCollection, ...constraints);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const updatedBookings: Booking[] = [];

        snapshot.forEach((doc) => {
          updatedBookings.push({
            id: doc.id,
            ...doc.data(),
          } as Booking);
        });

        setBookings(updatedBookings);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error in real-time booking listener:', err);
        setError(err.message || 'Failed to load bookings');
        setLoading(false);
      }
    );

    // Store unsubscribe function
    setUnsubscribeFn(() => unsubscribe);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [options.customerId, options.technicianId, options.status]);

  return {
    bookings,
    loading,
    error,
    unsubscribe: unsubscribeFn || (() => {}),
  };
}

/**
 * Hook to listen to a single booking in real-time
 */
export function useRealtimeBooking(bookingId: string | null) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setBooking(null);
      setLoading(false);
      return;
    }

    const bookingRef = collection(db, 'bookings');
    const bookingQuery = query(bookingRef, where('__name__', '==', bookingId));

    const unsubscribe = onSnapshot(
      bookingQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setBooking({
            id: doc.id,
            ...doc.data(),
          } as Booking);
        } else {
          setBooking(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error in real-time booking listener:', err);
        setError(err.message || 'Failed to load booking');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [bookingId]);

  return { booking, loading, error };
}

/**
 * Hook to get real-time count of bookings by status
 */
export function useRealtimeBookingCounts(userId?: string, userRole?: string) {
  const [counts, setCounts] = useState({
    pending: 0,
    confirmed: 0,
    'in-progress': 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userRole) {
      setLoading(false);
      return;
    }

    const bookingsCollection = collection(db, 'bookings');

    // Build query based on user role
    const constraints: QueryConstraint[] = [];

    if (userRole === 'customer') {
      constraints.push(where('customerId', '==', userId));
    } else if (userRole === 'technician') {
      constraints.push(where('technicianId', '==', userId));
    }
    // Admin sees all bookings, no filter needed

    const bookingsQuery =
      constraints.length > 0 ? query(bookingsCollection, ...constraints) : bookingsCollection;

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const newCounts = {
        pending: 0,
        confirmed: 0,
        'in-progress': 0,
        completed: 0,
        cancelled: 0,
      };

      snapshot.forEach((doc) => {
        const booking = doc.data() as Booking;
        if (booking.status in newCounts) {
          newCounts[booking.status as keyof typeof newCounts]++;
        }
      });

      setCounts(newCounts);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [userId, userRole]);

  return { counts, loading };
}
