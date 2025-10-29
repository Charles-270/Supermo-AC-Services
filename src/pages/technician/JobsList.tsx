/**
 * Technician Jobs List Page - Redesigned
 * Modern job management interface with filtering and detailed job cards
 */

import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import { TechnicianLayout } from '@/components/layout/TechnicianLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { SERVICE_BASE_PRICING, TIME_SLOT_LABELS, TECHNICIAN_PAYOUT_RATE, SERVICE_TYPE_LABELS } from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { JobCard } from '@/components/technician/JobCard';
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';


export default function JobsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';

  // Real-time booking updates for this technician
  const { bookings, loading } = useRealtimeBookings({
    technicianId: user?.uid,
  });

  // Filter jobs based on query parameter
  const filteredJobs = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case 'new':
        // New jobs = confirmed status (waiting for technician to start)
        return bookings.filter(b => b.status === 'confirmed');

      case 'today':
        // Today's jobs = any job scheduled for today
        return bookings.filter(b => {
          const jobDate = b.preferredDate?.toDate?.();
          return jobDate && jobDate >= today && jobDate < tomorrow;
        });

      case 'active':
        // Active jobs = en_route, arrived, or in_progress
        return bookings.filter(b =>
          b.status === 'en_route' ||
          b.status === 'arrived' ||
          b.status === 'in_progress'
        );

      case 'completed':
        return bookings.filter(b => b.status === 'completed');

      default:
        // All jobs except cancelled/rescheduled
        return bookings.filter(b =>
          b.status !== 'cancelled' &&
          b.status !== 'rescheduled'
        );
    }
  }, [bookings, filter]);

  const getFilterLabel = () => {
    switch (filter) {
      case 'new': return 'New Jobs';
      case 'today': return "Today's Jobs";
      case 'active': return 'Active Jobs';
      case 'completed': return 'Completed Jobs';
      default: return 'All Jobs';
    }
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
        <div className="p-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          {/* Content Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              {/* Desktop: Table skeleton */}
              <div className="hidden md:block">
                <SkeletonTable />
              </div>
              {/* Mobile: Card skeletons */}
              <div className="md:hidden space-y-4">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getFilterLabel()}</h1>
            <p className="text-gray-600 mt-1">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Filter jobs">
            <Button 
              variant={filter === 'new' ? 'default' : 'outline'}
              onClick={() => navigate('/technician/jobs?filter=new')}
              size="sm"
              aria-pressed={filter === 'new'}
              aria-label="Show new jobs only"
            >
              New Jobs
            </Button>
            <Button 
              variant={filter === 'today' ? 'default' : 'outline'}
              onClick={() => navigate('/technician/jobs?filter=today')}
              size="sm"
              aria-pressed={filter === 'today'}
              aria-label="Show today's jobs only"
            >
              Today
            </Button>
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => navigate('/technician/jobs')}
              size="sm"
              aria-pressed={filter === 'all'}
              aria-label="Show all jobs"
            >
              All Jobs
            </Button>
          </div>
        </div>
        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Assignments</CardTitle>
            <CardDescription>
              Manage your scheduled service appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                <p className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</p>
                <p className="text-gray-600">
                  {filter === 'new' && "You don't have any new jobs assigned yet"}
                  {filter === 'today' && "You don't have any jobs scheduled for today"}
                  {filter === 'active' && "You don't have any active jobs"}
                  {filter === 'completed' && "You haven't completed any jobs yet"}
                  {filter === 'all' && "You don't have any jobs yet"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SERVICE</TableHead>
                        <TableHead>CUSTOMER</TableHead>
                        <TableHead>DATE & TIME</TableHead>
                        <TableHead>LOCATION</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>EARNINGS</TableHead>
                        <TableHead>ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => {
                        const servicePrice = SERVICE_BASE_PRICING[job.serviceType] || job.agreedPrice || 0;
                        const earnings = servicePrice * TECHNICIAN_PAYOUT_RATE;

                        return (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">
                              {SERVICE_TYPE_LABELS[job.serviceType as keyof typeof SERVICE_TYPE_LABELS] || job.serviceType}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{job.customerName}</p>
                                <p className="text-sm text-gray-500">{job.customerPhone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{formatDate(job.preferredDate)}</p>
                                <p className="text-sm text-gray-500">{formatTimeSlot(job.preferredTimeSlot)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start gap-1">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                <div>
                                  <p className="text-sm">{job.city}</p>
                                  <p className="text-xs text-gray-500">{job.address}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(job.status)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-green-600">
                                  {formatCurrency(earnings)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Your share (90%)
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => navigate(`/technician/job/${job.id}`)}
                                className="gap-2"
                                aria-label={`View details for ${SERVICE_TYPE_LABELS[job.serviceType as keyof typeof SERVICE_TYPE_LABELS]} job`}
                              >
                                View Details
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4" role="list" aria-label="Job listings">
                  {filteredJobs.map((job) => {
                    const servicePrice = SERVICE_BASE_PRICING[job.serviceType] || job.agreedPrice || 0;
                    const earnings = servicePrice * TECHNICIAN_PAYOUT_RATE;

                    return (
                      <div key={job.id} role="listitem">
                        <JobCard
                          job={job}
                          earnings={earnings}
                          onViewDetails={(jobId) => navigate(`/technician/job/${jobId}`)}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TechnicianLayout>
  );
}
