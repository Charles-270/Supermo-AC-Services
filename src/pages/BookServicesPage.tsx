/**
 * Book Services Page - Redesigned
 * Full-page booking flow with new UI components
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { createBooking } from '@/services/bookingService';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { ServiceCatalog } from '@/components/booking/ServiceCatalog';
import { DateTimePicker } from '@/components/booking/DateTimePicker';
import { CustomerDetailsForm } from '@/components/booking/CustomerDetailsForm';
import { Button } from '@/components/ui/button';
import type { ServiceType, BookingFormData } from '@/types/booking';
import { Loader2, CheckCircle, Menu } from 'lucide-react';
import type { Service, TimeSlot, BookingStep } from '@/types/booking-flow';
import { formatCurrency, formatDateTimeForDisplay } from '@/utils/dateTime';

export function BookServicesPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState<BookingStep>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Form state - using new types
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState(profile?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phoneNumber || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Accra');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!user || !profile || !selectedService || !selectedDate || !selectedTimeSlot) return;

    setError(null);
    setLoading(true);

    try {
      // Convert new types to existing backend format
      const serviceTypeMap: Record<string, ServiceType> = {
        'install': 'installation',
        'maint': 'maintenance',
        'repair': 'repair',
        'inspect': 'inspection',
      };

      // Determine time slot value from TimeSlot
      const timeSlotValue = determineTimeSlotValue(selectedTimeSlot);

      const formData: BookingFormData = {
        serviceType: serviceTypeMap[selectedService.id],
        servicePackage: 'basic',
        serviceDetails: {},
        preferredDate: new Date(selectedDate),
        preferredTimeSlot: timeSlotValue,
        address,
        city,
        locationNotes: notes,
        customerPhone,
      };

      await createBooking(formData, user.uid, customerName, customerEmail);
      setSuccess(true);
      setTimeout(() => {
        navigate('/customer/bookings');
      }, 2000);
    } catch (err) {
      setError((err as Error).message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine time slot value from TimeSlot object
  const determineTimeSlotValue = (slot: TimeSlot): 'morning' | 'afternoon' | 'evening' => {
    const startHour = new Date(slot.start).getHours();
    if (startHour < 12) return 'morning';
    if (startHour < 16) return 'afternoon';
    return 'evening';
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCompletedSteps([1]);
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
  };

  const handleDateTimeNext = () => {
    if (selectedDate && selectedTimeSlot) {
      setCompletedSteps([1, 2]);
      setStep(3);
    }
  };

  const handleDetailsNext = () => {
    setCompletedSteps([1, 2, 3]);
    setStep(4);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as BookingStep);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <CustomerSidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileNavOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    Book Appointment
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600">
                    Schedule your AC service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {success ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <CheckCircle className="h-20 w-20 text-green-500" />
              <h3 className="text-2xl font-semibold">Booking Confirmed!</h3>
              <p className="text-neutral-600 text-center">
                Redirecting to your bookings...
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Progress Stepper */}
              <BookingStepper
                currentStep={step}
                completedSteps={completedSteps}
              />

              {/* Step Content */}
              <div>
                {/* Step 1: Service Selection */}
                {step === 1 && (
                  <ServiceCatalog onServiceSelect={handleServiceSelect} />
                )}

                {/* Step 2: Date & Time Selection */}
                {step === 2 && selectedService && (
                  <DateTimePicker
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot || undefined}
                    onDateSelect={handleDateSelect}
                    onTimeSlotSelect={handleTimeSlotSelect}
                    onBack={handleBack}
                    onNext={handleDateTimeNext}
                  />
                )}

                {/* Step 3: Customer Details */}
                {step === 3 && selectedService && selectedDate && selectedTimeSlot && (
                  <CustomerDetailsForm
                    serviceName={selectedService.name}
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    customerName={customerName}
                    customerPhone={customerPhone}
                    customerEmail={customerEmail}
                    address={address}
                    city={city}
                    notes={notes}
                    onNameChange={setCustomerName}
                    onPhoneChange={setCustomerPhone}
                    onEmailChange={setCustomerEmail}
                    onAddressChange={setAddress}
                    onCityChange={setCity}
                    onNotesChange={setNotes}
                    onBack={handleBack}
                    onNext={handleDetailsNext}
                  />
                )}

                {/* Step 4: Review & Confirm */}
                {step === 4 && selectedService && selectedDate && selectedTimeSlot && (
                  <div className="mx-auto w-full max-w-3xl space-y-8">
                    {/* Header */}
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
                        Review & Confirm
                      </h2>
                    </div>

                    {/* Summary Card */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Booking Summary</h3>

                        <div className="space-y-4">
                          {/* Service */}
                          <div>
                            <p className="text-sm text-neutral-500">Service</p>
                            <p className="font-medium text-neutral-900">{selectedService.name}</p>
                          </div>

                          {/* Date & Time */}
                          <div>
                            <p className="text-sm text-neutral-500">Date & Time</p>
                            <p className="font-medium text-neutral-900">
                              {formatDateTimeForDisplay(selectedDate, selectedTimeSlot.start)}
                            </p>
                          </div>

                          {/* Customer */}
                          <div>
                            <p className="text-sm text-neutral-500">Customer</p>
                            <p className="font-medium text-neutral-900">{customerName}</p>
                            <p className="text-sm text-neutral-600">
                              {customerPhone} • {customerEmail}
                            </p>
                          </div>

                          {/* Location */}
                          <div>
                            <p className="text-sm text-neutral-500">Location</p>
                            <p className="font-medium text-neutral-900">
                              {address}, {city}
                            </p>
                          </div>

                          {/* Notes */}
                          {notes && (
                            <div>
                              <p className="text-sm text-neutral-500">Notes</p>
                              <p className="font-medium text-neutral-900">{notes}</p>
                            </div>
                          )}

                          {/* Cost */}
                          <div className="border-t pt-4">
                            <p className="text-sm text-neutral-500">Estimated Cost</p>
                            <p className="text-2xl font-bold text-cyan-500">
                              {formatCurrency(selectedService.priceFrom)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                          {error}
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={loading}
                        className="rounded-full px-8 py-6 text-base"
                      >
                        Back
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-full bg-teal-600 px-8 py-6 text-base hover:bg-teal-700"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Booking
                      </Button>
                    </div>

                    {/* Mobile: Sticky bottom action bar */}
                    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white p-4 shadow-lg sm:hidden">
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleBack}
                          disabled={loading}
                          className="flex-1 rounded-full py-6"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="flex-1 rounded-full bg-teal-600 py-6 hover:bg-teal-700"
                        >
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Confirm
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <CustomerSidebar
            variant="mobile"
            className="relative z-40 h-full w-72 max-w-[80%]"
            onClose={() => setIsMobileNavOpen(false)}
            onNavigate={() => setIsMobileNavOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
