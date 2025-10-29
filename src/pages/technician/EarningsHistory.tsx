/**
 * Technician Earnings History Page - Redesigned
 * Modern earnings tracking with detailed breakdown and history
 */

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import { TechnicianLayout } from '@/components/layout/TechnicianLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, DollarSign, TrendingUp, Star, Loader2 } from 'lucide-react';
import { TECHNICIAN_PAYOUT_RATE, SERVICE_TYPE_LABELS } from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { getCurrentPricing, type ServicePricing } from '@/services/pricingService';
import { EarningsCard } from '@/components/technician/EarningsCard';
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';

export default function EarningsHistory() {
  const { user } = useAuth();
  const [pricing, setPricing] = useState<ServicePricing | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);

  // Real-time booking updates for this technician
  const { bookings, loading } = useRealtimeBookings({
    technicianId: user?.uid,
  });

  // Fetch current service pricing
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const currentPricing = await getCurrentPricing();
        setPricing(currentPricing);
      } catch (err) {
        console.error('Error loading pricing:', err);
      } finally {
        setPricingLoading(false);
      }
    };
    void loadPricing();
  }, []);

  // Calculate earnings
  const { completedJobs, totalEarnings, monthlyEarnings, averageRating } = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return { completedJobs: [], totalEarnings: 0, monthlyEarnings: 0, averageRating: 0 };
    }

    const completed = bookings.filter(b => b.status === 'completed' && b.finalCost);

    const total = completed.reduce((sum, b) => sum + (b.finalCost! * TECHNICIAN_PAYOUT_RATE), 0);

    // Calculate current month earnings
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthly = completed
      .filter(b => {
        const completedDate = b.completedAt?.toDate?.();
        return completedDate && completedDate >= monthStart;
      })
      .reduce((sum, b) => sum + (b.finalCost! * TECHNICIAN_PAYOUT_RATE), 0);

    // Calculate average rating
    const ratedJobs = completed.filter(b => b.customerRating);
    const avgRating = ratedJobs.length > 0 
      ? ratedJobs.reduce((sum, b) => sum + (b.customerRating || 0), 0) / ratedJobs.length
      : 0;

    // Sort by completion date, most recent first
    const sorted = [...completed].sort((a, b) => {
      const dateA = a.completedAt?.toDate?.()?.getTime() || 0;
      const dateB = b.completedAt?.toDate?.()?.getTime() || 0;
      return dateB - dateA;
    });

    return { 
      completedJobs: sorted, 
      totalEarnings: total, 
      monthlyEarnings: monthly,
      averageRating: avgRating
    };
  }, [bookings]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <TechnicianLayout>
        <div className="p-6 space-y-6">
          {/* Header Skeleton */}
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Breakdown Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* History Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="hidden md:block">
                <SkeletonTable />
              </div>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings History</h1>
          <p className="text-gray-600 mt-1">
            Track your completed jobs and earnings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Earnings */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalEarnings)}
              </div>
              <p className="text-xs text-green-700">
                From {completedJobs.length} completed jobs
              </p>
            </CardContent>
          </Card>

          {/* Monthly Earnings */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlyEarnings)}
              </div>
              <p className="text-xs text-blue-700">
                Current month earnings
              </p>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-yellow-700">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Current Earnings Rates
            </CardTitle>
            <CardDescription>
              How much you earn per service type (90% of customer payment)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pricingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : pricing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">🔧 Maintenance</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(pricing.maintenance * TECHNICIAN_PAYOUT_RATE)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Customer pays {formatCurrency(pricing.maintenance)}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-900">🔍 Inspection</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(pricing.inspection * TECHNICIAN_PAYOUT_RATE)}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Customer pays {formatCurrency(pricing.inspection)}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-900">🔨 Repair</span>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(pricing.repair * TECHNICIAN_PAYOUT_RATE)}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mt-1">
                    Customer pays {formatCurrency(pricing.repair)}
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-900">⚡ Installation</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(pricing.installation * TECHNICIAN_PAYOUT_RATE)}
                    </span>
                  </div>
                  <p className="text-xs text-orange-700 mt-1">
                    Customer pays {formatCurrency(pricing.installation)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Unable to load current pricing rates</p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 These are current rates. Your completed jobs show the price agreed at booking time.
            </p>
          </CardContent>
        </Card>

        {/* Completed Jobs History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Jobs</CardTitle>
            <CardDescription>
              History of your completed service appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completedJobs.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                <p className="text-lg font-semibold text-gray-900 mb-2">No Completed Jobs</p>
                <p className="text-gray-600">
                  Your completed jobs will appear here once you finish your first service.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>DATE</TableHead>
                        <TableHead>SERVICE</TableHead>
                        <TableHead>CUSTOMER</TableHead>
                        <TableHead>LOCATION</TableHead>
                        <TableHead>RATING</TableHead>
                        <TableHead>EARNINGS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedJobs.map((job) => {
                        const earnings = job.finalCost! * TECHNICIAN_PAYOUT_RATE;
                        
                        return (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">
                              {formatDate(job.completedAt)}
                            </TableCell>
                            <TableCell>
                              {SERVICE_TYPE_LABELS[job.serviceType as keyof typeof SERVICE_TYPE_LABELS] || job.serviceType}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{job.customerName}</p>
                                <p className="text-sm text-gray-500">{job.customerPhone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{job.city}</p>
                            </TableCell>
                            <TableCell>
                              {job.customerRating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                                  <span className="font-medium" aria-label={`Rating: ${job.customerRating.toFixed(1)} out of 5 stars`}>
                                    {job.customerRating.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <Badge variant="secondary">No Rating</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-green-600">
                                  {formatCurrency(earnings)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  From {formatCurrency(job.finalCost!)}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4" role="list" aria-label="Completed jobs">
                  {completedJobs.map((job) => {
                    const earnings = job.finalCost! * TECHNICIAN_PAYOUT_RATE;
                    
                    return (
                      <div key={job.id} role="listitem">
                        <EarningsCard job={job} earnings={earnings} />
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
