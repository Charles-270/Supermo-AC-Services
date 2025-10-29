/**
 * Revenue Service
 * Manages platform revenue calculations and analytics
 */

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Booking } from '@/types/booking';
import { BOOKING_PLATFORM_COMMISSION_RATE, TECHNICIAN_PAYOUT_RATE } from '@/types/booking';

/**
 * Platform Revenue Interface
 */
export interface PlatformRevenue {
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number; // Sum of all agreedPrice for completed bookings
  platformCommission: number; // 10% of totalRevenue
  technicianPayouts: number; // 90% of totalRevenue
  monthlyRevenue: number;
  dailyRevenue: number;
  averageBookingValue: number;
}

/**
 * Revenue Breakdown by Date Range
 */
export interface RevenueBreakdown {
  date: string;
  bookings: number;
  revenue: number;
  commission: number;
  technicianPayout: number;
}

/**
 * Commission Details for a specific booking
 */
export interface CommissionDetails {
  bookingId: string;
  customerId: string;
  technicianId?: string;
  serviceType: string;
  servicePackage: string;
  agreedPrice: number;
  finalCost: number;
  platformCommission: number;
  technicianPayout: number;
  completedAt: Timestamp;
}

/**
 * Get platform revenue overview
 */
export async function getPlatformRevenue(): Promise<PlatformRevenue> {
  try {
    // Get all completed bookings
    const bookingsRef = collection(db, 'bookings');
    const completedQuery = query(
      bookingsRef,
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc')
    );

    const querySnapshot = await getDocs(completedQuery);
    const completedBookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      completedBookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    // Calculate totals
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      return sum + (booking.finalCost || booking.agreedPrice || 0);
    }, 0);

    const platformCommission = totalRevenue * BOOKING_PLATFORM_COMMISSION_RATE;
    const technicianPayouts = totalRevenue * TECHNICIAN_PAYOUT_RATE;

    // Calculate monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyBookings = completedBookings.filter(booking => {
      const completedAt = booking.completedAt?.toDate() || new Date(0);
      return completedAt >= startOfMonth;
    });

    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => {
      return sum + (booking.finalCost || booking.agreedPrice || 0);
    }, 0);

    // Calculate daily revenue (today)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dailyBookings = completedBookings.filter(booking => {
      const completedAt = booking.completedAt?.toDate() || new Date(0);
      return completedAt >= startOfDay;
    });

    const dailyRevenue = dailyBookings.reduce((sum, booking) => {
      return sum + (booking.finalCost || booking.agreedPrice || 0);
    }, 0);

    // Get total bookings count (all statuses)
    const allBookingsQuery = query(bookingsRef, orderBy('createdAt', 'desc'));
    const allBookingsSnapshot = await getDocs(allBookingsQuery);

    return {
      totalBookings: allBookingsSnapshot.size,
      completedBookings: completedBookings.length,
      totalRevenue,
      platformCommission,
      technicianPayouts,
      monthlyRevenue,
      dailyRevenue,
      averageBookingValue: completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0,
    };
  } catch (error) {
    console.error('Error getting platform revenue:', error);
    throw new Error('Failed to fetch platform revenue');
  }
}

/**
 * Get revenue breakdown by date range
 */
export async function getRevenueByDateRange(
  startDate: Date,
  endDate: Date
): Promise<RevenueBreakdown[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('status', '==', 'completed'),
      where('completedAt', '>=', Timestamp.fromDate(startDate)),
      where('completedAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('completedAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    // Group bookings by date
    const revenueByDate = new Map<string, RevenueBreakdown>();

    bookings.forEach((booking) => {
      const completedAt = booking.completedAt?.toDate() || new Date();
      const dateKey = completedAt.toISOString().split('T')[0]; // YYYY-MM-DD format

      const revenue = booking.finalCost || booking.agreedPrice || 0;
      const commission = revenue * BOOKING_PLATFORM_COMMISSION_RATE;
      const technicianPayout = revenue * TECHNICIAN_PAYOUT_RATE;

      if (revenueByDate.has(dateKey)) {
        const existing = revenueByDate.get(dateKey)!;
        existing.bookings += 1;
        existing.revenue += revenue;
        existing.commission += commission;
        existing.technicianPayout += technicianPayout;
      } else {
        revenueByDate.set(dateKey, {
          date: dateKey,
          bookings: 1,
          revenue,
          commission,
          technicianPayout,
        });
      }
    });

    return Array.from(revenueByDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting revenue by date range:', error);
    throw new Error('Failed to fetch revenue by date range');
  }
}

/**
 * Calculate commission breakdown for completed bookings
 */
export async function calculateCommissionBreakdown(): Promise<CommissionDetails[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const commissionDetails: CommissionDetails[] = [];

    querySnapshot.forEach((doc) => {
      const booking = {
        id: doc.id,
        ...doc.data(),
      } as Booking;

      const finalCost = booking.finalCost || booking.agreedPrice || 0;
      const platformCommission = finalCost * BOOKING_PLATFORM_COMMISSION_RATE;
      const technicianPayout = finalCost * TECHNICIAN_PAYOUT_RATE;

      commissionDetails.push({
        bookingId: booking.id,
        customerId: booking.customerId,
        technicianId: booking.technicianId,
        serviceType: booking.serviceType,
        servicePackage: booking.servicePackage,
        agreedPrice: booking.agreedPrice || 0,
        finalCost,
        platformCommission,
        technicianPayout,
        completedAt: booking.completedAt || Timestamp.now(),
      });
    });

    return commissionDetails;
  } catch (error) {
    console.error('Error calculating commission breakdown:', error);
    throw new Error('Failed to calculate commission breakdown');
  }
}

/**
 * Get revenue statistics for a specific time period
 */
export async function getRevenueStats(period: 'today' | 'week' | 'month' | 'year'): Promise<{
  revenue: number;
  commission: number;
  bookings: number;
  growth: number; // Percentage growth compared to previous period
}> {
  try {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // Yesterday
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Previous week
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Previous month
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1); // Previous year
        break;
      default:
        throw new Error('Invalid period specified');
    }

    // Get current period data
    const currentData = await getRevenueByDateRange(startDate, now);
    const currentRevenue = currentData.reduce((sum, day) => sum + day.revenue, 0);
    const currentCommission = currentData.reduce((sum, day) => sum + day.commission, 0);
    const currentBookings = currentData.reduce((sum, day) => sum + day.bookings, 0);

    // Get previous period data for growth calculation
    const endOfPreviousPeriod = new Date(startDate.getTime() - 1);
    const previousData = await getRevenueByDateRange(previousStartDate, endOfPreviousPeriod);
    const previousRevenue = previousData.reduce((sum, day) => sum + day.revenue, 0);

    // Calculate growth percentage
    const growth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : currentRevenue > 0 ? 100 : 0;

    return {
      revenue: currentRevenue,
      commission: currentCommission,
      bookings: currentBookings,
      growth: Math.round(growth * 100) / 100, // Round to 2 decimal places
    };
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    throw new Error('Failed to fetch revenue statistics');
  }
}