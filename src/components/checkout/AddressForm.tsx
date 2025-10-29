/**
 * Address Form Component
 * Delivery address collection step
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddressData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  landmark?: string;
}

interface AddressFormProps {
  addressData: AddressData;
  onAddressChange: (data: AddressData) => void;
  onBack: () => void;
  onNext: () => void;
}

const GHANA_CITIES = ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Tema'];
const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Northern',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Savannah',
  'North East',
  'Oti',
  'Western North',
];

export function AddressForm({ addressData, onAddressChange, onBack, onNext }: AddressFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof AddressData, value: string) => {
    onAddressChange({ ...addressData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field: keyof AddressData, value: string): string | null => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return null;

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^\d{9,15}$/.test(value.replace(/[\s-]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return null;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;

      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Please enter a complete address';
        return null;

      default:
        return null;
    }
  };

  const handleBlur = (field: keyof AddressData, value: string) => {
    const error = validateField(field, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    // Validate all required fields
    const nameError = validateField('fullName', addressData.fullName);
    if (nameError) newErrors.fullName = nameError;

    const phoneError = validateField('phone', addressData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const emailError = validateField('email', addressData.email);
    if (emailError) newErrors.email = emailError;

    const addressError = validateField('address', addressData.address);
    if (addressError) newErrors.address = addressError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const isFormValid =
    addressData.fullName.trim().length >= 2 &&
    addressData.phone.trim().length >= 9 &&
    (!addressData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressData.email)) &&
    addressData.address.trim().length >= 10;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
          Delivery Information
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Where should we deliver your order?
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={addressData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={(e) => handleBlur('fullName', e.target.value)}
            className={cn(
              'h-12 rounded-xl',
              errors.fullName && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            required
          />
          {errors.fullName && (
            <p className="text-sm text-red-600" id="fullName-error">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Phone and Email */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <select
                className="h-12 w-24 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                defaultValue="+233"
              >
                <option value="+233">+233</option>
              </select>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="Phone number"
                value={addressData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={(e) => handleBlur('phone', e.target.value)}
                className={cn(
                  'h-12 flex-1 rounded-xl',
                  errors.phone && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                )}
                required
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600" id="phone-error">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-neutral-400">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="Your email"
              value={addressData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              className={cn(
                'h-12 rounded-xl',
                errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
            />
            {errors.email && (
              <p className="text-sm text-red-600" id="email-error">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Enter your street address"
            value={addressData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={(e) => handleBlur('address', e.target.value)}
            className={cn(
              'h-12 rounded-xl',
              errors.address && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            required
          />
          {errors.address && (
            <p className="text-sm text-red-600" id="address-error">
              {errors.address}
            </p>
          )}
        </div>

        {/* City and Region */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              City <span className="text-red-500">*</span>
            </Label>
            <select
              id="city"
              value={addressData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
            >
              {GHANA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <Label htmlFor="region" className="text-sm font-medium">
              Region <span className="text-red-500">*</span>
            </Label>
            <select
              id="region"
              value={addressData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
            >
              {GHANA_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Landmark */}
        <div className="space-y-2">
          <Label htmlFor="landmark" className="text-sm font-medium">
            Landmark <span className="text-neutral-400">(optional)</span>
          </Label>
          <Input
            id="landmark"
            type="text"
            placeholder="Nearby landmark for easier delivery"
            value={addressData.landmark || ''}
            onChange={(e) => handleChange('landmark', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-full px-8 py-6 text-base"
        >
          Back to Cart
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="rounded-full bg-teal-600 px-8 py-6 text-base hover:bg-teal-700 disabled:opacity-50"
        >
          Continue to Payment
        </Button>
      </div>

      {/* Mobile: Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white p-4 shadow-lg sm:hidden">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 rounded-full py-6"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1 rounded-full bg-teal-600 py-6 hover:bg-teal-700 disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
