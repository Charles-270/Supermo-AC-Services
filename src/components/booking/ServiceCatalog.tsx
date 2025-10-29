/**
 * ServiceCatalog Component
 * Step 1: Browse and select AC services
 */

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import { Input } from '@/components/ui/input';
import { SERVICES, searchServices } from '@/constants/services';
import type { Service } from '@/types/booking-flow';
import { getCurrentPricing, type ServicePricing } from '@/services/pricingService';

interface ServiceCatalogProps {
  onServiceSelect: (service: Service) => void;
}

export function ServiceCatalog({ onServiceSelect }: ServiceCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pricing, setPricing] = useState<ServicePricing | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current pricing
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

  // Update services with dynamic pricing
  const servicesWithPricing: Service[] = pricing
    ? SERVICES.map(service => {
        const priceMap: Record<string, keyof ServicePricing> = {
          'install': 'installation',
          'maint': 'maintenance',
          'repair': 'repair',
          'inspect': 'inspection',
        };
        const priceKey = priceMap[service.id];
        const dynamicPrice = pricing[priceKey];
        return {
          ...service,
          priceFrom: typeof dynamicPrice === 'number' ? dynamicPrice : service.priceFrom,
        };
      })
    : SERVICES;

  const filteredServices = searchServices(searchQuery).map(service => {
    const updated = servicesWithPricing.find(s => s.id === service.id);
    return updated || service;
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
          Choose a Service
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative mx-auto max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <Input
          type="text"
          placeholder="Search for a service (e.g., AC repair)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-14 rounded-2xl border-neutral-300 pl-12 text-base shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
        />
      </div>

      {/* Service Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={onServiceSelect}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-neutral-500">
            No services found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
