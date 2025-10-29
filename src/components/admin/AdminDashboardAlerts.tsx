import { useEffect, useState, type ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, BellRing, ShoppingBag, Package, AlertTriangle, Clock, Store, CheckCircle, AlertCircle } from 'lucide-react';
import { getAllOrders } from '@/services/productService';
import { getAllBookings } from '@/services/bookingService';
import { getAllSuppliersWithStats } from '@/services/supplierService';
import type { Order } from '@/types/product';
import type { Booking } from '@/types/booking';

type EcommerceAlertSummary = {
  pending: number;
  processing: number;
  total: number;
};

type BookingAlertSummary = {
  unassigned: number;
  newlySubmitted: number;
};

type SupplierAlertSummary = {
  pending: number;
  total: number;
};

type DashboardAlerts = {
  ecommerce: EcommerceAlertSummary;
  bookings: BookingAlertSummary;
  suppliers: SupplierAlertSummary;
};

const initialAlerts: DashboardAlerts = {
  ecommerce: { pending: 0, processing: 0, total: 0 },
  bookings: { unassigned: 0, newlySubmitted: 0 },
  suppliers: { pending: 0, total: 0 },
};

export function AdminDashboardAlerts() {
  const [alerts, setAlerts] = useState<DashboardAlerts>(initialAlerts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAlerts = async () => {
      setLoading(true);
      setError(null);

      try {
        const [orders, bookings, suppliers] = await Promise.all([
          getAllOrders(100),
          getAllBookings(100),
          getAllSuppliersWithStats(),
        ]);

        if (!isMounted) {
          return;
        }

        const pendingOrders = orders.filter(
          (order: Order) =>
            order.orderStatus === 'pending-payment' || order.orderStatus === 'payment-confirmed'
        ).length;
        const processingOrders = orders.filter((order: Order) => order.orderStatus === 'processing').length;

        const unassignedBookings = bookings.filter(
          (booking: Booking) =>
            !booking.technicianId &&
            booking.status !== 'cancelled' &&
            booking.status !== 'completed'
        ).length;

        const newBookings = bookings.filter((booking: Booking) => booking.status === 'pending').length;

        const pendingSuppliers = suppliers.filter((supplier) => !supplier.isApproved).length;

        setAlerts({
          ecommerce: {
            pending: pendingOrders,
            processing: processingOrders,
            total: orders.length,
          },
          bookings: {
            unassigned: unassignedBookings,
            newlySubmitted: newBookings,
          },
          suppliers: {
            pending: pendingSuppliers,
            total: suppliers.length,
          },
        });
      } catch (err) {
        console.error('Failed to load dashboard alerts', err);
        if (isMounted) {
          setError('Failed to load alerts. Please try again shortly.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAlerts();

    return () => {
      isMounted = false;
    };
  }, []);

  const alertItems: ReactElement[] = [];

  if (alerts.ecommerce.pending > 0) {
    alertItems.push(
      <Alert key="orders-pending" className="border-amber-500 bg-amber-50">
        <ShoppingBag className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-900">
          {alerts.ecommerce.pending}{' '}
          {alerts.ecommerce.pending === 1 ? 'order needs payment confirmation' : 'orders need payment confirmation'}
        </AlertTitle>
        <AlertDescription className="text-amber-800">
          Review pending payments to keep fulfilment moving.
        </AlertDescription>
      </Alert>
    );
  } else if (alerts.ecommerce.processing > 0) {
    alertItems.push(
      <Alert key="orders-processing" className="border-primary-500 bg-primary-50">
        <Package className="h-5 w-5 text-primary-600" />
        <AlertTitle className="text-primary-900">
          {alerts.ecommerce.processing}{' '}
          {alerts.ecommerce.processing === 1 ? 'order is being processed' : 'orders are being processed'}
        </AlertTitle>
        <AlertDescription className="text-primary-800">
          Monitor supplier assignments and shipping updates.
        </AlertDescription>
      </Alert>
    );
  }

  if (alerts.bookings.unassigned > 0) {
    alertItems.push(
      <Alert key="bookings-unassigned" className="border-amber-500 bg-amber-50">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-900">
          {alerts.bookings.unassigned}{' '}
          {alerts.bookings.unassigned === 1 ? 'booking needs a technician' : 'bookings need technicians'}
        </AlertTitle>
        <AlertDescription className="text-amber-800">
          Assign technicians to ensure upcoming appointments stay on schedule.
        </AlertDescription>
      </Alert>
    );
  }

  if (alerts.bookings.newlySubmitted > 0) {
    alertItems.push(
      <Alert key="bookings-new" className="border-primary-500 bg-primary-50">
        <Clock className="h-5 w-5 text-primary-600" />
        <AlertTitle className="text-primary-900">
          {alerts.bookings.newlySubmitted}{' '}
          {alerts.bookings.newlySubmitted === 1 ? 'new booking awaits confirmation' : 'new bookings await confirmation'}
        </AlertTitle>
        <AlertDescription className="text-primary-800">
          Confirm and schedule these bookings to notify customers promptly.
        </AlertDescription>
      </Alert>
    );
  }

  if (alerts.suppliers.pending > 0) {
    alertItems.push(
      <Alert key="suppliers-pending" className="border-amber-500 bg-amber-50">
        <Store className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-900">
          {alerts.suppliers.pending}{' '}
          {alerts.suppliers.pending === 1 ? 'supplier pending approval' : 'suppliers pending approval'}
        </AlertTitle>
        <AlertDescription className="text-amber-800">
          Review supplier applications so catalog requests do not stall.
        </AlertDescription>
      </Alert>
    );
  }

  const showAllClear = alertItems.length === 0 && !loading && !error;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <BellRing className="h-5 w-5" />
          Priority Alerts
        </CardTitle>
        <CardDescription className="text-amber-700">
          Critical tasks pulled from orders, bookings, and supplier queues
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="border-destructive bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-destructive">Unable to load alerts</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : showAllClear ? (
          <Alert className="border-success-500 bg-green-50">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <AlertTitle className="text-success-900">All caught up</AlertTitle>
            <AlertDescription className="text-success-800">
              No outstanding actions detected across management areas.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {alertItems.map((item) => item)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
