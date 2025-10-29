/**
 * Manage Bookings Page - Redesigned
 * Admin interface to manage all bookings with notification alerts
 * Google Stitch-inspired design - October 2025
 */

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminBookingsList } from '@/components/booking/AdminBookingsList';
import { getAllBookings } from '@/services/bookingService';
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import type { Booking } from '@/types/booking';
import { AdminLayout } from '@/components/layout/AdminLayout';

export function ManageBookings() {
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingAlerts();
  }, []);

  const loadBookingAlerts = async () => {
    try {
      const bookings = await getAllBookings(100);

      const unassigned = bookings.filter(
        (b: Booking) =>
          !b.technicianId &&
          b.status !== 'cancelled' &&
          b.status !== 'completed'
      ).length;

      const newBookings = bookings.filter(
        (b: Booking) => b.status === 'pending'
      ).length;

      setUnassignedCount(unassigned);
      setNewBookingsCount(newBookings);
    } catch (error) {
      console.error('Error loading booking alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Manage Bookings"
      subtitle="View and manage all service requests"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'Bookings' }
      ]}
    >
      <div className="space-y-6">
        {/* Alert Banners */}
        {!loading && (
          <div className="space-y-4">
            {unassignedCount > 0 && (
              <Alert className="border-amber-500 bg-amber-50/50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-900">
                  {unassignedCount} {unassignedCount === 1 ? 'Booking' : 'Bookings'} Without Technician
                </AlertTitle>
                <AlertDescription className="text-amber-800">
                  {unassignedCount === 1
                    ? 'There is 1 booking that needs a technician assigned.'
                    : `There are ${unassignedCount} bookings that need technicians assigned.`}{' '}
                  Scroll down to assign technicians to pending bookings.
                </AlertDescription>
              </Alert>
            )}

            {newBookingsCount > 0 && (
              <Alert className="border-blue-500 bg-blue-50/50">
                <Clock className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-900">
                  {newBookingsCount} New {newBookingsCount === 1 ? 'Booking' : 'Bookings'}
                </AlertTitle>
                <AlertDescription className="text-blue-800">
                  {newBookingsCount === 1
                    ? 'There is 1 new booking awaiting confirmation.'
                    : `There are ${newBookingsCount} new bookings awaiting confirmation.`}{' '}
                  Review and assign technicians to confirm these bookings.
                </AlertDescription>
              </Alert>
            )}

            {unassignedCount === 0 && newBookingsCount === 0 && (
              <Alert className="border-green-500 bg-green-50/50">
                <Calendar className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-900">All Bookings Managed</AlertTitle>
                <AlertDescription className="text-green-800">
                  Great work! All bookings have been assigned to technicians.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <AdminBookingsList />
      </div>
    </AdminLayout>
  );
}
