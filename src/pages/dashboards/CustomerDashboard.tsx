/**
 * Customer Dashboard - Redesigned
 * Book services, shop products, track orders
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeBookings, useRealtimeBookingCounts } from '@/hooks/useRealtimeBookings';
import { RatingDialog } from '@/components/booking/RatingDialog';
import { BookingDetailsDialog } from '@/components/booking/BookingDetailsDialog';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Loader2, Menu, Star, User } from 'lucide-react';
import {
  SERVICE_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
  TIME_SLOT_LABELS
} from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import type { Booking } from '@/types/booking';

// Status badge color mapping
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'in-progress':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
};

export function CustomerDashboard() {
  const { user, profile } = useAuth();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState<Booking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Real-time booking updates
  const { bookings, loading, error } = useRealtimeBookings({
    customerId: user?.uid,
  });

  // Real-time booking counts (unused but kept for future use)
  useRealtimeBookingCounts(user?.uid, 'customer');

  const handleOpenRatingDialog = (booking: Booking) => {
    setSelectedBookingForRating(booking);
    setRatingDialogOpen(true);
  };

  const handleRatingSuccess = () => {
    // No need to manually refresh - real-time listener will auto-update
    setRatingDialogOpen(false);
    setSelectedBookingForRating(null);
  };

  const handleOpenDetailsDialog = (booking: Booking) => {
    setSelectedBookingForDetails(booking);
    setDetailsDialogOpen(true);
  };

  const formatDate = (timestamp: { toDate: () => Date } | Date | string | undefined) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'object' && 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTimeSlot = (timeSlot: string) => {
    return TIME_SLOT_LABELS[timeSlot as keyof typeof TIME_SLOT_LABELS] || timeSlot;
  };

  return (
    <div className="relative min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <CustomerSidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">My Bookings</h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Welcome back, {profile?.displayName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* Bookings Section */}
          <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">My Bookings</h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Your service appointments updated in real-time.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-3" />
                  <p className="text-neutral-500">Loading bookings...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-3">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">
                    No bookings yet. Use the "Book Services" menu to schedule your first service!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md sm:p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
                            <h3 className="text-base font-semibold text-neutral-900">
                              {SERVICE_TYPE_LABELS[booking.serviceType]}
                            </h3>
                            <Badge className={`${getStatusBadgeClass(booking.status)} border px-2 py-0.5 text-xs font-medium`}>
                              {BOOKING_STATUS_LABELS[booking.status]}
                            </Badge>
                            {booking.status === 'completed' && booking.customerRating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-yellow-600">
                                  {booking.customerRating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 text-sm text-neutral-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-neutral-400" />
                              <span>
                                {formatDate(booking.preferredDate)} - {formatTimeSlot(booking.preferredTimeSlot)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-neutral-400" />
                              <span>{booking.address}, {booking.city}</span>
                            </div>
                            {booking.technicianName && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-neutral-400" />
                                <span>Assigned to: {booking.technicianName}</span>
                              </div>
                            )}
                            {(booking.finalCost || booking.agreedPrice) && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-cyan-600">
                                  {formatCurrency(booking.finalCost || booking.agreedPrice || 0)}
                                  {booking.finalCost ? ' (Final)' : ' (Agreed)'}
                                </span>
                              </div>
                            )}
                            {/* Debug pricing - remove in production */}

                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 md:ml-4 md:w-auto md:items-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full md:w-auto"
                            onClick={() => handleOpenDetailsDialog(booking)}
                          >
                            View Details
                          </Button>
                          {booking.status === 'completed' && !booking.customerRating && (
                            <Button
                              size="sm"
                              className="w-full bg-cyan-500 text-white hover:bg-cyan-600 md:w-auto"
                              onClick={() => handleOpenRatingDialog(booking)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Rate Service
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <CustomerSidebar
            variant="mobile"
            className="relative z-40 h-full w-72 max-w-[80%]"
            onClose={() => setIsMobileNavOpen(false)}
            onNavigate={() => setIsMobileNavOpen(false)}
          />
        </div>
      )}

      {/* Rating Dialog */}
      {selectedBookingForRating && (
        <RatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          bookingId={selectedBookingForRating.id}
          technicianName={selectedBookingForRating.technicianName || 'Technician'}
          onSuccess={handleRatingSuccess}
        />
      )}

      {/* Booking Details Dialog */}
      {selectedBookingForDetails && (
        <BookingDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          booking={selectedBookingForDetails}
        />
      )}
    </div>
  );
}
