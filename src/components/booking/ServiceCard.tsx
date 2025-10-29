/**
 * ServiceCard Component
 * Displays a single service with image, details, and booking button
 */

import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/dateTime';
import type { Service } from '@/types/booking-flow';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
  className?: string;
}

export function ServiceCard({ service, onSelect, className }: ServiceCardProps) {
  return (
    <div
      className={cn(
        'group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg',
        className
      )}
    >
      {/* Service Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <img
          src={service.imageUrl}
          alt={`${service.name} service`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23e5e7eb" width="400" height="225"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EService Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>

      {/* Service Content */}
      <div className="p-6">
        {/* Service Name */}
        <h3 className="mb-2 text-xl font-semibold text-neutral-900">
          {service.name}
        </h3>

        {/* Service Description */}
        <p className="mb-4 line-clamp-2 text-sm text-neutral-600">
          {service.description}
        </p>

        {/* Price and Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">From</p>
            <p className="text-lg font-semibold text-cyan-600">
              {formatCurrency(service.priceFrom)}
            </p>
          </div>

          <Button
            onClick={() => onSelect(service)}
            className="rounded-xl bg-cyan-500 px-6 hover:bg-cyan-600"
          >
            Book Service
          </Button>
        </div>
      </div>
    </div>
  );
}
