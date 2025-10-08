/**
 * Job Detail Page
 * Technicians view full job details and update status
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBookingById, updateBookingStatus } from '@/services/bookingService';
import type { Booking, BookingStatus } from '@/types/booking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Clock,
  User,
  ArrowLeft,
  Navigation,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  SERVICE_TYPE_LABELS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_VARIANTS,
  TIME_SLOT_LABELS,
} from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// Status workflow for technicians
const STATUS_WORKFLOW: Record<BookingStatus, BookingStatus | null> = {
  pending: null, // Can't update pending (admin only)
  confirmed: 'en_route',
  en_route: 'arrived',
  arrived: 'in_progress',
  in_progress: 'completed', // Opens service report form
  completed: null,
  cancelled: null,
  rescheduled: null,
};

const STATUS_BUTTON_LABELS: Record<BookingStatus, string> = {
  pending: '',
  confirmed: 'Start Journey',
  en_route: 'Mark as Arrived',
  arrived: 'Start Work',
  in_progress: 'Complete Job',
  completed: '',
  cancelled: '',
  rescheduled: '',
};

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const data = await getBookingById(jobId);

      if (!data) {
        setError('Job not found');
        return;
      }

      // Verify technician has access
      if (data.technicianId !== user?.uid) {
        setError('You do not have access to this job');
        return;
      }

      setBooking(data);
    } catch (err) {
      console.error('Error loading job:', err);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!booking || !jobId) return;

    const nextStatus = STATUS_WORKFLOW[booking.status];
    if (!nextStatus) return;

    // If completing job, navigate to service report form
    if (nextStatus === 'completed') {
      navigate(`/technician/job/${jobId}/complete`);
      return;
    }

    try {
      setUpdating(true);
      await updateBookingStatus(jobId, nextStatus);

      // Reload job details to get updated status
      await loadJobDetails();
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: 'Update failed',
        description: 'Failed to update job status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const openGoogleMaps = () => {
    if (!booking) return;
    const address = `${booking.address}, ${booking.city}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  const callCustomer = () => {
    if (!booking) return;
    window.location.href = `tel:${booking.customerPhone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cool flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-cool flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-neutral-600 mb-4">{error || 'Job not found'}</p>
            <Button onClick={() => navigate('/dashboard/technician')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextStatus = STATUS_WORKFLOW[booking.status];
  const canUpdateStatus = nextStatus !== null;

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/technician')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Job Details</h1>
                <p className="text-sm text-neutral-600">#{jobId?.slice(0, 8)}</p>
              </div>
            </div>
            <Badge variant={BOOKING_STATUS_VARIANTS[booking.status]}>
              {BOOKING_STATUS_LABELS[booking.status]}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Service Info */}
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500">Service Type</p>
              <p className="text-lg font-semibold">{SERVICE_TYPE_LABELS[booking.serviceType]}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Scheduled Date & Time</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-neutral-400" />
                <p className="font-medium">
                  {booking.preferredDate?.toDate?.()?.toLocaleDateString()} -{' '}
                  {TIME_SLOT_LABELS[booking.preferredTimeSlot]}
                </p>
              </div>
            </div>
            {booking.serviceDetails.issueDescription && (
              <div>
                <p className="text-sm text-neutral-500">Issue Description</p>
                <p className="mt-1">{booking.serviceDetails.issueDescription}</p>
              </div>
            )}
            {booking.estimatedCost && (
              <div>
                <p className="text-sm text-neutral-500">Estimated Cost</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(booking.estimatedCost)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400" />
              <p className="font-medium">{booking.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Phone Number</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={callCustomer}
              >
                <Phone className="mr-2 h-4 w-4" />
                {booking.customerPhone}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-neutral-400 mt-0.5" />
              <div>
                <p className="font-medium">{booking.address}</p>
                <p className="text-neutral-600">{booking.city}</p>
                {booking.locationNotes && (
                  <p className="text-sm text-neutral-500 mt-1">Note: {booking.locationNotes}</p>
                )}
              </div>
            </div>
            <Button onClick={openGoogleMaps} className="w-full">
              <Navigation className="mr-2 h-4 w-4" />
              Open in Google Maps
            </Button>
          </CardContent>
        </Card>

        {/* Status Update Button */}
        {canUpdateStatus && (
          <Card className="border-primary-500">
            <CardContent className="pt-6">
              <Button
                onClick={handleStatusUpdate}
                disabled={updating}
                size="lg"
                className="w-full"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {STATUS_BUTTON_LABELS[booking.status]}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {booking.status === 'completed' && (
          <Card className="bg-success/10 border-success">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" />
              <p className="font-semibold text-success">Job Completed!</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
