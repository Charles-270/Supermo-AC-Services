/**
 * Service Selector Component
 * Displays 4 service types with dynamic pricing from catalog
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getCurrentPricing, type ServicePricing } from '@/services/pricingService';
import type { ServiceType } from '@/types/booking';
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_DESCRIPTIONS } from '@/types/booking';

interface ServiceSelectorProps {
  selectedService: ServiceType | null;
  onSelectService: (service: ServiceType) => void;
}

const SERVICE_ICONS: Record<ServiceType, string> = {
  installation: '⚡',
  maintenance: '🔧',
  repair: '🔨',
  inspection: '🔍',
};

export function ServiceSelector({ selectedService, onSelectService }: ServiceSelectorProps) {
  const [pricing, setPricing] = useState<ServicePricing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const currentPricing = await getCurrentPricing();
        setPricing(currentPricing);
      } catch (err) {
        console.error('Error loading pricing:', err);
      } finally {
        setLoading(false);
      }
    };
    void loadPricing();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load service pricing. Please try again.</p>
      </div>
    );
  }

  const services: ServiceType[] = ['maintenance', 'inspection', 'repair', 'installation'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service) => {
        const isSelected = selectedService === service;
        const price = pricing[service];

        return (
          <Card
            key={service}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              isSelected ? 'ring-4 ring-blue-500 shadow-xl scale-105' : 'hover:shadow-md'
            }`}
            onClick={() => onSelectService(service)}
          >
            <CardHeader className="text-center pb-3">
              <div className="text-5xl mb-2">{SERVICE_ICONS[service]}</div>
              <CardTitle className="text-lg">{SERVICE_TYPE_LABELS[service]}</CardTitle>
              <div className="text-3xl font-bold text-blue-600 my-2">
                {formatCurrency(price)}
              </div>
              <CardDescription className="text-sm">
                {SERVICE_TYPE_DESCRIPTIONS[service]}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 border-t">
              <div className="text-xs text-gray-500 text-center">
                Current catalog price • Locked at booking
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
