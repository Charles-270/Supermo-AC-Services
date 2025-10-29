/**
 * Redesigned Multi-Step Booking Form
 * Step 1: Service Selection (with images)
 * Step 2: Date & Time Selection (calendar style)
 * Step 3: Customer Details
 * Step 4: Review & Confirm
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBooking } from '@/services/bookingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type {
  ServiceType,
  BookingFormData,
} from '@/types/booking';
import {
  GHANA_CITIES,
  SERVICE_BASE_PRICING,
} from '@/types/booking';
import { getCurrentPricing } from '@/services/pricingService';
import { Loader2, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Service data with images and pricing - Using dynamic pricing from admin settings
const getServices = (pricing: Record<string, number>) => [
  {
    type: 'installation' as ServiceType,
    title: 'AC Installation',
    description: 'Install new air conditioning units in your property.',
    price: pricing.installation || SERVICE_BASE_PRICING.installation,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  },
  {
    type: 'maintenance' as ServiceType,
    title: 'AC Maintenance',
    description: 'Regular servicing to keep your AC running efficiently.',
    price: pricing.maintenance || SERVICE_BASE_PRICING.maintenance,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
  },
  {
    type: 'repair' as ServiceType,
    title: 'AC Repair',
    description: 'Fix issues and restore AC functionality.',
    price: pricing.repair || SERVICE_BASE_PRICING.repair,
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
  },
  {
    type: 'inspection' as ServiceType,
    title: 'AC Inspection',
    description: 'Professional assessment of AC system condition.',
    price: pricing.inspection || SERVICE_BASE_PRICING.inspection,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
  },
];

// Time slots for booking
const TIME_SLOTS = [
  { value: 'morning', label: '10:00 am - 1:00 pm' },
  { value: 'afternoon', label: '03:00 pm - 05:00 pm' },
  { value: 'evening', label: '04:00 pm - 06:00 pm' },
];

export function BookingFormRedesigned({ open, onOpenChange, onSuccess }: BookingFormProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [customerName, setCustomerName] = useState(profile?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phoneNumber || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Accra');
  const [notes, setNotes] = useState('');
  const [dynamicPricing, setDynamicPricing] = useState<Record<string, number>>({});

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load dynamic pricing on component mount
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const pricing = await getCurrentPricing();
        setDynamicPricing({
          installation: pricing.installation,
          maintenance: pricing.maintenance,
          repair: pricing.repair,
          inspection: pricing.inspection,
        });
      } catch (error) {
        console.error('Error loading pricing:', error);
        // Fallback to default pricing
        setDynamicPricing({
          installation: SERVICE_BASE_PRICING.installation,
          maintenance: SERVICE_BASE_PRICING.maintenance,
          repair: SERVICE_BASE_PRICING.repair,
          inspection: SERVICE_BASE_PRICING.inspection,
        });
      }
    };

    void loadPricing();
  }, []);

  const handleSubmit = async () => {
    if (!user || !profile || !selectedService || !selectedDate) return;

    setError(null);
    setLoading(true);

    try {
      const formData: BookingFormData = {
        serviceType: selectedService,
        servicePackage: 'basic', // Default package, pricing comes from serviceType
        serviceDetails: {},
        preferredDate: selectedDate,
        preferredTimeSlot: selectedTimeSlot as 'morning' | 'afternoon' | 'evening',
        address,
        city,
        locationNotes: notes,
        customerPhone,
      };

      await createBooking(formData, user.uid, customerName, customerEmail);
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        resetForm();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError((err as Error).message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTimeSlot('');
    setSearchQuery('');
    setNotes('');
    setError(null);
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const SERVICES = getServices(dynamicPricing);
  
  const filteredServices = SERVICES.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const selectedServiceData = SERVICES.find(s => s.type === selectedService);

  // Progress steps
  const steps = ['Service', 'Select Date', 'Details', 'Done'];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) resetForm(); }}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Book Appointment</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle className="h-20 w-20 text-green-500" />
            <h3 className="text-2xl font-semibold">Booking Confirmed!</h3>
            <p className="text-neutral-600 text-center">
              We'll send you a confirmation email shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Stepper */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === step;
                const isCompleted = stepNumber < step;

                return (
                  <div key={label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                          isActive && 'bg-teal-700 text-white',
                          isCompleted && 'bg-teal-700 text-white',
                          !isActive && !isCompleted && 'bg-neutral-200 text-neutral-500'
                        )}
                      >
                        {stepNumber}
                      </div>
                      <span
                        className={cn(
                          'text-sm mt-2 font-medium',
                          isActive && 'text-neutral-900',
                          !isActive && 'text-neutral-400'
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'flex-1 h-1 mx-4',
                          isCompleted ? 'bg-teal-700' : 'bg-neutral-200'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Choose a Service</h2>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input
                      type="search"
                      placeholder="Search for a service (e.g., AC repair)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 py-6 rounded-full border-neutral-300"
                    />
                  </div>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {filteredServices.map((service) => (
                    <div
                      key={service.type}
                      onClick={() => setSelectedService(service.type)}
                      className={cn(
                        'bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300',
                        'hover:-translate-y-1 hover:shadow-2xl',
                        selectedService === service.type && 'ring-4 ring-cyan-500'
                      )}
                    >
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-56 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                          {service.title}
                        </h3>
                        <p className="text-neutral-600 text-sm mb-6">
                          {service.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-base font-medium text-neutral-600">
                            From{' '}
                            <span className="text-cyan-500 font-semibold text-lg">
                              GHC{service.price.toFixed(2)}
                            </span>
                          </p>
                          <Button
                            className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedService(service.type);
                              nextStep();
                            }}
                          >
                            Book Service
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-neutral-600">
                    Below you can find a list of available time slots. Click on a time slot to proceed with booking.
                  </p>
                </div>

                {/* Calendar */}
                <div className="bg-neutral-50 rounded-lg p-6">
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-neutral-700">Appointment date</Label>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-neutral-100 rounded"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="font-semibold">{monthName}</span>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-neutral-100 rounded"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                        <div key={`empty-${index}`} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const isSelected = isDateSelected(day);
                        const isPast = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0));

                        return (
                          <button
                            key={day}
                            onClick={() => !isPast && handleDateSelect(day)}
                            disabled={isPast}
                            className={cn(
                              'aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
                              isSelected && 'bg-teal-700 text-white',
                              !isSelected && !isPast && 'hover:bg-neutral-100',
                              isPast && 'text-neutral-300 cursor-not-allowed'
                            )}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {selectedDate && (
                      <div className="text-sm text-neutral-600 flex items-center gap-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                        {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Select Time Slot</Label>
                    <div className="space-y-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => setSelectedTimeSlot(slot.value)}
                          className={cn(
                            'w-full p-4 rounded-lg border-2 text-left transition-colors',
                            selectedTimeSlot === slot.value
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-neutral-200 hover:border-neutral-300'
                          )}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Customer Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-neutral-600">
                    You selected a booking for {selectedServiceData?.title} at {selectedTimeSlot && TIME_SLOTS.find(s => s.value === selectedTimeSlot)?.label} on{' '}
                    {selectedDate?.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}.
                    Please provide your details in the form below to proceed with booking.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="Type your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Phone number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address</Label>
                    <Input
                      id="address"
                      placeholder="Street address, building name, etc."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <select
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    >
                      {GHANA_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Say something..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Booking Summary</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-neutral-500">Service</p>
                      <p className="font-medium">{selectedServiceData?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Date & Time</p>
                      <p className="font-medium">
                        {selectedDate?.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} -{' '}
                        {TIME_SLOTS.find(s => s.value === selectedTimeSlot)?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Customer</p>
                      <p className="font-medium">{customerName}</p>
                      <p className="text-sm text-neutral-600">{customerPhone} • {customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Location</p>
                      <p className="font-medium">{address}, {city}</p>
                    </div>
                    {notes && (
                      <div>
                        <p className="text-sm text-neutral-500">Notes</p>
                        <p className="font-medium">{notes}</p>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <p className="text-sm text-neutral-500">Estimated Cost</p>
                      <p className="text-2xl font-bold text-cyan-500">
                        GHC{selectedServiceData?.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={loading}
                  className="rounded-full px-8"
                >
                  Back
                </Button>
              )}
              <div className="ml-auto">
                {step < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={
                      (step === 1 && !selectedService) ||
                      (step === 2 && (!selectedDate || !selectedTimeSlot)) ||
                      (step === 3 && (!customerName || !customerPhone || !customerEmail || !address))
                    }
                    className="bg-teal-700 hover:bg-teal-800 text-white rounded-full px-8"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-teal-700 hover:bg-teal-800 text-white rounded-full px-8"
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirm Booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
