/**
 * Earnings Service
 * Calculate technician earnings from completed bookings
 */

import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Booking } from '@/types/booking';

export interface EarningsSummary {
  totalEarnings: number;
  jobsCompleted: number;
  averageJobValue: number;
  topServiceType: string;
}

export interface EarningsPeriod {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

/**
 * Commission rate for technicians
 * Can be configured per technician or globally
 */
const COMMISSION_RATE = 0.30; // 30% of final cost

/**
 * Calculate earnings for a specific date range
 */
export async function getTechnicianEarnings(
  technicianId: string,
  startDate: Date,
  endDate: Date
): Promise<EarningsSummary> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('technicianId', '==', technicianId),
      where('status', '==', 'completed'),
      where('completedAt', '>=', Timestamp.fromDate(startDate)),
      where('completedAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('completedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      } as Booking);
    });

    // Calculate totals
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.finalCost || 0), 0);
    const totalEarnings = totalRevenue * COMMISSION_RATE;
    const jobsCompleted = bookings.length;
    const averageJobValue = jobsCompleted > 0 ? totalEarnings / jobsCompleted : 0;

    // Find most common service type
    const serviceTypeCounts: Record<string, number> = {};
    bookings.forEach((booking) => {
      serviceTypeCounts[booking.serviceType] = (serviceTypeCounts[booking.serviceType] || 0) + 1;
    });

    const topServiceType = Object.keys(serviceTypeCounts).length > 0
      ? Object.keys(serviceTypeCounts).reduce((a, b) =>
          serviceTypeCounts[a] > serviceTypeCounts[b] ? a : b
        )
      : 'N/A';

    return {
      totalEarnings,
      jobsCompleted,
      averageJobValue,
      topServiceType,
    };
  } catch (error) {
    console.error('Error calculating earnings:', error);
    throw new Error('Failed to calculate earnings');
  }
}

/**
 * Get earnings for today, this week, and this month
 */
export async function getTechnicianEarningsPeriods(
  technicianId: string
): Promise<EarningsPeriod> {
  try {
    const now = new Date();

    // Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const todayEarnings = await getTechnicianEarnings(technicianId, todayStart, todayEnd);

    // This week (Monday to Sunday)
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekEarnings = await getTechnicianEarnings(technicianId, weekStart, weekEnd);

    // This month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const monthEarnings = await getTechnicianEarnings(technicianId, monthStart, monthEnd);

    return {
      today: todayEarnings.totalEarnings,
      thisWeek: weekEarnings.totalEarnings,
      thisMonth: monthEarnings.totalEarnings,
    };
  } catch (error) {
    console.error('Error fetching earnings periods:', error);
    throw new Error('Failed to fetch earnings');
  }
}

/**
 * Get daily earnings for a date range (for charting)
 */
export async function getDailyEarnings(
  technicianId: string,
  days: number = 7
): Promise<Array<{ date: string; earnings: number }>> {
  try {
    const result: Array<{ date: string; earnings: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      const dayEarnings = await getTechnicianEarnings(technicianId, dayStart, dayEnd);

      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        earnings: dayEarnings.totalEarnings,
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching daily earnings:', error);
    throw new Error('Failed to fetch daily earnings');
  }
}
