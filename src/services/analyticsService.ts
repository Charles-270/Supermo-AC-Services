/**
 * Analytics Service
 * Aggregates data from Firestore collections for admin analytics dashboard
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Revenue data point for charts
 */
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

/**
 * User growth data point
 */
export interface UserGrowthDataPoint {
  date: string;
  totalUsers: number;
  newUsers: number;
}

/**
 * Booking trend data point
 */
export interface BookingTrendDataPoint {
  date: string;
  bookings: number;
  completed: number;
  pending: number;
}

/**
 * Top product data
 */
export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

/**
 * Service type analytics
 */
export interface ServiceTypeAnalytics {
  serviceType: string;
  count: number;
  revenue: number;
}

/**
 * Get revenue analytics for the last N days
 */
export async function getRevenueAnalytics(days: number = 30): Promise<RevenueDataPoint[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('paymentStatus', '==', 'paid')
    );

    const querySnapshot = await getDocs(q);

    // Group by date
    const revenueByDate: Map<string, { revenue: number; count: number }> = new Map();

    querySnapshot.forEach((doc) => {
      const order = doc.data();
      const date = order.createdAt?.toDate?.();
      if (date) {
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const current = revenueByDate.get(dateKey) || { revenue: 0, count: 0 };
        revenueByDate.set(dateKey, {
          revenue: current.revenue + (order.totalAmount || 0),
          count: current.count + 1,
        });
      }
    });

    // Convert to array and sort by date
    const dataPoints: RevenueDataPoint[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateKey = date.toISOString().split('T')[0];
      const data = revenueByDate.get(dateKey) || { revenue: 0, count: 0 };
      dataPoints.push({
        date: dateKey,
        revenue: data.revenue,
        orders: data.count,
      });
    }

    return dataPoints;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw new Error('Failed to fetch revenue analytics');
  }
}

/**
 * Get user growth analytics
 */
export async function getUserGrowthAnalytics(days: number = 30): Promise<UserGrowthDataPoint[]> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    const usersByDate: Map<string, number> = new Map();

    querySnapshot.forEach((doc) => {
      const user = doc.data();
      const date = user.createdAt?.toDate?.();
      if (date) {
        const dateKey = date.toISOString().split('T')[0];
        usersByDate.set(dateKey, (usersByDate.get(dateKey) || 0) + 1);
      }
    });

    // Calculate cumulative and new users per day
    const dataPoints: UserGrowthDataPoint[] = [];
    let cumulativeUsers = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateKey = date.toISOString().split('T')[0];
      const newUsers = usersByDate.get(dateKey) || 0;
      cumulativeUsers += newUsers;

      dataPoints.push({
        date: dateKey,
        totalUsers: cumulativeUsers,
        newUsers,
      });
    }

    return dataPoints;
  } catch (error) {
    console.error('Error fetching user growth analytics:', error);
    throw new Error('Failed to fetch user growth analytics');
  }
}

/**
 * Get booking trends
 */
export async function getBookingTrends(days: number = 30): Promise<BookingTrendDataPoint[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('createdAt', '>=', Timestamp.fromDate(startDate))
    );

    const querySnapshot = await getDocs(q);

    const bookingsByDate: Map<string, { total: number; completed: number; pending: number }> = new Map();

    querySnapshot.forEach((doc) => {
      const booking = doc.data();
      const date = booking.createdAt?.toDate?.();
      if (date) {
        const dateKey = date.toISOString().split('T')[0];
        const current = bookingsByDate.get(dateKey) || { total: 0, completed: 0, pending: 0 };
        current.total += 1;
        if (booking.status === 'completed') current.completed += 1;
        else if (booking.status === 'pending' || booking.status === 'confirmed') current.pending += 1;
        bookingsByDate.set(dateKey, current);
      }
    });

    const dataPoints: BookingTrendDataPoint[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateKey = date.toISOString().split('T')[0];
      const data = bookingsByDate.get(dateKey) || { total: 0, completed: 0, pending: 0 };
      dataPoints.push({
        date: dateKey,
        bookings: data.total,
        completed: data.completed,
        pending: data.pending,
      });
    }

    return dataPoints;
  } catch (error) {
    console.error('Error fetching booking trends:', error);
    throw new Error('Failed to fetch booking trends');
  }
}

/**
 * Get top selling products
 */
export async function getTopProducts(limit: number = 10): Promise<TopProduct[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('paymentStatus', '==', 'paid')
    );

    const querySnapshot = await getDocs(q);

    const productSales: Map<string, { name: string; quantity: number; revenue: number }> = new Map();

    querySnapshot.forEach((doc) => {
      const order = doc.data();
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const current = productSales.get(item.productId) || {
            name: item.productName || 'Unknown Product',
            quantity: 0,
            revenue: 0,
          };
          productSales.set(item.productId, {
            name: item.productName || current.name,
            quantity: current.quantity + (item.quantity || 0),
            revenue: current.revenue + (item.subtotal || 0),
          });
        });
      }
    });

    // Convert to array and sort by quantity
    const topProducts: TopProduct[] = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        totalSold: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    return topProducts;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw new Error('Failed to fetch top products');
  }
}

/**
 * Get service type analytics
 */
export async function getServiceTypeAnalytics(): Promise<ServiceTypeAnalytics[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const querySnapshot = await getDocs(bookingsRef);

    const serviceStats: Map<string, { count: number; revenue: number }> = new Map();

    querySnapshot.forEach((doc) => {
      const booking = doc.data();
      const serviceType = booking.serviceType || 'Other';
      const current = serviceStats.get(serviceType) || { count: 0, revenue: 0 };
      serviceStats.set(serviceType, {
        count: current.count + 1,
        revenue: current.revenue + (booking.totalCost || 0),
      });
    });

    const analytics: ServiceTypeAnalytics[] = Array.from(serviceStats.entries())
      .map(([serviceType, data]) => ({
        serviceType,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.count - a.count);

    return analytics;
  } catch (error) {
    console.error('Error fetching service type analytics:', error);
    throw new Error('Failed to fetch service type analytics');
  }
}

/**
 * Get overall platform statistics
 */
export interface PlatformStats {
  totalRevenue: number;
  totalOrders: number;
  totalBookings: number;
  totalUsers: number;
  averageOrderValue: number;
  conversionRate: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    // Get all collections in parallel
    const [ordersSnapshot, bookingsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'bookings')),
      getDocs(collection(db, 'users')),
    ]);

    let totalRevenue = 0;
    let paidOrders = 0;

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      if (order.paymentStatus === 'paid') {
        totalRevenue += order.totalAmount || 0;
        paidOrders += 1;
      }
    });

    const totalOrders = ordersSnapshot.size;
    const totalBookings = bookingsSnapshot.size;
    const totalUsers = usersSnapshot.size;
    const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0;
    const conversionRate = totalUsers > 0 ? (paidOrders / totalUsers) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalBookings,
      totalUsers,
      averageOrderValue,
      conversionRate,
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    throw new Error('Failed to fetch platform stats');
  }
}
