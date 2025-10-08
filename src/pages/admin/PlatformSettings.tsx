/**
 * Platform Settings Page
 * Admin interface for configuring platform settings
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Building2,
  Wrench,
  CreditCard,
  Bell,
  Settings as SettingsIcon,
  Clock,
} from 'lucide-react';
import {
  getSettings,
  updateGeneralSettings,
  updateServiceSettings,
  updatePaymentSettings,
  updateNotificationSettings,
  updateSystemSettings,
  setMaintenanceMode,
} from '@/services/settingsService';
import type { PlatformSettings, ServiceType } from '@/types/settings';
import { toast } from '@/components/ui/use-toast';

export default function PlatformSettings() {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Form states for each category
  const [generalForm, setGeneralForm] = useState<PlatformSettings['general'] | null>(null);
  const [serviceForm, setServiceForm] = useState<PlatformSettings['service'] | null>(null);
  const [paymentForm, setPaymentForm] = useState<PlatformSettings['payment'] | null>(null);
  const [notificationForm, setNotificationForm] = useState<PlatformSettings['notifications'] | null>(null);
  const [systemForm, setSystemForm] = useState<PlatformSettings['system'] | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
      setGeneralForm(data.general);
      setServiceForm(data.service);
      setPaymentForm(data.payment);
      setNotificationForm(data.notifications);
      setSystemForm(data.system);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Failed to load settings',
        description: 'Please try again or refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!generalForm || !profile) return;
    setSaving(true);
    try {
      await updateGeneralSettings(generalForm, profile.uid);
      toast({
        title: 'General settings updated',
        description: 'Your changes have been saved successfully.',
        variant: 'success',
      });
      await loadSettings();
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast({
        title: 'Failed to save general settings',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveService = async () => {
    if (!serviceForm || !profile) return;
    setSaving(true);
    try {
      await updateServiceSettings(serviceForm, profile.uid);
      toast({
        title: 'Service settings updated',
        description: 'Service configuration has been saved.',
        variant: 'success',
      });
      await loadSettings();
    } catch (error) {
      console.error('Error saving service settings:', error);
      toast({
        title: 'Failed to save service settings',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    if (!paymentForm || !profile) return;
    setSaving(true);
    try {
      await updatePaymentSettings(paymentForm, profile.uid);
      toast({
        title: 'Payment settings updated',
        description: 'Payment configuration has been saved.',
        variant: 'success',
      });
      await loadSettings();
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast({
        title: 'Failed to save payment settings',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!notificationForm || !profile) return;
    setSaving(true);
    try {
      await updateNotificationSettings(notificationForm, profile.uid);
      toast({
        title: 'Notification settings updated',
        description: 'Notification preferences have been saved.',
        variant: 'success',
      });
      await loadSettings();
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'Failed to save notification settings',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    if (!systemForm || !profile) return;
    setSaving(true);
    try {
      await updateSystemSettings(systemForm, profile.uid);
      toast({
        title: 'System settings updated',
        description: 'System configuration has been saved.',
        variant: 'success',
      });
      await loadSettings();
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast({
        title: 'Failed to save system settings',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenanceMode = async () => {
    if (!systemForm || !profile) return;
    setSaving(true);
    try {
      const newValue = !systemForm.maintenanceMode;
      await setMaintenanceMode(newValue, systemForm.maintenanceMessage, profile.uid);
      toast({
        title: newValue ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
        description: newValue
          ? 'Users will see a maintenance notice across the platform.'
          : 'The platform is back online for users.',
        variant: 'success',
      });
      await loadSettings();
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast({
        title: 'Failed to toggle maintenance mode',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Platform Settings</h1>
                <p className="text-sm text-neutral-600">Configure your platform settings</p>
              </div>
            </div>
            <Button variant="outline" onClick={loadSettings} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Maintenance Mode Warning */}
        {systemForm?.maintenanceMode && (
          <Card className="mb-6 border-amber-500 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                Maintenance Mode Active
              </CardTitle>
              <CardDescription className="text-amber-800">
                The platform is currently in maintenance mode. Users cannot access the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleToggleMaintenanceMode} disabled={saving} variant="outline">
                Disable Maintenance Mode
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">
              <Building2 className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="service">
              <Wrench className="h-4 w-4 mr-2" />
              Service
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system">
              <SettingsIcon className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Configure your business details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generalForm && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="platformName">Platform Name</Label>
                        <Input
                          id="platformName"
                          value={generalForm.platformName}
                          onChange={(e) =>
                            setGeneralForm({ ...generalForm, platformName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={generalForm.businessName}
                          onChange={(e) =>
                            setGeneralForm({ ...generalForm, businessName: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={generalForm.tagline}
                        onChange={(e) =>
                          setGeneralForm({ ...generalForm, tagline: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={generalForm.contactEmail}
                          onChange={(e) =>
                            setGeneralForm({ ...generalForm, contactEmail: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          value={generalForm.contactPhone}
                          onChange={(e) =>
                            setGeneralForm({ ...generalForm, contactPhone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={generalForm.address}
                        onChange={(e) =>
                          setGeneralForm({ ...generalForm, address: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={generalForm.city}
                          onChange={(e) =>
                            setGeneralForm({ ...generalForm, city: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Input
                          id="region"
                          value={generalForm.region}
                          onChange={(e) =>
                            setGeneralForm({ ...generalForm, region: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={generalForm.country}
                          onChange={(e) =>
                            setGeneralForm({ ...generalForm, country: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveGeneral} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save General Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Set your operating hours for each day of the week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generalForm && Object.entries(generalForm.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 w-32">
                      <Checkbox
                        id={`${day}-open`}
                        checked={hours.isOpen}
                        onCheckedChange={(checked) =>
                          setGeneralForm({
                            ...generalForm,
                            businessHours: {
                              ...generalForm.businessHours,
                              [day]: { ...hours, isOpen: !!checked },
                            },
                          })
                        }
                      />
                      <Label htmlFor={`${day}-open`} className="capitalize cursor-pointer">
                        {day}
                      </Label>
                    </div>
                    {hours.isOpen && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            setGeneralForm({
                              ...generalForm,
                              businessHours: {
                                ...generalForm.businessHours,
                                [day]: { ...hours, open: e.target.value },
                              },
                            })
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            setGeneralForm({
                              ...generalForm,
                              businessHours: {
                                ...generalForm.businessHours,
                                [day]: { ...hours, close: e.target.value },
                              },
                            })
                          }
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveGeneral} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Business Hours
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Settings Tab */}
          <TabsContent value="service" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Configuration</CardTitle>
                <CardDescription>Configure service pricing and booking settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceForm && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultServiceFee">Default Service Fee (GH₵)</Label>
                        <Input
                          id="defaultServiceFee"
                          type="number"
                          value={serviceForm.defaultServiceFee}
                          onChange={(e) =>
                            setServiceForm({
                              ...serviceForm,
                              defaultServiceFee: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyServiceFee">Emergency Service Fee (GH₵)</Label>
                        <Input
                          id="emergencyServiceFee"
                          type="number"
                          value={serviceForm.emergencyServiceFee}
                          onChange={(e) =>
                            setServiceForm({
                              ...serviceForm,
                              emergencyServiceFee: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="installationFee">Installation Fee (%)</Label>
                        <Input
                          id="installationFee"
                          type="number"
                          value={serviceForm.installationFeePercentage}
                          onChange={(e) =>
                            setServiceForm({
                              ...serviceForm,
                              installationFeePercentage: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bookingAdvanceHours">Booking Advance (Hours)</Label>
                        <Input
                          id="bookingAdvanceHours"
                          type="number"
                          value={serviceForm.bookingAdvanceHours}
                          onChange={(e) =>
                            setServiceForm({
                              ...serviceForm,
                              bookingAdvanceHours: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxBookingsPerDay">Max Bookings Per Day</Label>
                        <Input
                          id="maxBookingsPerDay"
                          type="number"
                          value={serviceForm.maxBookingsPerDay}
                          onChange={(e) =>
                            setServiceForm({
                              ...serviceForm,
                              maxBookingsPerDay: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <Checkbox
                          id="allowWeekendBookings"
                          checked={serviceForm.allowWeekendBookings}
                          onCheckedChange={(checked) =>
                            setServiceForm({
                              ...serviceForm,
                              allowWeekendBookings: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="allowWeekendBookings" className="cursor-pointer">
                          Allow Weekend Bookings
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveService} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Service Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Configuration</CardTitle>
                <CardDescription>Configure payment methods and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentForm && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Input
                          id="currency"
                          value={paymentForm.currency}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, currency: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currencySymbol">Currency Symbol</Label>
                        <Input
                          id="currencySymbol"
                          value={paymentForm.currencySymbol}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, currencySymbol: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingFeeFlat">Shipping Fee (Flat, GH₵)</Label>
                        <Input
                          id="shippingFeeFlat"
                          type="number"
                          value={paymentForm.shippingFeeFlat}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              shippingFeeFlat: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          value={paymentForm.taxRate}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              taxRate: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Payment Methods</Label>
                      <div className="space-y-2">
                        {Object.entries(paymentForm.enabledPaymentMethods).map(([method, enabled]) => (
                          <div key={method} className="flex items-center space-x-2">
                            <Checkbox
                              id={method}
                              checked={enabled}
                              onCheckedChange={(checked) =>
                                setPaymentForm({
                                  ...paymentForm,
                                  enabledPaymentMethods: {
                                    ...paymentForm.enabledPaymentMethods,
                                    [method]: !!checked,
                                  },
                                })
                              }
                            />
                            <Label htmlFor={method} className="capitalize cursor-pointer">
                              {method.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSavePayment} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Payment Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure email, SMS, and push notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {notificationForm && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Email Notifications</h3>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="emailEnabled"
                          checked={notificationForm.emailNotifications.enabled}
                          onCheckedChange={(checked) =>
                            setNotificationForm({
                              ...notificationForm,
                              emailNotifications: {
                                ...notificationForm.emailNotifications,
                                enabled: !!checked,
                              },
                            })
                          }
                        />
                        <Label htmlFor="emailEnabled" className="cursor-pointer">
                          Enable Email Notifications
                        </Label>
                      </div>

                      {notificationForm.emailNotifications.enabled && (
                        <div className="pl-6 space-y-2">
                          {Object.entries(notificationForm.emailNotifications).map(([key, value]) => {
                            if (typeof value !== 'boolean') return null;
                            return (
                              <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`email-${key}`}
                                  checked={value}
                                  onCheckedChange={(checked) =>
                                    setNotificationForm({
                                      ...notificationForm,
                                      emailNotifications: {
                                        ...notificationForm.emailNotifications,
                                        [key]: !!checked,
                                      },
                                    })
                                  }
                                />
                                <Label htmlFor={`email-${key}`} className="capitalize cursor-pointer">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Admin Notifications</h3>
                      {Object.entries(notificationForm.adminNotifications).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`admin-${key}`}
                            checked={value}
                            onCheckedChange={(checked) =>
                              setNotificationForm({
                                ...notificationForm,
                                adminNotifications: {
                                  ...notificationForm.adminNotifications,
                                  [key]: !!checked,
                                },
                              })
                            }
                          />
                          <Label htmlFor={`admin-${key}`} className="capitalize cursor-pointer">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveNotifications} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Notification Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card className={systemForm?.maintenanceMode ? 'border-amber-500' : ''}>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure system-wide settings and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {systemForm && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Maintenance Mode</h3>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="maintenanceMode"
                          checked={systemForm.maintenanceMode}
                          onCheckedChange={(checked) =>
                            setSystemForm({ ...systemForm, maintenanceMode: !!checked })
                          }
                        />
                        <Label htmlFor="maintenanceMode" className="cursor-pointer">
                          Enable Maintenance Mode
                        </Label>
                      </div>
                      {systemForm.maintenanceMode && (
                        <div className="space-y-2">
                          <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                          <Input
                            id="maintenanceMessage"
                            value={systemForm.maintenanceMessage}
                            onChange={(e) =>
                              setSystemForm({ ...systemForm, maintenanceMessage: e.target.value })
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Features</h3>
                      {Object.entries(systemForm.features).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`feature-${key}`}
                            checked={value}
                            onCheckedChange={(checked) =>
                              setSystemForm({
                                ...systemForm,
                                features: {
                                  ...systemForm.features,
                                  [key]: !!checked,
                                },
                              })
                            }
                          />
                          <Label htmlFor={`feature-${key}`} className="capitalize cursor-pointer">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">User Management</h3>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="allowNewRegistrations"
                          checked={systemForm.allowNewRegistrations}
                          onCheckedChange={(checked) =>
                            setSystemForm({ ...systemForm, allowNewRegistrations: !!checked })
                          }
                        />
                        <Label htmlFor="allowNewRegistrations" className="cursor-pointer">
                          Allow New Registrations
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requireEmailVerification"
                          checked={systemForm.requireEmailVerification}
                          onCheckedChange={(checked) =>
                            setSystemForm({ ...systemForm, requireEmailVerification: !!checked })
                          }
                        />
                        <Label htmlFor="requireEmailVerification" className="cursor-pointer">
                          Require Email Verification
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requireAdminApproval"
                          checked={systemForm.requireAdminApproval}
                          onCheckedChange={(checked) =>
                            setSystemForm({ ...systemForm, requireAdminApproval: !!checked })
                          }
                        />
                        <Label htmlFor="requireAdminApproval" className="cursor-pointer">
                          Require Admin Approval (for non-customer roles)
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSaveSystem} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save System Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
