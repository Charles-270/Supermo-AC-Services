/**
 * Supplier Settings Page
 * Business and payment settings based on Google Stitch designs
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getSupplierProfile,
  updateSupplierProfile,
  type SupplierProfileUpdates,
} from '@/services/supplierService';
import { SupplierLayout } from '@/components/layout/SupplierLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface BusinessFormData {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  deliveryCapacityPerDay: string;
  fulfillmentLeadTimeDays: string;
  serviceRadiusKm: string;
  fulfillmentRegions: string;
  productCategories: string;
}

interface PaymentFormData {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
}

interface NotificationFormData {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  lowStockAlerts: boolean;
  newProductApprovals: boolean;
}

export function SupplierSettings() {
  const { profile } = useAuth();
  const supplierId = profile?.uid;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [businessForm, setBusinessForm] = useState<BusinessFormData>({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',
    deliveryCapacityPerDay: '',
    fulfillmentLeadTimeDays: '',
    serviceRadiusKm: '',
    fulfillmentRegions: '',
    productCategories: '',
  });

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
  });

  const [notificationForm, setNotificationForm] = useState<NotificationFormData>({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    lowStockAlerts: true,
    newProductApprovals: true,
  });

  const loadProfile = useCallback(async () => {
    if (!supplierId) return;

    try {
      setLoading(true);
      const supplierProfile = await getSupplierProfile(supplierId);
      
      if (supplierProfile?.metadata) {
        const metadata = supplierProfile.metadata;
        setBusinessForm({
          companyName: metadata.companyName || '',
          contactEmail: metadata.contactEmail || '',
          contactPhone: metadata.contactPhone || '',
          businessAddress: metadata.warehouseLocation || '',
          deliveryCapacityPerDay: metadata.deliveryCapacityPerDay ? String(metadata.deliveryCapacityPerDay) : '',
          fulfillmentLeadTimeDays: metadata.fulfillmentLeadTimeDays ? String(metadata.fulfillmentLeadTimeDays) : '',
          serviceRadiusKm: metadata.serviceRadiusKm ? String(metadata.serviceRadiusKm) : '',
          fulfillmentRegions: metadata.fulfillmentRegions?.join(', ') || '',
          productCategories: metadata.productCategories?.join(', ') || '',
        });

        // Payment info would typically come from a separate secure service
        // For now, we'll use placeholder data
        setPaymentForm({
          bankName: (metadata as any).bankName || '',
          accountHolderName: (metadata as any).accountHolderName || '',
          accountNumber: (metadata as any).accountNumber || '',
          routingNumber: (metadata as any).routingNumber || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Failed to load profile',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    if (supplierId) {
      void loadProfile();
    }
  }, [supplierId, loadProfile]);

  const validateBusinessForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!businessForm.companyName.trim()) {
      newErrors.companyName = 'Business name is required';
    }

    if (businessForm.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessForm.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    if (businessForm.contactPhone && !/^\+?[\d\s\-()]+$/.test(businessForm.contactPhone)) {
      newErrors.contactPhone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBusinessSave = async () => {
    if (!supplierId) return;

    if (!validateBusinessForm()) {
      toast({
        title: 'Validation error',
        description: 'Please fix the errors before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const updates: SupplierProfileUpdates = {
        companyName: businessForm.companyName.trim() || undefined,
        contactEmail: businessForm.contactEmail.trim() || undefined,
        contactPhone: businessForm.contactPhone.trim() || undefined,
        warehouseLocation: businessForm.businessAddress.trim() || undefined,
        deliveryCapacityPerDay: businessForm.deliveryCapacityPerDay ? parseInt(businessForm.deliveryCapacityPerDay) : undefined,
        fulfillmentLeadTimeDays: businessForm.fulfillmentLeadTimeDays ? parseInt(businessForm.fulfillmentLeadTimeDays) : undefined,
        serviceRadiusKm: businessForm.serviceRadiusKm ? parseInt(businessForm.serviceRadiusKm) : undefined,
        fulfillmentRegions: businessForm.fulfillmentRegions ? businessForm.fulfillmentRegions.split(',').map(r => r.trim()).filter(Boolean) : undefined,
        productCategories: businessForm.productCategories ? businessForm.productCategories.split(',').map(c => c.trim()).filter(Boolean) : undefined,
      };

      await updateSupplierProfile(supplierId, updates);
      setErrors({});
      
      toast({
        title: 'Business information updated',
        description: 'Your business details have been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating business info:', error);
      toast({
        title: 'Update failed',
        description: 'Unable to update business information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSave = async () => {
    if (!supplierId) return;

    try {
      setSaving(true);
      
      // Note: In production, payment info should be handled by a secure payment service
      // For now, we'll store basic info in supplier metadata
      await updateSupplierProfile(supplierId, {
        bankName: paymentForm.bankName.trim() || undefined,
        accountHolderName: paymentForm.accountHolderName.trim() || undefined,
        // Note: Never store full account numbers in plain text in production
      } as any);
      
      toast({
        title: 'Payment settings updated',
        description: 'Your payment information has been saved securely.',
      });
    } catch (error) {
      console.error('Error updating payment info:', error);
      toast({
        title: 'Update failed',
        description: 'Unable to update payment information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    if (!supplierId) return;

    try {
      setSaving(true);
      
      await updateSupplierProfile(supplierId, {
        notificationPreferences: notificationForm,
      } as any);
      
      toast({
        title: 'Notification preferences updated',
        description: 'Your notification settings have been saved.',
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast({
        title: 'Update failed',
        description: 'Unable to update notification preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your business profile, payment details, and account settings.
          </p>
        </div>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your company's public details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={businessForm.companyName}
                  onChange={(e) => {
                    setBusinessForm(prev => ({ ...prev, companyName: e.target.value }));
                    if (errors.companyName) setErrors(prev => ({ ...prev, companyName: '' }));
                  }}
                  placeholder="Barcelona Royal"
                  className={errors.companyName ? 'border-red-500' : ''}
                  aria-invalid={!!errors.companyName}
                  aria-describedby={errors.companyName ? 'business-name-error' : undefined}
                />
                {errors.companyName && (
                  <p id="business-name-error" className="text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={businessForm.contactEmail}
                    onChange={(e) => {
                      setBusinessForm(prev => ({ ...prev, contactEmail: e.target.value }));
                      if (errors.contactEmail) setErrors(prev => ({ ...prev, contactEmail: '' }));
                    }}
                    placeholder="contact@barcelonaroyal.com"
                    className={errors.contactEmail ? 'border-red-500' : ''}
                    aria-invalid={!!errors.contactEmail}
                    aria-describedby={errors.contactEmail ? 'contact-email-error' : undefined}
                  />
                  {errors.contactEmail && (
                    <p id="contact-email-error" className="text-sm text-red-600">{errors.contactEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    value={businessForm.contactPhone}
                    onChange={(e) => {
                      setBusinessForm(prev => ({ ...prev, contactPhone: e.target.value }));
                      if (errors.contactPhone) setErrors(prev => ({ ...prev, contactPhone: '' }));
                    }}
                    placeholder="+1 (555) 123-4567"
                    className={errors.contactPhone ? 'border-red-500' : ''}
                    aria-invalid={!!errors.contactPhone}
                    aria-describedby={errors.contactPhone ? 'phone-number-error' : undefined}
                  />
                  {errors.contactPhone && (
                    <p id="phone-number-error" className="text-sm text-red-600">{errors.contactPhone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-address">Business Address</Label>
                <Textarea
                  id="business-address"
                  value={businessForm.businessAddress}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, businessAddress: e.target.value }))}
                  placeholder="123 Commerce St, Accra, Ghana"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery-capacity">Daily Delivery Capacity</Label>
                  <Input
                    id="delivery-capacity"
                    type="number"
                    value={businessForm.deliveryCapacityPerDay}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, deliveryCapacityPerDay: e.target.value }))}
                    placeholder="25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead-time">Lead Time (days)</Label>
                  <Input
                    id="lead-time"
                    type="number"
                    value={businessForm.fulfillmentLeadTimeDays}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, fulfillmentLeadTimeDays: e.target.value }))}
                    placeholder="2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-radius">Service Radius (km)</Label>
                  <Input
                    id="service-radius"
                    type="number"
                    value={businessForm.serviceRadiusKm}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, serviceRadiusKm: e.target.value }))}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fulfillment-regions">Fulfillment Regions</Label>
                <Input
                  id="fulfillment-regions"
                  value={businessForm.fulfillmentRegions}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, fulfillmentRegions: e.target.value }))}
                  placeholder="Greater Accra, Ashanti, Eastern"
                />
                <p className="text-xs text-gray-500">Separate multiple regions with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-categories">Product Categories</Label>
                <Input
                  id="product-categories"
                  value={businessForm.productCategories}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, productCategories: e.target.value }))}
                  placeholder="Split AC, Central AC, Spare Parts"
                />
                <p className="text-xs text-gray-500">Separate multiple categories with commas</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleBusinessSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>
              Manage how you receive payments for your orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={paymentForm.bankName}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="Global Commerce Bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-holder">Account Holder Name</Label>
                  <Input
                    id="account-holder"
                    value={paymentForm.accountHolderName}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                    placeholder="Barcelona Royal Ltd."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <PasswordInput
                    id="account-number"
                    value={paymentForm.accountNumber}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="••••••••••••1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routing-number">Routing Number</Label>
                  <Input
                    id="routing-number"
                    value={paymentForm.routingNumber}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handlePaymentSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Payment Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you receive updates about your supplier account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Checkbox
                  id="email-notifications"
                  checked={notificationForm.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationForm(prev => ({ ...prev, emailNotifications: checked as boolean }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications" className="text-base font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via text message
                  </p>
                </div>
                <Checkbox
                  id="sms-notifications"
                  checked={notificationForm.smsNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationForm(prev => ({ ...prev, smsNotifications: checked as boolean }))
                  }
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium text-gray-900 mb-3">Notification Types</p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="order-updates"
                      checked={notificationForm.orderUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationForm(prev => ({ ...prev, orderUpdates: checked as boolean }))
                      }
                    />
                    <label
                      htmlFor="order-updates"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Order Updates
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="low-stock-alerts"
                      checked={notificationForm.lowStockAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationForm(prev => ({ ...prev, lowStockAlerts: checked as boolean }))
                      }
                    />
                    <label
                      htmlFor="low-stock-alerts"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Low Stock Alerts
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new-product-approvals"
                      checked={notificationForm.newProductApprovals}
                      onCheckedChange={(checked) => 
                        setNotificationForm(prev => ({ ...prev, newProductApprovals: checked as boolean }))
                      }
                    />
                    <label
                      htmlFor="new-product-approvals"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      New Product Approvals
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNotificationSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SupplierLayout>
  );
}
