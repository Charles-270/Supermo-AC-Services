/**
 * Technician Dashboard
 * Manage jobs, communicate with customers, update job status
 */

import { useAuth } from '@/hooks/useAuth';
import { useRealtimeBookings, useRealtimeBookingCounts } from '@/hooks/useRealtimeBookings';
import { EarningsCard } from '@/components/technician/EarningsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, MapPin, Clock, CheckCircle, Loader2, Bell } from 'lucide-react';
import { SERVICE_TYPE_LABELS, BOOKING_STATUS_LABELS, BOOKING_STATUS_VARIANTS } from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function TechnicianDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Real-time booking updates for this technician
  const { bookings, loading, error } = useRealtimeBookings({
    technicianId: user?.uid,
  });

  // Real-time booking counts
  const { counts, loading: countsLoading } = useRealtimeBookingCounts(user?.uid, 'technician');

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Technician Dashboard</h1>
                <p className="text-sm text-neutral-600">Welcome, {profile?.displayName}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success">Available</Badge>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Earnings */}
        {user?.uid && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">My Earnings</h2>
            <EarningsCard technicianId={user.uid} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Confirmed Jobs</CardDescription>
              <CardTitle className="text-3xl">
                {countsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                ) : (
                  counts.confirmed
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl">
                {countsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                ) : (
                  counts['in-progress']
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">
                {countsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                ) : (
                  counts.completed
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Rating</CardDescription>
              <CardTitle className="text-3xl">4.8⭐</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Assigned Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-500" />
                  My Assigned Jobs
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" title="Live updates enabled"></span>
                  </span>
                </CardTitle>
                <CardDescription>Real-time job updates</CardDescription>
              </div>
              {!loading && bookings.length > 0 && (
                <Badge variant="outline" className="border-primary-500 text-primary-700">
                  <Bell className="h-3 w-3 mr-1" />
                  {bookings.length} Active {bookings.length === 1 ? 'Job' : 'Jobs'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-neutral-500">Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-error mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
                <p className="text-neutral-500">
                  No jobs assigned yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{SERVICE_TYPE_LABELS[booking.serviceType]}</h3>
                        <Badge variant={BOOKING_STATUS_VARIANTS[booking.status]}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {booking.preferredDate?.toDate?.()?.toLocaleDateString() || 'Date not set'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.address}, {booking.city}
                        </span>
                        <span className="text-primary-600">
                          Customer: {booking.customerName}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end gap-2">
                      {booking.estimatedCost && (
                        <p className="text-lg font-semibold text-primary-600">
                          {formatCurrency(booking.estimatedCost)}
                        </p>
                      )}
                      <Button size="sm" onClick={() => navigate(`/technician/job/${booking.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
