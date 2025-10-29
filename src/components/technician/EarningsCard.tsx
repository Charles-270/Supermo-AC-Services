/**
 * EarningsCard Component
 * Mobile-responsive card view for earnings history
 * Replaces the existing EarningsCard with enhanced accessibility
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Star, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Booking } from '@/types/booking';
import { SERVICE_TYPE_LABELS } from '@/types/booking';

interface EarningsCardProps {
  job: Booking;
  earnings: number;
}

export function EarningsCard({ job, earnings }: EarningsCardProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header: Date & Service */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{formatDate(job.completedAt)}</span>
            </div>
            <h3 className="font-semibold text-base truncate" aria-label={`Service: ${SERVICE_TYPE_LABELS[job.serviceType as keyof typeof SERVICE_TYPE_LABELS]}`}>
              {SERVICE_TYPE_LABELS[job.serviceType as keyof typeof SERVICE_TYPE_LABELS] || job.serviceType}
            </h3>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900 truncate" aria-label={`Customer: ${job.customerName}`}>
            {job.customerName}
          </p>
          <p className="text-xs text-gray-500 truncate">{job.customerPhone}</p>
          <p className="text-xs text-gray-500">{job.city}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {job.customerRating ? (
            <>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="font-medium text-sm" aria-label={`Rating: ${job.customerRating.toFixed(1)} out of 5 stars`}>
                {job.customerRating.toFixed(1)}
              </span>
            </>
          ) : (
            <Badge variant="secondary" className="text-xs">No Rating</Badge>
          )}
        </div>

        {/* Earnings */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <DollarSign className="h-4 w-4 text-green-600" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold text-green-600 text-lg" aria-label={`Your earnings: ${formatCurrency(earnings)}`}>
              {formatCurrency(earnings)}
            </p>
            <p className="text-xs text-gray-500">
              From {formatCurrency(job.finalCost!)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
