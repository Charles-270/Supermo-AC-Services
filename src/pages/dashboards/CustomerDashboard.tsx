/**
 * Customer Dashboard
 * Book services, shop products, track orders
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserBookings } from '@/services/bookingService';
import { BookingForm } from '@/components/booking/BookingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Snowflake, ShoppingCart, Calendar, Package, Clock, MapPin } from 'lucide-react';
import type { Booking } from '@/types/booking';
import {
  SERVICE_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_VARIANTS,
  TIME_SLOT_LABELS
} from '@/types/booking';
import { formatCurrency } from '@/lib/utils';

export function CustomerDashboard() {
  const { user, profile, signOut } = useAuth();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userBookings = await getUserBookings(user.uid);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    loadBookings(); // Refresh bookings list
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
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setBookingDialogOpen(true)}>
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
              <Button className="w-full" onClick={() => setBookingDialogOpen(true)}>
                Book Now
              </Button>
            </CardContent>
          </Card>

          {/* Shop Products */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
              <Button variant="secondary" className="w-full">
                Browse Catalog
              </Button>
            </CardContent>
          </Card>

          {/* Track Orders */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-success" />
                Track Orders
              </CardTitle>
              <CardDescription>
                View service bookings and product orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Orders
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Bookings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>Your service appointments and booking history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-neutral-500 text-center py-8">Loading bookings...</p>
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
