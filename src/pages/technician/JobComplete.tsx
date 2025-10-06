/**
 * Job Completion Page
 * Technicians fill out service report to complete a job
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBookingById } from '@/services/bookingService';
import type { Booking } from '@/types/booking';
import { ServiceReportForm } from '@/components/technician/ServiceReportForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function JobComplete() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
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

      if (data.technicianId !== user?.uid) {
        setError('You do not have access to this job');
        return;
      }

      if (data.status === 'completed') {
        setError('This job has already been completed');
        return;
      }

      if (data.status !== 'in_progress') {
        setError('Job must be in progress before completing');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cool flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
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

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/technician/job/${jobId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Complete Job</h1>
              <p className="text-sm text-neutral-600">Fill out service report</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ServiceReportForm
          booking={booking}
          onComplete={() => navigate('/dashboard/technician')}
        />
      </main>
    </div>
  );
}
