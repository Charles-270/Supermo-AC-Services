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
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  aggregateDailyOrders,
  finalizeDailyAggregates,
  computeTopProductsAllTime,
  isPaidStatus,
  toDateKey,
  type DailyProductAggregate,
} from '@/utils/analyticsRollup';

/**
 * Revenue data point for charts
 */
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  [key: string]: string | number;
}

/**
 * User growth data point
 */
export interface UserGrowthDataPoint {
  date: string;
  totalUsers: number;
  newUsers: number;
  [key: string]: string | number;
}

/**
 * Booking trend data point
 */
export interface BookingTrendDataPoint {
  date: string;
  bookings: number;
  completed: number;
  pending: number;
  [key: string]: string | number;
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

export interface TopProductTrendPoint {
  date: string;
  products: DailyProductAggregate[];
}

/**
 * Service type analytics
 */
export interface ServiceTypeAnalytics {
  serviceType: string;
  count: number;
  revenue: number;
}

const ANALYTICS_DAILY_COLLECTION = 'analytics_daily';
const ANALYTICS_TOP_PRODUCTS_COLLECTION = 'analytics_top_products';
const ANALYTICS_TOP_PRODUCTS_DOC_ID = 'all-time';

type DailyAnalyticsMap = Map<
  string,
  {
    revenue: number;
    orders: number;
    topProducts: DailyProductAggregate[];
  }
>;

const getStartOfDayUtc = (date: Date): Date => {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
};

const loadDailyAnalytics = async (startTimestamp: Timestamp): Promise<DailyAnalyticsMap> => {
  const analyticsRef = collection(db, ANALYTICS_DAILY_COLLECTION);
  const analyticsQuery = query(
    analyticsRef,
    where('date', '>=', startTimestamp),
    orderBy('date', 'asc')
  );

  const analyticsSnapshot = await getDocs(analyticsQuery);
  if (!analyticsSnapshot.empty) {
    const aggregated: DailyAnalyticsMap = new Map();
    analyticsSnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;

      let dateValue: Date;
      if (data.date instanceof Timestamp) {
        dateValue = data.date.toDate();
      } else {
        dateValue = new Date(`${docSnap.id}T00:00:00Z`);
      }

      const dateKey = typeof data.dateKey === 'string' ? data.dateKey : toDateKey(dateValue);

      aggregated.set(dateKey, {
        revenue: Number(data.revenue ?? 0),
        orders: Number(data.orders ?? 0),
        topProducts: Array.isArray(data.topProducts)
          ? (data.topProducts as DailyProductAggregate[])
          : [],
      });
    });

    return aggregated;
  }

  // Fallback: compute on the fly from orders
  const ordersRef = collection(db, 'orders');
  const ordersQuery = query(ordersRef, where('createdAt', '>=', startTimestamp));
  const ordersSnapshot = await getDocs(ordersQuery);
  const orders = ordersSnapshot.docs.map((docSnap) => docSnap.data());

  const aggregated = finalizeDailyAggregates(aggregateDailyOrders(orders), 10);
  const fallbackMap: DailyAnalyticsMap = new Map();

  aggregated.forEach((entry) => {
    fallbackMap.set(entry.dateKey, {
      revenue: entry.revenue,
      orders: entry.orders,
      topProducts: entry.topProducts,
    });
  });

  return fallbackMap;
};

/**
 * Get revenue analytics for the last N days
 */
export async function getRevenueAnalytics(days: number = 30): Promise<RevenueDataPoint[]> {
  try {
    const today = getStartOfDayUtc(new Date());
    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    const startTimestamp = Timestamp.fromDate(startDate);

    const analyticsMap = await loadDailyAnalytics(startTimestamp);
    const dataPoints: RevenueDataPoint[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const entry = analyticsMap.get(dateKey);

      dataPoints.push({
        date: dateKey,
        revenue: entry?.revenue ?? 0,
        orders: entry?.orders ?? 0,
      });
    }

    return dataPoints;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return [];
  }
}

/**
 * Get user growth analytics
 * Fetches all users and calculates growth over time
 */
export async function getUserGrowthAnalytics(days: number = 30): Promise<UserGrowthDataPoint[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startTimestamp = Timestamp.fromDate(startDate);

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('createdAt', '>=', startTimestamp));
    const usersSnapshot = await getDocs(q);

    const growthByDate: Map<string, { total: number; newUsers: number }> = new Map();

    usersSnapshot.forEach((docSnap) => {
      const user = docSnap.data();
      const date = user.createdAt?.toDate?.();
      if (!date) return;

      const dateKey = date.toISOString().split('T')[0];
      const current = growthByDate.get(dateKey) || { total: 0, newUsers: 0 };
      growthByDate.set(dateKey, {
        total: current.total + 1,
        newUsers: current.newUsers + 1,
      });
    });

    const dataPoints: UserGrowthDataPoint[] = [];
    let runningTotal = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateKey = date.toISOString().split('T')[0];
      const data = growthByDate.get(dateKey) || { total: 0, newUsers: 0 };
      runningTotal += data.newUsers;

      dataPoints.push({
        date: dateKey,
        totalUsers: runningTotal,
        newUsers: data.newUsers,
      });
    }

    return dataPoints;
  } catch (error) {
    console.error('Error fetching user growth analytics:', error);
    return [];
  }
}

