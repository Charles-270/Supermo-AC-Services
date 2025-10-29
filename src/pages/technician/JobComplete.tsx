/**
 * Job Completion Page - Redesigned
 * Modern job completion interface with clear pricing workflow
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBookingById, completeBooking } from '@/services/bookingService';
import type { Booking } from '@/types/booking';
import { TechnicianLayout } from '@/components/layout/TechnicianLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { PhotoUploader } from '@/components/technician/PhotoUploader';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  FileText, 
  DollarSign,
  User
} from 'lucide-react';
import { 
  SERVICE_BASE_PRICING, 
  TECHNICIAN_PAYOUT_RATE, 
  BOOKING_PLATFORM_COMMISSION_RATE,
  SERVICE_TYPE_LABELS,
  TIME_SLOT_LABELS
} from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

export default function JobComplete() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple form state
  const [serviceNotes, setServiceNotes] = useState('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  const loadJobDetails = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const data = await getBookingById(jobId);

      if (!data) {
        setError('Job not found');
        return;
      }

      if (data.technicianId !== user?.uid) {
        setError('You do not have access to this job');
        return;
      }

      if (data.status === 'completed') {
        setError('This job is already completed');
        return;
      }

      if (data.status !== 'in_progress') {
        setError('Job must be in progress before completing');
        return;
      }

      setBooking(data);
      setBeforePhotos(data.beforePhotos || []);
      setAfterPhotos(data.afterPhotos || []);
    } catch (err) {
      console.error('Error loading job:', err);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [jobId, user?.uid]);

  useEffect(() => {
    loadJobDetails();
  }, [loadJobDetails]);

  const handleSubmit = async () => {
    if (!booking || !jobId) return;

    if (!serviceNotes.trim()) {
      toast({
        title: '📝 Notes Required',
        description: 'Please add what you did before finishing',
        variant: 'destructive',
      });
      return;
    }

    if (beforePhotos.length === 0 || afterPhotos.length === 0) {
      toast({
        title: '📸 Photos Required',
        description: 'Please add before and after photos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      // Use the agreed price from booking (based on service type)
      const finalCost = SERVICE_BASE_PRICING[booking.serviceType] || booking.agreedPrice || 0;

      await completeBooking(jobId, {
        serviceNotes,
        beforePhotos,
        afterPhotos,
        finalCost,
        laborHours: 1, // Not used in ultra-simple mode but required by backend
      });

      toast({
        title: '✅ Job Completed!',
        description: `You earned ${formatCurrency(finalCost * TECHNICIAN_PAYOUT_RATE)}`,
      });

      // Show success screen briefly before navigating
      setTimeout(() => navigate('/dashboard/technician'), 1500);
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: 'Failed to Complete',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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
        <div className="flex items-center justify-center min-h-screen p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error || 'Job not found'}</p>
              <Button onClick={() => navigate('/dashboard/technician')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </TechnicianLayout>
    );
  }

  const finalCost = SERVICE_BASE_PRICING[booking.serviceType] || booking.agreedPrice || 0;
  const technicianEarnings = finalCost * TECHNICIAN_PAYOUT_RATE;
  const platformCommission = finalCost * BOOKING_PLATFORM_COMMISSION_RATE;

  return (
    <TechnicianLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/technician/job/${jobId}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Details
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Job</h1>
            <p className="text-gray-600">Finish the service and get paid</p>
          </div>
        </div>

        {/* Job Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Job Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <p className="font-medium">
                  {SERVICE_TYPE_LABELS[booking.serviceType as keyof typeof SERVICE_TYPE_LABELS] || booking.serviceType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {formatDate(booking.preferredDate)} - {formatTimeSlot(booking.preferredTimeSlot)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{booking.address}, {booking.city}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <DollarSign className="h-5 w-5" />
              Payment Breakdown
            </CardTitle>
            <CardDescription className="text-green-700">
              Here's how the payment will be split when you complete this job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600">Total Service Cost</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(finalCost)}</p>
                <p className="text-xs text-gray-500">Customer pays this amount</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg border border-green-300">
                <p className="text-sm text-green-700">Your Earnings (90%)</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(technicianEarnings)}</p>
                <p className="text-xs text-green-600">You receive this amount</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <p className="text-sm text-gray-600">Platform Fee (10%)</p>
                <p className="text-2xl font-bold text-gray-700">{formatCurrency(platformCommission)}</p>
                <p className="text-xs text-gray-500">Platform commission</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 text-center">
                💰 You will earn <span className="font-bold">{formatCurrency(technicianEarnings)}</span> for completing this job
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Step 1: Before Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              Step 1: Before Photos
            </CardTitle>
            <CardDescription>
              Take photos before starting work to document the initial condition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoUploader
              bookingId={booking.id}
              type="before"
              existingPhotos={beforePhotos}
              onPhotosChange={setBeforePhotos}
              maxPhotos={3}
            />
          </CardContent>
        </Card>

        {/* Step 2: After Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-green-600" />
              Step 2: After Photos
            </CardTitle>
            <CardDescription>
              Take photos after completing work to show the final result
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoUploader
              bookingId={booking.id}
              type="after"
              existingPhotos={afterPhotos}
              onPhotosChange={setAfterPhotos}
              maxPhotos={3}
            />
          </CardContent>
        </Card>

        {/* Step 3: Service Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Step 3: Service Report
            </CardTitle>
            <CardDescription>
              Describe what work you completed for the customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Example:&#10;- Cleaned AC filter and coils&#10;- Fixed refrigerant leak&#10;- Tested cooling performance&#10;- System working properly&#10;- Recommended regular maintenance"
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              rows={6}
              className="resize-none"
              required
            />
          </CardContent>
        </Card>

        {/* Completion Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Checklist</CardTitle>
            <CardDescription>
              Make sure all requirements are met before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                beforePhotos.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {beforePhotos.length > 0 ? '✓' : '○'}
              </div>
              <span className={beforePhotos.length > 0 ? 'text-green-600' : 'text-gray-500'}>
                Before photos uploaded ({beforePhotos.length}/3)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                afterPhotos.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {afterPhotos.length > 0 ? '✓' : '○'}
              </div>
              <span className={afterPhotos.length > 0 ? 'text-green-600' : 'text-gray-500'}>
                After photos uploaded ({afterPhotos.length}/3)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                serviceNotes.trim() ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {serviceNotes.trim() ? '✓' : '○'}
              </div>
              <span className={serviceNotes.trim() ? 'text-green-600' : 'text-gray-500'}>
                Service report completed
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <Button
              onClick={handleSubmit}
              disabled={submitting || beforePhotos.length === 0 || afterPhotos.length === 0 || !serviceNotes.trim()}
              className="w-full h-16 text-lg bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Completing Job...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Complete Job & Earn {formatCurrency(technicianEarnings)}
                </>
              )}
            </Button>
            
            <div className="mt-4 text-center text-sm text-green-700">
              <p>By completing this job, you confirm the work has been done satisfactorily</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TechnicianLayout>
  );
}

