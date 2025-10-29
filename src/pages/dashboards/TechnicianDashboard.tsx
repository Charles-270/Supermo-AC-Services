/**
 * Technician Dashboard (Ultra-Simple Version)
 * 3-screen interface for non-tech-savvy technicians
 * Large buttons and clear visual hierarchy
 */

import { useAuth } from '@/hooks/useAuth';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BigButton } from '@/components/ui/big-button';
import { Wrench, Calendar, DollarSign, Loader2, LogOut, ArrowRight, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { TECHNICIAN_PAYOUT_RATE, SERVICE_TYPE_LABELS } from '@/types/booking';
import { getCurrentPricing, type ServicePricing } from '@/services/pricingService';

export function TechnicianDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<ServicePricing | null>(null);

  // Real-time booking updates for this technician
  const { bookings, loading, error } = useRealtimeBookings({
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
      }
    };
    void loadPricing();
  }, []);

  // Calculate simple metrics
  const metrics = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return { newJobs: 0, todayJobs: 0, totalEarnings: 0 };
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

    const totalEarnings = bookings
      .filter(b => b.status === 'completed' && b.finalCost)
      .reduce((sum, b) => sum + (b.finalCost! * TECHNICIAN_PAYOUT_RATE), 0);

    return { newJobs, todayJobs, totalEarnings };
  }, [bookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Jobs</h1>
                <p className="text-sm text-gray-600">{profile?.displayName}</p>
              </div>
            </div>
            <BigButton
              variant="secondary"
              icon={LogOut}
              className="min-h-[48px] w-auto px-4"
              onClick={signOut}
            >
              Exit
            </BigButton>
          </div>
        </div>
      </header>

      {/* 3 Big Cards - Ultra Simple */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Card 1: New Jobs */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Wrench className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600">{metrics.newJobs}</div>
                  <div className="text-lg text-gray-600 font-normal">New Jobs</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BigButton
                variant="default"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/technician/jobs?filter=new')}
              >
                View New Jobs
              </BigButton>
            </CardContent>
          </Card>

          {/* Card 2: Today's Jobs */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600">{metrics.todayJobs}</div>
                  <div className="text-lg text-gray-600 font-normal">Today's Jobs</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BigButton
                variant="success"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/technician/jobs?filter=today')}
              >
                View Today's Jobs
              </BigButton>
            </CardContent>
          </Card>

          {/* Card 3: My Earnings */}
          <Card className="border-2 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-yellow-600">
                    {formatCurrency(metrics.totalEarnings)}
                  </div>
                  <div className="text-lg text-gray-600 font-normal">Total Earnings</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-white/80 rounded-lg p-4 text-sm text-gray-700">
                <p className="font-semibold mb-2">💰 How You Earn:</p>
                {pricing ? (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>🔧 {SERVICE_TYPE_LABELS.maintenance}:</span>
                      <span className="font-semibold">{formatCurrency(pricing.maintenance * TECHNICIAN_PAYOUT_RATE)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🔍 {SERVICE_TYPE_LABELS.inspection}:</span>
                      <span className="font-semibold">{formatCurrency(pricing.inspection * TECHNICIAN_PAYOUT_RATE)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🔨 {SERVICE_TYPE_LABELS.repair}:</span>
                      <span className="font-semibold">{formatCurrency(pricing.repair * TECHNICIAN_PAYOUT_RATE)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⚡ {SERVICE_TYPE_LABELS.installation}:</span>
                      <span className="font-semibold">{formatCurrency(pricing.installation * TECHNICIAN_PAYOUT_RATE)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      You keep 90%, platform takes 10%
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-400" />
                  </div>
                )}
              </div>
              <BigButton
                variant="warning"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/technician/earnings')}
              >
                View Earnings History
              </BigButton>
            </CardContent>
          </Card>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help? Call support: 024-XXX-XXXX</p>
        </div>
      </main>
    </div>
  );
}
