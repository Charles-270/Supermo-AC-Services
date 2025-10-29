/**
 * CustomerDetailsForm Component
 * Step 3: Collect customer contact and location information
 * Integrates with existing booking system data structures
 */

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GHANA_CITIES } from '@/types/booking';
import { cn } from '@/lib/utils';
import { formatDateForDisplay, formatTimeSlot } from '@/utils/dateTime';

interface CustomerDetailsFormProps {
  // Service and date/time info for summary
  serviceName: string;
  selectedDate: string; // YYYY-MM-DD
  selectedTimeSlot: { start: string; end: string };
  
  // Form values
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  notes: string;
  
  // Handlers
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CustomerDetailsForm({
  serviceName,
  selectedDate,
  selectedTimeSlot,
  customerName,
  customerPhone,
  customerEmail,
  address,
  city,
  notes,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onAddressChange,
  onCityChange,
  onNotesChange,
  onBack,
  onNext,
}: CustomerDetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus first input on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Validation
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
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

  const handleBlur = (field: string, value: string) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
  };

  const handleSubmit = () => {
    // Validate all required fields
    const newErrors: Record<string, string> = {};
    
    const nameError = validateField('name', customerName);
    if (nameError) newErrors.name = nameError;
    
    const phoneError = validateField('phone', customerPhone);
    if (phoneError) newErrors.phone = phoneError;
    
    const emailError = validateField('email', customerEmail);
    if (emailError) newErrors.email = emailError;
    
    const addressError = validateField('address', address);
    if (addressError) newErrors.address = addressError;

    setErrors(newErrors);

    // If no errors, proceed
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const isFormValid = 
    customerName.trim().length >= 2 &&
    customerPhone.trim().length >= 9 &&
    (!customerEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) &&
    address.trim().length >= 10;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
          Enter Details
        </h2>
      </div>

      {/* Selection Summary */}
      <div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
        You selected {serviceName} on{' '}
        <span className="font-medium text-neutral-900">
          {formatDateForDisplay(selectedDate)}
        </span>{' '}
        at{' '}
        <span className="font-medium text-neutral-900">
          {formatTimeSlot(selectedTimeSlot.start, selectedTimeSlot.end)}
        </span>
        . Provide your details to proceed.
      </div>

      {/* Form */}
      <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full name <span className="text-red-500">*</span>
          </Label>
          <Input
            ref={nameInputRef}
            id="name"
            type="text"
            placeholder="Type your name"
            value={customerName}
            onChange={(e) => {
              onNameChange(e.target.value);
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: '' }));
              }
            }}
            onBlur={(e) => handleBlur('name', e.target.value)}
            className={cn(
              'h-12 rounded-xl',
              errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            required
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Phone and Email */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <select
                className="h-12 w-24 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                defaultValue="+233"
              >
                <option value="+233">+233</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="Phone number"
                value={customerPhone}
                onChange={(e) => {
                  onPhoneChange(e.target.value);
                  if (errors.phone) {
                    setErrors(prev => ({ ...prev, phone: '' }));
                  }
                }}
                onBlur={(e) => handleBlur('phone', e.target.value)}
                className={cn(
                  'h-12 flex-1 rounded-xl',
                  errors.phone && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                )}
                required
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
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
              value={customerEmail}
              onChange={(e) => {
                onEmailChange(e.target.value);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              onBlur={(e) => handleBlur('email', e.target.value)}
              className={cn(
                'h-12 rounded-xl',
                errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Address/Location <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => {
              onAddressChange(e.target.value);
              if (errors.address) {
                setErrors(prev => ({ ...prev, address: '' }));
              }
            }}
            onBlur={(e) => handleBlur('address', e.target.value)}
            className={cn(
              'h-12 rounded-xl',
              errors.address && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            required
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            City <span className="text-red-500">*</span>
          </Label>
          <select
            id="city"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm"
          >
            {GHANA_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes <span className="text-neutral-400">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Say something..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            maxLength={500}
            className="rounded-xl"
          />
          <p className="text-xs text-neutral-500">
            {notes.length}/500 characters
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-full px-8 py-6 text-base"
        >
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="rounded-full bg-teal-600 px-8 py-6 text-base hover:bg-teal-700 disabled:opacity-50"
        >
          Next
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
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
