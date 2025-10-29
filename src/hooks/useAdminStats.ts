/**
 * Admin Statistics Hook
 * Fetches real-time platform statistics from Firestore
 */

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminStats {
  totalUsers: number;
  activeBookings: number;
  totalRevenue: number;
  averageResponseTime: string;
  loading: boolean;
}

export function useAdminStats(): AdminStats {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeBookings: 0,
    totalRevenue: 0,
    averageResponseTime: '0h',
    loading: true,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Get active bookings (pending, confirmed, in_progress)
      const bookingsRef = collection(db, 'bookings');
      const activeBookingsQuery = query(
        bookingsRef,
        where('status', 'in', ['pending', 'confirmed', 'in_progress'])
      );
      const activeBookingsSnapshot = await getDocs(activeBookingsQuery);
      const activeBookings = activeBookingsSnapshot.size;

      // Calculate total revenue from BOTH bookings AND e-commerce orders
      
      // 1. Revenue from completed bookings (technician services)
      const completedBookingsQuery = query(
        bookingsRef,
        where('status', '==', 'completed')
      );
      const completedBookingsSnapshot = await getDocs(completedBookingsQuery);

      let bookingRevenue = 0;
      completedBookingsSnapshot.forEach((doc) => {
        const booking = doc.data();
        // Use finalCost if available, otherwise agreedPrice or estimatedCost
        const revenue = booking.finalCost || booking.agreedPrice || booking.estimatedCost || 0;
        bookingRevenue += revenue;
      });

      // 2. Revenue from paid e-commerce orders
      const ordersRef = collection(db, 'orders');
      const paidOrdersQuery = query(
        ordersRef,
        where('paymentStatus', '==', 'paid')
      );
      const paidOrdersSnapshot = await getDocs(paidOrdersQuery);

      let ecommerceRevenue = 0;
      paidOrdersSnapshot.forEach((doc) => {
        const order = doc.data();
        ecommerceRevenue += order.totalAmount || 0;
      });

      // Combine both revenue sources
      const totalRevenue = bookingRevenue + ecommerceRevenue;

      // Calculate average response time (time from booking creation to assignment)
      let totalResponseTime = 0;
      let assignedBookingsCount = 0;

      const allBookingsSnapshot = await getDocs(bookingsRef);
      allBookingsSnapshot.forEach((doc) => {
        const booking = doc.data();
        if (booking.assignedDate && booking.createdAt) {
          const createdTime = (booking.createdAt as Timestamp).toMillis();
          const assignedTime = (booking.assignedDate as Timestamp).toMillis();
          const responseTime = assignedTime - createdTime;
          totalResponseTime += responseTime;
          assignedBookingsCount++;
        }
      });

      const averageResponseTimeMs = assignedBookingsCount > 0
        ? totalResponseTime / assignedBookingsCount
        : 0;

      // Convert to hours
      const averageResponseTimeHours = averageResponseTimeMs / (1000 * 60 * 60);
      const averageResponseTime = averageResponseTimeHours > 0
        ? `${averageResponseTimeHours.toFixed(1)}h`
        : '0h';

      setStats({
        totalUsers,
        activeBookings,
        totalRevenue,
        averageResponseTime,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  return stats;
}
