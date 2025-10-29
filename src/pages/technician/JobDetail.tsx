/**
 * Job Detail Page - Redesigned
 * Modern job detail view with status management and customer information
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBookingById, updateBookingStatus } from '@/services/bookingService';
import type { Booking, BookingStatus } from '@/types/booking';
import { TechnicianLayout } from '@/components/layout/TechnicianLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  CheckCircle2,
  Loader2,
  AlertCircle,
  PlayCircle,
  Flag,
  Wrench,
  User,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  SERVICE_TYPE_LABELS,
  TIME_SLOT_LABELS,
  SERVICE_BASE_PRICING,
  TECHNICIAN_PAYOUT_RATE,
} from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// Status workflow mapping
const NEXT_ACTION: Record<BookingStatus, { action: BookingStatus | null; label: string; icon: any }> = {
  pending: { action: null, label: '', icon: null },
  confirmed: { action: 'en_route', label: 'Start Journey', icon: PlayCircle },
  en_route: { action: 'arrived', label: 'Mark as Arrived', icon: Flag },
  arrived: { action: 'in_progress', label: 'Start Working', icon: Wrench },
  in_progress: { action: 'completed', label: 'Complete Job', icon: CheckCircle2 },
  completed: { action: null, label: '', icon: null },
  cancelled: { action: null, label: '', icon: null },
  rescheduled: { action: null, label: '', icon: null },
};

export default function JobDetailRedesigned() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobDetails = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);
      const bookingData = await getBookingById(jobId);

      if (!bookingData) {
        setError('Job not found');
        return;
      }

      // Verify this job belongs to the current technician
      if (bookingData.technicianId !== user?.uid) {
        setError('You are not assigned to this job');
        return;
      }

      setBooking(bookingData);
    } catch (err) {
      console.error('Error loading job details:', err);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [jobId, user?.uid]);

  useEffect(() => {
    void loadJobDetails();
  }, [loadJobDetails]);

  const handleStatusUpdate = async () => {
    if (!booking || !jobId) return;

    const nextAction = NEXT_ACTION[booking.status];
    if (!nextAction.action) return;

    // Special handling for completion - redirect to completion page
    if (nextAction.action === 'completed') {
      navigate(`/technician/job/${jobId}/complete`);
      return;
    }

    try {
      setUpdating(true);
      await updateBookingStatus(jobId, nextAction.action);
      await loadJobDetails();

      toast({
        title: 'Status updated',
        description: nextAction.label,
      });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: 'Update failed',
        description: 'Please try again',
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' }> = {
      'pending': { label: 'Pending', variant: 'secondary' },
      'confirmed': { label: 'New Job', variant: 'default' },
      'en_route': { label: 'En Route', variant: 'default' },
      'arrived': { label: 'Arrived', variant: 'default' },
      'in_progress': { label: 'In Progress', variant: 'default' },
      'completed': { label: 'Completed', variant: 'default' },
      'cancelled': { label: 'Cancelled', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };

    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeSlot = (timeSlot: string) => {
    return TIME_SLOT_LABELS[timeSlot as keyof typeof TIME_SLOT_LABELS] || timeSlot;
  };

  if (loading) {
    return (
      <TechnicianLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TechnicianLayout>
    );
  }

  if (error || !booking) {
    return (
      <TechnicianLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error || 'Job not found'}</p>
              <Button onClick={() => navigate('/technician/jobs')}>
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </TechnicianLayout>
    );
  }

  const nextAction = NEXT_ACTION[booking.status];
  const canUpdate = nextAction.action !== null;
  const finalCost = SERVICE_BASE_PRICING[booking.serviceType] || booking.agreedPrice || 0;
  const earnings = finalCost * TECHNICIAN_PAYOUT_RATE;

  const serviceDetails =
    booking.serviceDetails && typeof booking.serviceDetails === 'object'
      ? (booking.serviceDetails as Record<string, unknown>)
      : null;
  const serviceDescription =
    serviceDetails && typeof serviceDetails.description === 'string'
      ? serviceDetails.description
      : undefined;
  const urgencyLevel =
    serviceDetails && typeof serviceDetails.urgencyLevel === 'string'
      ? serviceDetails.urgencyLevel
      : undefined;
  const additionalServiceDetails =
    serviceDetails
      ? Object.entries(serviceDetails).filter(
        ([key]) => key !== 'description' && key !== 'urgencyLevel'
      )
      : [];

  return (
    <TechnicianLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
            <p className="text-gray-600 mt-1">
              {SERVICE_TYPE_LABELS[booking.serviceType as keyof typeof SERVICE_TYPE_LABELS] || booking.serviceType}
            </p>
          </div>
          {getStatusBadge(booking.status)}
        </div>

        {/* Earnings Card */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Your Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(earnings)}
              </div>
              <div className="text-sm space-y-1">
                <p className="text-green-700">
                  Customer pays {formatCurrency(finalCost)}
                </p>
                <p className="text-xs text-green-600">
                  {booking.status === 'completed' 
                    ? '✓ Final amount paid' 
                    : '📌 Agreed price at booking'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-lg">{booking.customerName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{booking.customerPhone}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={callCustomer}
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{booking.customerEmail}</p>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <p className="font-medium">
                  {SERVICE_TYPE_LABELS[booking.serviceType as keyof typeof SERVICE_TYPE_LABELS] || booking.serviceType}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{formatDate(booking.preferredDate)}</p>
                    <p className="text-sm text-gray-600">{formatTimeSlot(booking.preferredTimeSlot)}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Service Package</p>
                <p className="font-medium">
                  {SERVICE_TYPE_LABELS[booking.serviceType] || booking.serviceType}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-lg">{booking.address}</p>
              <p className="text-gray-600">{booking.city}</p>
            </div>

            {booking.locationNotes && (
              <div>
                <p className="text-sm text-gray-500">Location Notes</p>
                <p className="font-medium">{booking.locationNotes}</p>
              </div>
            )}

            <Button
              onClick={openGoogleMaps}
              className="gap-2 w-full sm:w-auto"
            >
              <Navigation className="h-4 w-4" />
              Open in Google Maps
            </Button>
          </CardContent>
        </Card>

        {/* Service Details */}
        {serviceDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {serviceDescription && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium">{serviceDescription}</p>
                  </div>
                )}

                {urgencyLevel && (
                  <div>
                    <p className="text-sm text-gray-500">Urgency</p>
                    <Badge variant={urgencyLevel === 'urgent' ? 'destructive' : 'secondary'}>
                      {urgencyLevel}
                    </Badge>
                  </div>
                )}

                {additionalServiceDetails.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <p className="text-sm text-gray-500">Additional Details</p>
                    <div className="space-y-1 text-sm text-gray-700">
                      {additionalServiceDetails.map(([key, value]) => (
                        <p key={key}>
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                          {typeof value === 'string' || typeof value === 'number'
                            ? String(value)
                            : JSON.stringify(value)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {canUpdate && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-blue-900">
                  Ready for the next step?
                </p>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  size="lg"
                  className="gap-2"
                >
                  {updating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <nextAction.icon className="h-5 w-5" />
                  )}
                  {updating ? 'Updating...' : nextAction.label}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TechnicianLayout>
  );
}
