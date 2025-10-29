/**
 * Booking Details Dialog Component - Redesigned
 * Displays booking information in Step 4 summary style
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Image as ImageIcon,
  Star,
  X,
} from 'lucide-react';
import type { Booking } from '@/types/booking';
import { SERVICE_TYPE_LABELS, TIME_SLOT_LABELS } from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
}

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

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function BookingDetailsDialog({
  open,
  onOpenChange,
  booking,
}: BookingDetailsDialogProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Not set';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getServiceLabel = () => {
    return SERVICE_TYPE_LABELS[booking.serviceType as keyof typeof SERVICE_TYPE_LABELS] || booking.serviceType;
  };

  const getTimeSlotLabel = () => {
    return TIME_SLOT_LABELS[booking.preferredTimeSlot as keyof typeof TIME_SLOT_LABELS] || booking.preferredTimeSlot;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl font-bold">Booking Details</DialogTitle>
              <Badge className={`${getStatusBadgeClass(booking.status)} border px-3 py-1 text-sm font-medium`}>
                {statusLabels[booking.status] || booking.status}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Summary Card - Matching Step 4 Style */}
            <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">Booking Summary</h3>

              <div className="space-y-3">
                {/* Service */}
                <div>
                  <p className="text-sm text-neutral-500">Service</p>
                  <p className="font-medium">{getServiceLabel()}</p>
                </div>

                {/* Date & Time */}
                <div>
                  <p className="text-sm text-neutral-500">Date & Time</p>
                  <p className="font-medium">
                    {formatDate(booking.preferredDate)} - {getTimeSlotLabel()}
                  </p>
                </div>

                {/* Customer */}
                <div>
                  <p className="text-sm text-neutral-500">Customer</p>
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-sm text-neutral-600">
                    {booking.customerPhone} • {booking.customerEmail}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <p className="text-sm text-neutral-500">Location</p>
                  <p className="font-medium">
                    {booking.address}, {booking.city}
                  </p>
                </div>

                {/* Notes */}
                {booking.locationNotes && (
                  <div>
                    <p className="text-sm text-neutral-500">Notes</p>
                    <p className="font-medium">{booking.locationNotes}</p>
                  </div>
                )}

                {/* Technician (if assigned) */}
                {booking.technicianId && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-neutral-500">Assigned Technician</p>
                    <p className="font-medium">{booking.technicianName || 'Not assigned'}</p>
                    {booking.technicianPhone && (
                      <p className="text-sm text-neutral-600">{booking.technicianPhone}</p>
                    )}
                    {booking.technicianEmail && (
                      <p className="text-sm text-neutral-600">{booking.technicianEmail}</p>
                    )}
                  </div>
                )}

                {/* Service Report (for completed jobs) */}
                {booking.status === 'completed' && (booking as any).serviceReport && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-neutral-500">Service Report</p>
                    <div className="mt-2 bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                        {(booking as any).serviceReport}
                      </p>
                    </div>
                  </div>
                )}

                {/* Cost Information */}
                <div className="pt-3 border-t">
                  <p className="text-sm text-neutral-500">
                    {booking.finalCost ? 'Final Cost' : 'Agreed Price'}
                  </p>
                  <p className="text-2xl font-bold text-cyan-500">
                    {formatCurrency(booking.finalCost || booking.agreedPrice || 0)}
                  </p>
                  {booking.status === 'completed' && booking.finalCost && booking.agreedPrice && booking.finalCost !== booking.agreedPrice && (
                    <p className="text-sm text-neutral-500 mt-1">
                      Original price: {formatCurrency(booking.agreedPrice)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Service Photos */}
            {(booking as any).photoUrls && (booking as any).photoUrls.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-neutral-600" />
                  Service Photos
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(booking as any).photoUrls.map((url: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhoto(url)}
                      className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all"
                    >
                      <img
                        src={url}
                        alt={`Service photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Rating */}
            {booking.customerRating && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-neutral-600" />
                  Your Rating
                </h3>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= booking.customerRating!
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                    <span className="font-semibold text-lg">
                      {booking.customerRating.toFixed(1)}
                    </span>
                  </div>
                  {booking.customerReview && (
                    <p className="text-sm text-neutral-700 mt-2">
                      {booking.customerReview}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-teal-700 hover:bg-teal-800 text-white rounded-full px-8"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedPhoto}
              alt="Full size service photo"
              className="w-full h-full object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
