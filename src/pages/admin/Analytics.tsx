/**
 * Analytics Dashboard - Redesigned
 * Comprehensive analytics and insights for platform performance
 * Google Stitch-inspired design - October 2025
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Package,
  Loader2,
  Download,
  BarChart3,
} from 'lucide-react';
import {
  getRevenueAnalytics,
  getUserGrowthAnalytics,
  getBookingTrends,
  getTopProducts,
  getServiceTypeAnalytics,
  getPlatformStats,
  getTopProductsTrend,
  type RevenueDataPoint,
  type UserGrowthDataPoint,
  type BookingTrendDataPoint,
  type TopProduct,
  type TopProductTrendPoint,
  type ServiceTypeAnalytics as ServiceAnalytics,
  type PlatformStats,
} from '@/services/analyticsService';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PRODUCT_TREND_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [loading, setLoading] = useState(true);

  // Analytics data state
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthDataPoint[]>([]);
  const [bookingTrendsData, setBookingTrendsData] = useState<BookingTrendDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics[]>([]);
  const [topProductsTrend, setTopProductsTrend] = useState<TopProductTrendPoint[]>([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);

      const [
        stats,
        revenue,
        userGrowth,
        bookings,
        products,
        services,
        productsTrend,
      ] = await Promise.all([
        getPlatformStats(),
        getRevenueAnalytics(days),
        getUserGrowthAnalytics(days),
        getBookingTrends(days),
        getTopProducts(10),
        getServiceTypeAnalytics(),
        getTopProductsTrend(days, 5),
      ]);

      setPlatformStats(stats);
      setRevenueData(revenue);
      setUserGrowthData(userGrowth);
      setBookingTrendsData(bookings);
      setTopProducts(products);
      setServiceAnalytics(services);
      setTopProductsTrend(productsTrend);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const calculateGrowth = <T extends Record<string, unknown>, K extends keyof T>(
    data: T[],
    key: K
  ) => {
    if (data.length < 2) return 0;
    const latest = Number(data[data.length - 1]?.[key] ?? 0);
    const previous = Number(data[data.length - 2]?.[key] ?? 0);
    if (previous === 0) return 0;
    return ((latest - previous) / previous) * 100;
  };

  const exportData = <T extends Record<string, unknown>>(data: T[], filename: string) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = <T extends Record<string, unknown>>(data: T[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  const productTrendSummary = useMemo(() => {
    if (topProductsTrend.length === 0) {
      return {
        data: [] as Array<Record<string, number | string>>,
        series: [] as Array<{ key: string; name: string; color: string }>,
      };
    }

    const totals = new Map<string, { name: string; units: number }>();

    topProductsTrend.forEach((point) => {
      point.products.forEach((product) => {
        if (!totals.has(product.productId)) {
          totals.set(product.productId, { name: product.productName, units: 0 });
        }
        const entry = totals.get(product.productId)!;
        entry.units += product.units;
        entry.name = product.productName || entry.name;
      });
    });

    const ranked = Array.from(totals.entries())
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 5);

    const topIds = ranked.map(([productId]) => productId);
    const idToName = new Map(ranked.map(([productId, value]) => [productId, value.name]));

    const chartData = topProductsTrend.map((point) => {
      const row: Record<string, number | string> = { date: point.date };
      topIds.forEach((productId) => {
        row[productId] = 0;
      });
      point.products.forEach((product) => {
        if (topIds.includes(product.productId)) {
          row[product.productId] = product.units;
          if (!idToName.has(product.productId)) {
            idToName.set(product.productId, product.productName);
          }
        }
      });
      return row;
    });

    const series = topIds.map((productId, index) => ({
      key: productId,
      name: idToName.get(productId) ?? productId,
      color: PRODUCT_TREND_COLORS[index % PRODUCT_TREND_COLORS.length],
    }));

    return { data: chartData, series };
  }, [topProductsTrend]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  };

  return (
    <AdminLayout
      title="Analytics Dashboard"
      subtitle="Platform performance and insights"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'Analytics' }
      ]}
      actions={
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as '7' | '30' | '90')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportData(revenueData, 'analytics')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Revenue
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">
                    {formatCurrency(platformStats?.totalRevenue || 0)}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm">
                    {calculateGrowth(revenueData, 'revenue') > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          +{calculateGrowth(revenueData, 'revenue').toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">
                          {calculateGrowth(revenueData, 'revenue').toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Total Orders
                  </CardDescription>
                  <CardTitle className="text-3xl">{platformStats?.totalOrders || 0}</CardTitle>
                  <p className="text-sm text-neutral-600">
                    Avg: {formatCurrency(platformStats?.averageOrderValue || 0)}
                  </p>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Total Bookings
                  </CardDescription>
                  <CardTitle className="text-3xl">{platformStats?.totalBookings || 0}</CardTitle>
                  <div className="flex items-center gap-1 text-sm">
                    {calculateGrowth(bookingTrendsData, 'bookings') > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          +{calculateGrowth(bookingTrendsData, 'bookings').toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">
                          {calculateGrowth(bookingTrendsData, 'bookings').toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardDescription>
                  <CardTitle className="text-3xl">{platformStats?.totalUsers || 0}</CardTitle>
                  <p className="text-sm text-neutral-600">
                    Conversion: {(platformStats?.conversionRate ?? 0).toFixed(1)}%
                  </p>
                </CardHeader>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="revenue" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="users">User Growth</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>Daily revenue and order volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number, name: string) =>
                            name === 'revenue' ? formatCurrency(value) : value
                          }
                          labelFormatter={(label) => formatDate(label)}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3B82F6"
                          fill="url(#colorRevenue)"
                          name="Revenue (GHS)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Total and new user registrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis />
                        <Tooltip labelFormatter={(label) => formatDate(label)} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="totalUsers"
                          stroke="#10B981"
                          strokeWidth={2}
                          name="Total Users"
                        />
                        <Line
                          type="monotone"
                          dataKey="newUsers"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          name="New Users"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Trends</CardTitle>
                    <CardDescription>Daily booking volume and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={bookingTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis />
                        <Tooltip labelFormatter={(label) => formatDate(label)} />
                        <Legend />
                        <Bar dataKey="bookings" fill="#3B82F6" name="Total Bookings" />
                        <Bar dataKey="completed" fill="#10B981" name="Completed" />
                        <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Top Products & Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Top Selling Products
                  </CardTitle>
                  <CardDescription>Best performing products by quantity sold</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.length === 0 ? (
                      <p className="text-center text-neutral-500 py-8">No product sales yet</p>
                    ) : (
                      topProducts.map((product, index) => (
                        <div key={product.productId} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-neutral-900 truncate">
                              {product.productName}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {product.totalSold} units sold
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-neutral-900">
                              {formatCurrency(product.revenue)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Service Types
                  </CardTitle>
                  <CardDescription>Popular service categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceAnalytics.length === 0 ? (
                      <p className="text-center text-neutral-500 py-8">No service bookings yet</p>
                    ) : (
                      serviceAnalytics.map((service) => (
                        <div key={service.serviceType}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-neutral-900">
                              {service.serviceType}
                            </span>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{service.count} bookings</p>
                              <p className="text-xs text-neutral-600">
                                {formatCurrency(service.revenue)}
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{
                                width: `${(service.count /
                                  Math.max(...serviceAnalytics.map((s) => s.count))) *
                                  100
                                  }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Products Trend
                </CardTitle>
                <CardDescription>Daily units sold for the leading products</CardDescription>
              </CardHeader>
              <CardContent>
                {productTrendSummary.data.length === 0 ? (
                  <p className="text-center text-neutral-500 py-8">
                    No sales data for the selected time range
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={productTrendSummary.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip labelFormatter={(label) => formatDate(String(label))} />
                      <Legend />
                      {productTrendSummary.series.map((series) => (
                        <Line
                          key={series.key}
                          type="monotone"
                          dataKey={series.key}
                          name={series.name}
                          stroke={series.color}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
