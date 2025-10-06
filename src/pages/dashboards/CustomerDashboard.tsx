/**
 * Customer Dashboard
 * Book services, shop products, track orders
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeBookings, useRealtimeBookingCounts } from '@/hooks/useRealtimeBookings';
import { BookingForm } from '@/components/booking/BookingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Snowflake, ShoppingCart, Calendar, Package, Clock, MapPin, Loader2, FileText, TrendingUp } from 'lucide-react';
import type { Booking } from '@/types/booking';
import {
  SERVICE_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_VARIANTS,
  TIME_SLOT_LABELS
} from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { getCustomerOrders } from '@/services/productService';
import type { Order, OrderStatus } from '@/types/product';

// Status badge configurations
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  'pending-payment': { label: 'Pending Payment', variant: 'outline' },
  'payment-confirmed': { label: 'Payment Confirmed', variant: 'secondary' },
  'processing': { label: 'Processing', variant: 'default' },
  'shipped': { label: 'Shipped', variant: 'default' },
  'delivered': { label: 'Delivered', variant: 'secondary' },
  'cancelled': { label: 'Cancelled', variant: 'destructive' },
  'refunded': { label: 'Refunded', variant: 'destructive' },
  'failed': { label: 'Failed', variant: 'destructive' },
};

export function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Real-time booking updates
  const { bookings, loading, error } = useRealtimeBookings({
    customerId: user?.uid,
  });

  // Real-time booking counts
  const { counts } = useRealtimeBookingCounts(user?.uid, 'customer');

  // Fetch customer orders
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const fetchedOrders = await getCustomerOrders(user.uid);
      setOrders(fetchedOrders);
      setOrdersError(null);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setOrdersError(error.message || 'Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Calculate order stats
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => ['pending-payment', 'payment-confirmed', 'processing'].includes(o.orderStatus)).length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
  };

  const handleBookingSuccess = () => {
    setBookingDialogOpen(false);
    // No need to manually refresh - real-time listener will auto-update
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Snowflake className="h-8 w-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Customer Portal</h1>
                <p className="text-sm text-neutral-600">Welcome back, {profile?.displayName}!</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Book Service */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-500" />
                Book Service
              </CardTitle>
              <CardDescription>
                Schedule AC maintenance, repair, or installation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setBookingDialogOpen(true);
                }}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>

          {/* Shop Products */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-accent-500" />
                Shop Products
              </CardTitle>
              <CardDescription>
                Browse AC units, spare parts, and accessories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/products');
                }}
              >
                Browse Catalog
              </Button>
            </CardContent>
          </Card>

          {/* Track Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-success" />
                My Orders
              </CardTitle>
              <CardDescription>
                Track your product orders and deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                </div>
              ) : ordersError ? (
                <div className="text-center py-2">
                  <p className="text-sm text-error mb-2">{ordersError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchOrders();
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-neutral-600">Total Orders</span>
                    <span className="font-semibold">{orderStats.total}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/orders');
                    }}
                  >
                    View All Orders
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Bookings */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  My Bookings
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" title="Live updates enabled"></span>
                  </span>
                </CardTitle>
                <CardDescription>Your service appointments update in real-time</CardDescription>
              </div>
              {!loading && (
                <div className="flex gap-2 text-sm">
                  {counts.pending > 0 && (
                    <Badge variant="outline" className="border-amber-500 text-amber-700">
                      {counts.pending} Pending
                    </Badge>
                  )}
                  {counts.confirmed > 0 && (
                    <Badge variant="outline" className="border-blue-500 text-blue-700">
                      {counts.confirmed} Confirmed
                    </Badge>
                  )}
                  {counts['in-progress'] > 0 && (
                    <Badge variant="outline" className="border-primary-500 text-primary-700">
                      {counts['in-progress']} In Progress
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-neutral-500">Loading bookings...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-error mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">
                  No bookings yet. Book your first service!
                </p>
                <Button onClick={() => setBookingDialogOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{SERVICE_TYPE_LABELS[booking.serviceType]}</h3>
                        <Badge variant={BOOKING_STATUS_VARIANTS[booking.status]}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {booking.preferredDate?.toDate?.()?.toLocaleDateString() || 'Date not set'} - {TIME_SLOT_LABELS[booking.preferredTimeSlot]}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.address}, {booking.city}
                        </span>
                        {booking.technicianName && (
                          <span className="text-primary-600">
                            Assigned to: {booking.technicianName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end gap-2">
                      {booking.estimatedCost && (
                        <p className="text-lg font-semibold text-primary-600">
                          {formatCurrency(booking.estimatedCost)}
                        </p>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary-500" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Your latest product purchases</CardDescription>
              </div>
              {!ordersLoading && orders.length > 0 && (
                <div className="flex gap-2 text-sm">
                  {orderStats.pending > 0 && (
                    <Badge variant="outline" className="border-amber-500 text-amber-700">
                      {orderStats.pending} Active
                    </Badge>
                  )}
                  {orderStats.delivered > 0 && (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      {orderStats.delivered} Delivered
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-neutral-500">Loading orders...</p>
              </div>
            ) : ordersError ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-error-300 mx-auto mb-3" />
                <p className="text-error mb-2">{ordersError}</p>
                <p className="text-sm text-neutral-500 mb-4">
                  Unable to load your orders. This may be due to a connection issue.
                </p>
                <Button variant="outline" onClick={() => fetchOrders()}>
                  <Loader2 className="h-4 w-4 mr-2" />
                  Retry Loading Orders
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 mb-4">
                  No orders yet. Start shopping for AC units and parts!
                </p>
                <Button onClick={() => navigate('/products')}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => {
                    const config = STATUS_CONFIG[order.orderStatus];
                    return (
                      <div
                        key={order.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{order.orderNumber}</h3>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>
                          <div className="flex flex-col gap-1 text-sm text-neutral-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end gap-2">
                          <p className="text-lg font-semibold text-primary-600">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/orders/${order.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {orders.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/orders');
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View All {orders.length} Orders
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Booking Form Dialog */}
      <BookingForm
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
