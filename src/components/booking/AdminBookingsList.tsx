/**
 * Admin Bookings List Component
 * View and manage all bookings
 */

import { useState, useEffect } from 'react';
import { getAllBookings, updateBookingStatus, assignTechnician } from '@/services/bookingService';
import { TechnicianSelector } from '@/components/admin/TechnicianSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, User, Loader2 } from 'lucide-react';
import type { Booking, BookingStatus } from '@/types/booking';
import {
  SERVICE_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_VARIANTS,
  TIME_SLOT_LABELS,
} from '@/types/booking';
import { formatCurrency } from '@/lib/utils';

export function AdminBookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [selectedTechnicianName, setSelectedTechnicianName] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await getAllBookings(100);
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      await loadBookings(); // Refresh list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedBooking || !selectedTechnicianId) return;

    try {
      setAssigning(true);
      await assignTechnician(selectedBooking.id, selectedTechnicianId, selectedTechnicianName);
      setAssignDialogOpen(false);
      setSelectedTechnicianId('');
      setSelectedTechnicianName('');
      setSelectedBooking(null);
      await loadBookings();
    } catch (error) {
      console.error('Error assigning technician:', error);
    } finally {
      setAssigning(false);
    }
  };

  const openAssignDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setAssignDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>Manage customer service requests and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{SERVICE_TYPE_LABELS[booking.serviceType]}</h3>
                      <Badge variant={BOOKING_STATUS_VARIANTS[booking.status]}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </Badge>
                      {booking.priority === 'urgent' && (
                        <Badge variant="warning">Urgent</Badge>
                      )}
                      {booking.priority === 'emergency' && (
                        <Badge variant="destructive">Emergency</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {booking.customerName} ({booking.customerPhone})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.preferredDate?.toDate?.()?.toLocaleDateString() || 'Date not set'} - {TIME_SLOT_LABELS[booking.preferredTimeSlot]}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {booking.address}, {booking.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created: {booking.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </span>
                    </div>

                    {booking.technicianName && (
                      <p className="mt-2 text-sm text-primary-600 font-medium">
                        Assigned to: {booking.technicianName}
                      </p>
                    )}

                    {booking.serviceDetails.issueDescription && (
                      <p className="mt-2 text-sm text-neutral-700 bg-neutral-50 p-2 rounded">
                        <strong>Issue:</strong> {booking.serviceDetails.issueDescription}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-col gap-2 lg:items-end">
                    {booking.estimatedCost && (
                      <p className="text-lg font-semibold text-primary-600">
                        {formatCurrency(booking.estimatedCost)}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => openAssignDialog(booking)}
                        >
                          Assign Technician
                        </Button>
                      )}

                      <Select
                        value={booking.status}
                        onValueChange={(value) => handleStatusChange(booking.id, value as BookingStatus)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="rescheduled">Rescheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Technician Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>
              Assign a technician to this booking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedBooking && (
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  <strong>Service:</strong> {SERVICE_TYPE_LABELS[selectedBooking.serviceType]}
                </p>
                <p className="text-sm text-neutral-600">
                  <strong>Customer:</strong> {selectedBooking.customerName}
                </p>
                <p className="text-sm text-neutral-600">
                  <strong>Date:</strong> {selectedBooking.preferredDate?.toDate?.()?.toLocaleDateString()}
                </p>
              </div>
            )}

            <TechnicianSelector
              onSelect={(id, name) => {
                setSelectedTechnicianId(id);
                setSelectedTechnicianName(name);
              }}
              selectedTechnicianId={selectedTechnicianId}
              serviceArea={selectedBooking?.city || ''}
              showOnlyAvailable={true}
              showRecommendations={false}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAssignDialogOpen(false);
                  setSelectedTechnicianId('');
                  setSelectedTechnicianName('');
                  setSelectedBooking(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignTechnician} disabled={assigning || !selectedTechnicianId}>
                {assigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