/**
 * Get booking trends
 * Aggregates bookings by day and status
 */
export async function getBookingTrends(days: number = 30): Promise<BookingTrendDataPoint[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startTimestamp = Timestamp.fromDate(startDate);

    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('createdAt', '>=', startTimestamp));
    const bookingsSnapshot = await getDocs(q);

    const bookingsByDate: Map<
      string,
      { total: number; completed: number; pending: number }
    > = new Map();

    bookingsSnapshot.forEach((docSnap) => {
      const booking = docSnap.data();
      const date = booking.createdAt?.toDate?.();
      if (!date) return;

      const dateKey = date.toISOString().split('T')[0];
      const current =
        bookingsByDate.get(dateKey) || { total: 0, completed: 0, pending: 0 };

      bookingsByDate.set(dateKey, {
        total: current.total + 1,
        completed: current.completed + (booking.status === 'completed' ? 1 : 0),
        pending: current.pending + (booking.status === 'pending' ? 1 : 0),
      });
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
    return [];
  }
}

/**
 * Get top selling products (all-time)
 */
export async function getTopProducts(limit: number = 10): Promise<TopProduct[]> {
  try {
    const aggregatedDocRef = doc(
      db,
      ANALYTICS_TOP_PRODUCTS_COLLECTION,
      ANALYTICS_TOP_PRODUCTS_DOC_ID
    );
    const aggregatedSnapshot = await getDoc(aggregatedDocRef);

    if (aggregatedSnapshot.exists()) {
      const data = aggregatedSnapshot.data() as { products?: DailyProductAggregate[] };
      const aggregatedProducts = Array.isArray(data.products) ? data.products : [];
      const ranked = aggregatedProducts
        .slice(0, limit)
        .map((product) => ({
          productId: product.productId,
          productName: product.productName,
          totalSold: product.units,
          revenue: product.revenue,
        }))
        .filter((item) => item.totalSold > 0);

      if (ranked.length > 0) {
        return ranked;
      }
    }

    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const orders = ordersSnapshot.docs.map((docSnap) => docSnap.data());
    const computed = computeTopProductsAllTime(orders, limit);

    return computed.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      totalSold: product.units,
      revenue: product.revenue,
    }));
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
}

/**
 * Get top product trends across the selected window
 */
export async function getTopProductsTrend(
  days: number = 30,
  limit: number = 5
): Promise<TopProductTrendPoint[]> {
  try {
    const today = getStartOfDayUtc(new Date());
    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    const startTimestamp = Timestamp.fromDate(startDate);

    const analyticsMap = await loadDailyAnalytics(startTimestamp);
    const trend: TopProductTrendPoint[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const entry = analyticsMap.get(dateKey);

      trend.push({
        date: dateKey,
        products: entry ? entry.topProducts.slice(0, limit) : [],
      });
    }

    return trend;
  } catch (error) {
    console.error('Error fetching top product trend analytics:', error);
    return [];
  }
}

/**
 * Get service type analytics
 * Aggregates bookings by service type
 */
export async function getServiceTypeAnalytics(): Promise<ServiceTypeAnalytics[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const querySnapshot = await getDocs(bookingsRef);

    const serviceStats: Map<string, { count: number; revenue: number }> = new Map();

    querySnapshot.forEach((docSnap) => {
      const booking = docSnap.data();
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
    return [];
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
    const [ordersSnapshot, bookingsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'bookings')),
      getDocs(collection(db, 'users')),
    ]);

    let ecommerceRevenue = 0;
    let paidOrders = 0;

    ordersSnapshot.forEach((docSnap) => {
      const order = docSnap.data();
      if (isPaidStatus(order.paymentStatus)) {
        ecommerceRevenue += order.totalAmount || 0;
        paidOrders += 1;
      }
    });

    let bookingRevenue = 0;
    let completedBookings = 0;

    bookingsSnapshot.forEach((docSnap) => {
      const booking = docSnap.data();
      if (booking.status === 'completed') {
        const revenue = booking.finalCost || booking.agreedPrice || booking.estimatedCost || 0;
        bookingRevenue += revenue;
        completedBookings += 1;
      }
    });

    const totalRevenue = ecommerceRevenue + bookingRevenue;
    const totalOrders = ordersSnapshot.size;
    const totalBookings = bookingsSnapshot.size;
    const totalUsers = usersSnapshot.size;
    const averageOrderValue = paidOrders > 0 ? ecommerceRevenue / paidOrders : 0;
    const totalTransactions = paidOrders + completedBookings;
    const conversionRate = totalUsers > 0 ? (totalTransactions / totalUsers) * 100 : 0;

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
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalBookings: 0,
      totalUsers: 0,
      averageOrderValue: 0,
      conversionRate: 0,
    };
  }
}
