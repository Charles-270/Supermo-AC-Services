/**
 * Earnings Card Component
 * Displays technician earnings summary
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign } from 'lucide-react';
import { getTechnicianEarningsPeriods } from '@/services/earningsService';
import type { EarningsPeriod } from '@/services/earningsService';
import { formatCurrency } from '@/lib/utils';

interface EarningsCardProps {
  technicianId: string;
}

export function EarningsCard({ technicianId }: EarningsCardProps) {
  const [earnings, setEarnings] = useState<EarningsPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEarnings();
  }, [technicianId]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const data = await getTechnicianEarningsPeriods(technicianId);
      setEarnings(data);
    } catch (err) {
      console.error('Error loading earnings:', err);
      setError('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </CardContent>
      </Card>
    );
  }

  if (error || !earnings) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-neutral-500">Failed to load earnings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Today
          </CardDescription>
          <CardTitle className="text-3xl text-primary-600">
            {formatCurrency(earnings.today)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="hover:shadow-lg transition-shadow border-primary-200">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            This Week
          </CardDescription>
          <CardTitle className="text-3xl text-primary-600">
            {formatCurrency(earnings.thisWeek)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardDescription>This Month</CardDescription>
          <CardTitle className="text-3xl text-primary-600">
            {formatCurrency(earnings.thisMonth)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
