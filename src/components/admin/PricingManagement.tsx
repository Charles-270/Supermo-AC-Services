/**
 * Pricing Management Component
 * Allows admins to update service pricing with impact preview
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  getCurrentPricing,
  updateServicePricing,
  calculatePricingImpact,
  type ServicePricing 
} from '@/services/pricingService';
import { SERVICE_TYPE_LABELS } from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Save,
  RefreshCw,
  Users,
  Wrench
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PricingManagementProps {
  className?: string;
}

export function PricingManagement({ className }: PricingManagementProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPricing, setCurrentPricing] = useState<ServicePricing | null>(null);
  const [newPricing, setNewPricing] = useState<Omit<ServicePricing, 'lastUpdated' | 'updatedBy'>>({
    installation: 0,
    maintenance: 0,
    repair: 0,
    inspection: 0,
  });

  const loadCurrentPricing = async () => {
    try {
      setLoading(true);
      const pricing = await getCurrentPricing();
      setCurrentPricing(pricing);
      setNewPricing({
        installation: pricing.installation,
        maintenance: pricing.maintenance,
        repair: pricing.repair,
        inspection: pricing.inspection,
      });
    } catch (error) {
      console.error('Error loading pricing:', error);
      toast({
        title: 'Error loading pricing',
        description: 'Failed to load current service pricing.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCurrentPricing();
  }, []);

  const handlePriceChange = (serviceType: keyof typeof newPricing, value: string) => {
    const numValue = parseFloat(value) || 0;
    setNewPricing(prev => ({
      ...prev,
      [serviceType]: numValue,
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      
      await updateServicePricing(
        newPricing,
        profile.uid,
        profile.displayName || 'Admin'
      );

      toast({
        title: 'Pricing updated successfully',
        description: 'Service pricing has been updated and notifications sent to users.',
      });

      // Reload current pricing
      await loadCurrentPricing();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: 'Error updating pricing',
        description: 'Failed to update service pricing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (currentPricing) {
      setNewPricing({
        installation: currentPricing.installation,
        maintenance: currentPricing.maintenance,
        repair: currentPricing.repair,
        inspection: currentPricing.inspection,
      });
    }
  };

  // Calculate impact if there are changes
  const hasChanges = currentPricing && (
    newPricing.installation !== currentPricing.installation ||
    newPricing.maintenance !== currentPricing.maintenance ||
    newPricing.repair !== currentPricing.repair ||
    newPricing.inspection !== currentPricing.inspection
  );

  const pricingImpact = currentPricing && hasChanges 
    ? calculatePricingImpact(currentPricing, newPricing as ServicePricing)
    : [];

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Service Pricing Management</CardTitle>
          <CardDescription>Update service prices across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading current pricing...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Service Pricing Management</CardTitle>
            <CardDescription>
              Update service prices across the platform
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCurrentPricing}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Pricing Info */}
        {currentPricing && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Current Pricing</h4>
              <Badge variant="secondary">
                Last updated: {currentPricing.lastUpdated.toLocaleDateString()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Installation:</span>
                <span className="font-medium ml-2">{formatCurrency(currentPricing.installation)}</span>
              </div>
              <div>
                <span className="text-gray-600">Maintenance:</span>
                <span className="font-medium ml-2">{formatCurrency(currentPricing.maintenance)}</span>
              </div>
              <div>
                <span className="text-gray-600">Repair:</span>
                <span className="font-medium ml-2">{formatCurrency(currentPricing.repair)}</span>
              </div>
              <div>
                <span className="text-gray-600">Inspection:</span>
                <span className="font-medium ml-2">{formatCurrency(currentPricing.inspection)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Price Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(SERVICE_TYPE_LABELS).map(([serviceType, label]) => (
            <div key={serviceType} className="space-y-2">
              <Label htmlFor={serviceType} className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                {label}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  GHC
                </span>
                <Input
                  id={serviceType}
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPricing[serviceType as keyof typeof newPricing]}
                  onChange={(e) => handlePriceChange(serviceType as keyof typeof newPricing, e.target.value)}
                  className="pl-12"
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Impact Preview */}
        {hasChanges && pricingImpact.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Pricing Impact Preview</AlertTitle>
            <AlertDescription>
              <div className="mt-3 space-y-3">
                {pricingImpact.map((impact) => (
                  <div key={impact.serviceType} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {SERVICE_TYPE_LABELS[impact.serviceType]}
                      </span>
                      <div className="flex items-center gap-2">
                        {impact.changePercentage > 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <Badge variant={impact.changePercentage > 0 ? 'destructive' : 'default'}>
                          {impact.changePercentage > 0 ? '+' : ''}{impact.changePercentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600">Customer Impact:</span>
                        <span className="font-medium">{impact.customerImpact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Technician Impact:</span>
                        <span className="font-medium">{impact.technicianImpact}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Price changes will trigger automatic notifications to all customers and technicians 
                    to ensure transparency. Changes take effect immediately after saving.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
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
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Updating...' : 'Update Pricing'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}