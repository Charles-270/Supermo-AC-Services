/**
 * JobCard Component
 * Mobile-responsive card view for job listings
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Clock, ExternalLink, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Booking } from '@/types/booking';
import { SERVICE_TYPE_LABELS, TIME_SLOT_LABELS } from '@/types/booking';

interface JobCardProps {
  job: Booking;
  earnings: number;
  onViewDetails: (jobId: string) => void;
}

export function JobCard({ job, earnings, onViewDetails }: JobCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-4">
        {/* Header: Service Type & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate" aria-label={`Service: ${SERVICE_TYPE_LABELS[job.serviceType as keyof typeof SERVICE_TYPE_LABELS]}`}>
              {SERVICE_TYPE_LABELS[job.serviceType as keyof typeof SERVICE_TYPE_LABELS] || job.serviceType}
            </h3>
            <p className="text-sm text-gray-600 truncate" aria-label={`Customer: ${job.customerName}`}>
              {job.customerName}
            </p>
          </div>
          {getStatusBadge(job.status)}
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{formatDate(job.preferredDate)}</span>
          <Clock className="h-4 w-4 flex-shrink-0 ml-2" aria-hidden="true" />
          <span className="truncate">{formatTimeSlot(job.preferredTimeSlot)}</span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{job.city}</p>
            <p className="text-xs truncate">{job.address}</p>
          </div>
        </div>

        {/* Earnings */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <DollarSign className="h-4 w-4 text-green-600" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold text-green-600" aria-label={`Your earnings: ${formatCurrency(earnings)}`}>
              {formatCurrency(earnings)}
            </p>
            <p className="text-xs text-gray-500">Your share (90%)</p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onViewDetails(job.id)}
          className="w-full gap-2"
          size="sm"
          aria-label={`View details for ${SERVICE_TYPE_LABELS[job.serviceType as keyof typeof SERVICE_TYPE_LABELS]} job`}
        >
          View Details
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Button>

        {/* Contact Info (for screen readers) */}
        <div className="sr-only" aria-live="polite">
          Customer phone: {job.customerPhone}
        </div>
      </CardContent>
    </Card>
  );
}
