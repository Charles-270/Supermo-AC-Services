/**
 * Technician Dashboard Overview
 * Modern overview page for technician dashboard based on supplier design patterns
 */

import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  MapPin,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  TECHNICIAN_PAYOUT_RATE,
  SERVICE_TYPE_LABELS,
  TIME_SLOT_LABELS
} from '@/types/booking';
import { getCurrentPricing, type ServicePricing } from '@/services/pricingService';

interface TechnicianStats {
  newJobs: number;
  todayJobs: number;
  totalEarnings: number;
  completedJobs: number;
  averageRating: number;
}

export function TechnicianOverview() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const technicianId = user?.uid;
  const [pricing, setPricing] = useState<ServicePricing | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);

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

  // Real-time booking updates for this technician
  const { bookings, loading, error } = useRealtimeBookings({
    technicianId,
  });

  // Calculate metrics
  const stats = useMemo((): TechnicianStats => {
    if (!bookings || bookings.length === 0) {
      return { 
        newJobs: 0, 
        todayJobs: 0, 
        totalEarnings: 0, 
        completedJobs: 0,
        averageRating: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newJobs = bookings.filter(b => b.status === 'confirmed').length;

    const todayJobs = bookings.filter(b => {
      const jobDate = b.preferredDate?.toDate?.();
      return jobDate && jobDate >= today && jobDate < tomorrow;
    }).length;

    const completedBookings = bookings.filter(b => b.status === 'completed' && b.finalCost);
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.finalCost! * TECHNICIAN_PAYOUT_RATE), 0);
    const completedJobs = completedBookings.length;

    // Calculate average rating
    const ratedBookings = completedBookings.filter(b => b.customerRating);
    const averageRating = ratedBookings.length > 0 
      ? ratedBookings.reduce((sum, b) => sum + (b.customerRating || 0), 0) / ratedBookings.length
      : 0;

    return { newJobs, todayJobs, totalEarnings, completedJobs, averageRating };
  }, [bookings]);

  // Get recent bookings for display
  const recentBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings
      .filter(b => ['confirmed', 'in-progress'].includes(b.status))
      .sort((a, b) => {
        const dateA = a.preferredDate?.toDate?.() || new Date(0);
        const dateB = b.preferredDate?.toDate?.() || new Date(0);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, [bookings]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' }> = {
      'pending': { label: 'Pending', variant: 'secondary' },
      'confirmed': { label: 'Confirmed', variant: 'default' },
      'in-progress': { label: 'In Progress', variant: 'default' },
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

  return (
    <TechnicianLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {profile?.displayName || 'Technician'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    Failed to load dashboard data
                  </p>
                  <p className="text-sm text-red-800 mt-1">
                    {error}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-red-600 hover:text-red-800"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* New Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.newJobs}</div>
              <p className="text-xs text-gray-500">
                Confirmed and ready to start
              </p>
            </CardContent>
          </Card>

          {/* Today's Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.todayJobs}</div>
              <p className="text-xs text-gray-500">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.totalEarnings)}
              </div>
              <p className="text-xs text-gray-500">
                From {stats.completedJobs} completed jobs
              </p>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-gray-500">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Access your most common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/technician/jobs?filter=new')}
              className="gap-2 h-12"
            >
              <Briefcase className="h-4 w-4" />
              View New Jobs
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/technician/jobs?filter=today')}
              className="gap-2 h-12"
            >
              <Calendar className="h-4 w-4" />
              Today's Schedule
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/technician/earnings')}
              className="gap-2 h-12"
            >
              <DollarSign className="h-4 w-4" />
              View Earnings
            </Button>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Upcoming Jobs</CardTitle>
                <CardDescription>
                  Your next scheduled appointments
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => navigate('/technician/jobs')}
              >
                View All Jobs
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                <p>No upcoming jobs found.</p>
                <p className="text-sm">New jobs will appear here when assigned.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SERVICE</TableHead>
                      <TableHead>CUSTOMER</TableHead>
                      <TableHead>DATE & TIME</TableHead>
                      <TableHead>LOCATION</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>EARNINGS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => {
                      const servicePrice = booking.agreedPrice || (pricing ? pricing[booking.serviceType] : 0) || 0;
                      const earnings = servicePrice * TECHNICIAN_PAYOUT_RATE;

                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {SERVICE_TYPE_LABELS[booking.serviceType as keyof typeof SERVICE_TYPE_LABELS] || booking.serviceType}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.customerName}</p>
                              <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{formatDate(booking.preferredDate)}</p>
                              <p className="text-sm text-gray-500">{formatTimeSlot(booking.preferredTimeSlot)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-1">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{booking.city}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatCurrency(earnings)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Earnings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
            <CardDescription>
              How much you earn per service type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : pricing ? (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-900">🔧 AC Maintenance</span>
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
                      <span className="text-sm font-medium text-green-900">🔍 AC Inspection</span>
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
                      <span className="text-sm font-medium text-purple-900">🔨 AC Repair</span>
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
                      <span className="text-sm font-medium text-orange-900">⚡ AC Installation</span>
                      <span className="font-bold text-orange-600">
                        {formatCurrency(pricing.installation * TECHNICIAN_PAYOUT_RATE)}
                      </span>
                    </div>
                    <p className="text-xs text-orange-700 mt-1">
                      Customer pays {formatCurrency(pricing.installation)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Unable to load current pricing rates</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                💰 You keep 90% of the service fee, platform takes 10% commission
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TechnicianLayout>
  );
}