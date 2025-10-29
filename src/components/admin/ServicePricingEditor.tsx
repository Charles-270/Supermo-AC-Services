/**
 * Service Pricing Editor Component
 * Admin interface for managing service catalog prices
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getCurrentPricing, updateServicePricing, type ServicePricing } from '@/services/pricingService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import type { ServiceType } from '@/types/booking';
import { SERVICE_TYPE_LABELS } from '@/types/booking';
import { TECHNICIAN_PAYOUT_RATE } from '@/types/booking';

export function ServicePricingEditor() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPricing, setCurrentPricing] = useState<ServicePricing | null>(null);
  const [editedPricing, setEditedPricing] = useState<Omit<ServicePricing, 'lastUpdated' | 'updatedBy'> | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const pricing = await getCurrentPricing();
      setCurrentPricing(pricing);
      setEditedPricing({
        installation: pricing.installation,
        maintenance: pricing.maintenance,
        repair: pricing.repair,
        inspection: pricing.inspection,
      });
    } catch (err) {
      console.error('Error loading pricing:', err);
      toast({
        title: 'Error',
        description: 'Failed to load current pricing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (serviceType: ServiceType, value: string) => {
    if (!editedPricing) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setEditedPricing({
      ...editedPricing,
      [serviceType]: numValue,
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!editedPricing || !user || !profile) return;

    try {
      setSaving(true);
      await updateServicePricing(editedPricing, user.uid, profile.displayName);
      
      toast({
        title: 'Pricing Updated',
        description: 'Service prices have been updated successfully. Notifications sent to affected users.',
      });

      await loadPricing();
      setHasChanges(false);
    } catch (err) {
      console.error('Error updating pricing:', err);
      toast({
        title: 'Error',
        description: 'Failed to update pricing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!currentPricing) return;
    setEditedPricing({
      installation: currentPricing.installation,
      maintenance: currentPricing.maintenance,
      repair: currentPricing.repair,
      inspection: currentPricing.inspection,
    });
    setHasChanges(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (!currentPricing || !editedPricing) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600">Failed to load pricing data</p>
            <Button onClick={loadPricing} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const services: ServiceType[] = ['maintenance', 'inspection', 'repair', 'installation'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Service Pricing Management
        </CardTitle>
        <CardDescription>
          Set base prices for all service types. Changes will trigger notifications to technicians and customers with pending bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Last Updated Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Current Pricing Active</p>
              <p className="text-blue-700 mt-1">
                Last updated: {currentPricing.lastUpdated.toLocaleDateString()} at {currentPricing.lastUpdated.toLocaleTimeString()}
              </p>
              <p className="text-blue-700">
                Updated by: {currentPricing.updatedBy}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const currentPrice = currentPricing[service];
            const editedPrice = editedPricing[service];
            const hasChanged = currentPrice !== editedPrice;
            const technicianEarnings = editedPrice * TECHNICIAN_PAYOUT_RATE;
            const platformFee = editedPrice * (1 - TECHNICIAN_PAYOUT_RATE);

            return (
              <div key={service} className={`border rounded-lg p-4 ${hasChanged ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`price-${service}`} className="text-base font-semibold">
                      {SERVICE_TYPE_LABELS[service]}
                    </Label>
                    {hasChanged && (
                      <p className="text-xs text-orange-600 mt-1">
                        Changed from {formatCurrency(currentPrice)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${service}`} className="text-sm text-gray-600">
                      Customer Price (GHS)
                    </Label>
                    <Input
                      id={`price-${service}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={editedPrice}
                      onChange={(e) => handlePriceChange(service, e.target.value)}
                      className="text-lg font-semibold"
                    />
                  </div>

                  <div className="bg-gray-50 rounded p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Technician Earnings (90%):</span>
                      <span className="font-semibold text-green-600">{formatCurrency(technicianEarnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee (10%):</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(platformFee)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Impact Summary */}
        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900">Pending Changes</p>
                <p className="text-yellow-700 mt-1">
                  Saving will update prices immediately and send notifications to:
                </p>
                <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                  <li>All technicians (showing new earning rates)</li>
                  <li>Customers with pending/confirmed bookings (if price changed for their service)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            Reset Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Pricing
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
