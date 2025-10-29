/**
 * Multi-Step Booking Form
 * Service selection → Details → Schedule → Confirmation
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBooking } from '@/services/bookingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  ServiceType,
  ACUnitType,
  BookingFormData,
  ServiceDetails,
  PriorityLevel,
} from '@/types/booking';
import {
  SERVICE_TYPE_LABELS,
  TIME_SLOT_LABELS,
  GHANA_CITIES,
} from '@/types/booking';
import { Loader2, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ServiceSelector } from './ServiceSelector';
import { getCurrentPricing, type ServicePricing } from '@/services/pricingService';

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BookingForm({ open, onOpenChange, onSuccess }: BookingFormProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<ServicePricing | null>(null);

  // Form state
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails>({});
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [alternateDate, setAlternateDate] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Accra');
  const [locationNotes, setLocationNotes] = useState('');
  const [customerPhone, setCustomerPhone] = useState(profile?.phoneNumber || '');

  // Load pricing on mount
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const currentPricing = await getCurrentPricing();
        setPricing(currentPricing);
      } catch (err) {
        console.error('Error loading pricing:', err);
      }
    };
    void loadPricing();
  }, []);

  const handleSubmit = async () => {
    if (!user || !profile || !serviceType) return;

    setError(null);
    setLoading(true);

    try {
      const formData: BookingFormData = {
        serviceType,
        servicePackage: 'basic', // Deprecated but required by type - will be removed in backend migration
        serviceDetails,
        preferredDate: new Date(preferredDate),
        preferredTimeSlot,
        alternateDate: alternateDate ? new Date(alternateDate) : undefined,
        address,
        city,
        locationNotes,
        customerPhone,
      };

      await createBooking(formData, user.uid, profile.displayName, user.email || '');
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setStep(1);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError((err as Error).message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const resetForm = () => {
    setStep(1);
    setServiceType(null);
    setServiceDetails({});
    setPreferredDate('');
    setAlternateDate('');
    setAddress('');
    setCity('Accra');
    setLocationNotes('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) resetForm(); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Service</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Choose the service you need'}
            {step === 2 && 'Provide service details (optional)'}
            {step === 3 && 'Choose your preferred date and time'}
            {step === 4 && 'Review and confirm your booking'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-success" />
            <h3 className="text-xl font-semibold">Booking Confirmed!</h3>
            <p className="text-neutral-600 text-center">
              We'll send you a confirmation email shortly. A technician will be assigned soon.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Service Type Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <ServiceSelector
                  selectedService={serviceType}
                  onSelectService={setServiceType}
                />
              </div>
            )}

            {/* Step 2: Service Details */}
            {step === 2 && serviceType && (
              <div className="space-y-4">
                {serviceType === 'installation' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="ac-type">AC Unit Type</Label>
                      <Select
                        value={serviceDetails.acUnitType}
                        onValueChange={(v) => setServiceDetails({ ...serviceDetails, acUnitType: v as ACUnitType })}
                      >
                        <SelectTrigger id="ac-type">
                          <SelectValue placeholder="Select AC type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="split">Split AC</SelectItem>
                          <SelectItem value="window">Window AC</SelectItem>
                          <SelectItem value="central">Central AC</SelectItem>
                          <SelectItem value="portable">Portable AC</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room-count">Number of Rooms</Label>
                      <Input
                        id="room-count"
                        type="number"
                        min="1"
                        value={serviceDetails.roomCount || ''}
                        onChange={(e) => setServiceDetails({ ...serviceDetails, roomCount: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                )}

                {serviceType === 'repair' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="issue">Issue Description</Label>
                      <Textarea
                        id="issue"
                        placeholder="Describe the problem with your AC..."
                        value={serviceDetails.issueDescription || ''}
                        onChange={(e) => setServiceDetails({ ...serviceDetails, issueDescription: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="urgency">Urgency Level</Label>
                      <Select
                        value={serviceDetails.urgencyLevel}
                        onValueChange={(v) => setServiceDetails({ ...serviceDetails, urgencyLevel: v as PriorityLevel })}
                      >
                        <SelectTrigger id="urgency">
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === 'maintenance' && (
                  <div className="space-y-2">
                    <Label htmlFor="service-plan">Service Plan</Label>
                    <Select
                      value={serviceDetails.servicePlan}
                      onValueChange={(v) => setServiceDetails({ ...serviceDetails, servicePlan: v as 'basic' | 'premium' | 'vip' })}
                    >
                      <SelectTrigger id="service-plan">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - GHS 150</SelectItem>
                        <SelectItem value="premium">Premium - GHS 250</SelectItem>
                        <SelectItem value="vip">VIP - GHS 400</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {serviceType === 'inspection' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="property-type">Property Type</Label>
                      <Select
                        value={serviceDetails.propertyType}
                        onValueChange={(v) => setServiceDetails({ ...serviceDetails, propertyType: v as 'residential' | 'commercial' })}
                      >
                        <SelectTrigger id="property-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-count">Number of AC Units</Label>
                      <Input
                        id="unit-count"
                        type="number"
                        min="1"
                        value={serviceDetails.unitCount || ''}
                        onChange={(e) => setServiceDetails({ ...serviceDetails, unitCount: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred-date">Preferred Date *</Label>
                  <Input
                    id="preferred-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-slot">Preferred Time Slot *</Label>
                  <Select value={preferredTimeSlot} onValueChange={(v) => setPreferredTimeSlot(v as 'morning' | 'afternoon' | 'evening')}>
                    <SelectTrigger id="time-slot">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIME_SLOT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternate-date">Alternate Date (Optional)</Label>
                  <Input
                    id="alternate-date"
                    type="date"
                    value={alternateDate}
                    onChange={(e) => setAlternateDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Service Address *</Label>
                  <Input
                    id="address"
                    placeholder="Street address, building name, etc."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger id="city">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GHANA_CITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location-notes">Location Notes (Optional)</Label>
                  <Textarea
                    id="location-notes"
                    placeholder="Landmarks, gate code, parking info, etc."
                    value={locationNotes}
                    onChange={(e) => setLocationNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && serviceType && pricing && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-neutral-500">Service Type</p>
                      <p className="font-medium text-lg">
                        {SERVICE_TYPE_LABELS[serviceType]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Date & Time</p>
                      <p className="font-medium">
                        {new Date(preferredDate).toLocaleDateString()} - {TIME_SLOT_LABELS[preferredTimeSlot]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Location</p>
                      <p className="font-medium">{address}, {city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Contact</p>
                      <p className="font-medium">{customerPhone}</p>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-neutral-500">Agreed Price</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {formatCurrency(pricing[serviceType])}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Price locked at booking time</p>
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="text-sm text-error bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={prevStep} disabled={loading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="ml-auto">
                {step < 4 ? (
                  <Button 
                    onClick={nextStep} 
                    disabled={
                      (step === 1 && !serviceType) ||
                      (step === 3 && (!preferredDate || !address || !customerPhone))
                    }
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirm Booking
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 pt-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full ${s === step ? 'bg-primary-500' : 'bg-neutral-200'}`}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
