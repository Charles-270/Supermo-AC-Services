/**
 * DateTimePicker Component
 * Step 2: Select date and time for service appointment
 */

import { useState, useEffect, useRef } from 'react';
import { Calendar } from './Calendar';
import { TimeSlotList } from './TimeSlotList';
import { Button } from '@/components/ui/button';
import type { TimeSlot } from '@/types/booking-flow';

interface DateTimePickerProps {
  selectedDate?: string;
  selectedTimeSlot?: TimeSlot;
  onDateSelect: (date: string) => void;
  onTimeSlotSelect: (slot: TimeSlot) => void;
  onBack: () => void;
  onNext: () => void;
}

// Mock function to generate available time slots
// In production, this would fetch from an API
function generateTimeSlots(date: string): TimeSlot[] {
  const selectedDate = new Date(date);
  const slots: TimeSlot[] = [];

  // Generate 3-hour time slots from 8 AM to 8 PM
  const startHour = 8;
  const endHour = 20;
  const slotDuration = 3;

  for (let hour = startHour; hour < endHour; hour += slotDuration) {
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(hour + slotDuration, 0, 0, 0);

    // Randomly mark some slots as unavailable for demo
    const available = Math.random() > 0.3;

    slots.push({
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      available,
    });
  }

  return slots;
}

// Mock function to get dates with availability
// In production, this would fetch from an API
function getAvailableDates(): string[] {
  const dates: string[] = [];
  const today = new Date();

  // Mark next 30 days as having availability (randomly)
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Randomly mark some dates as available
    if (Math.random() > 0.2) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
  }

  return dates;
}

export function DateTimePicker({
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  onBack,
  onNext,
}: DateTimePickerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableDates] = useState<string[]>(getAvailableDates());
  const timeSlotsRef = useRef<HTMLDivElement>(null);

  // Load time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate);
      setTimeSlots(slots);

      // Smooth scroll to time slots on mobile
      if (window.innerWidth <= 640 && timeSlotsRef.current) {
        setTimeout(() => {
          timeSlotsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 100);
      }
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  const canProceed = selectedDate && selectedTimeSlot;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
          Select Date & Time
        </h2>
        <p className="mt-2 text-neutral-600">
          Choose your preferred appointment date and time slot
        </p>
      </div>

      {/* Date & Time Selection */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        {/* Desktop: Two-pane layout */}
        <div className="hidden gap-8 lg:grid lg:grid-cols-2">
          {/* Calendar */}
          <div className="border-r border-neutral-200 pr-8">
            <Calendar
              selectedDate={selectedDate}
              availableDates={availableDates}
              onDateSelect={onDateSelect}
            />
          </div>

          {/* Time Slots */}
          <div className="pl-8">
            {selectedDate ? (
              <TimeSlotList
                timeSlots={timeSlots}
                selectedSlot={selectedTimeSlot}
                onSlotSelect={onTimeSlotSelect}
              />
            ) : (
              <div className="flex h-full items-center justify-center py-12 text-center">
                <p className="text-neutral-500">
                  Select a date to view available time slots
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="space-y-8 lg:hidden">
          {/* Calendar */}
          <Calendar
            selectedDate={selectedDate}
            availableDates={availableDates}
            onDateSelect={onDateSelect}
          />

          {/* Time Slots */}
          {selectedDate && (
            <div ref={timeSlotsRef} className="border-t border-neutral-200 pt-8">
              <TimeSlotList
                timeSlots={timeSlots}
                selectedSlot={selectedTimeSlot}
                onSlotSelect={onTimeSlotSelect}
              />
            </div>
          )}
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
          onClick={onNext}
          disabled={!canProceed}
          className="rounded-full bg-teal-600 px-8 py-6 text-base hover:bg-teal-700 disabled:opacity-50"
        >
          Set times
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
            onClick={onNext}
            disabled={!canProceed}
            className="flex-1 rounded-full bg-teal-600 py-6 hover:bg-teal-700 disabled:opacity-50"
          >
            Set times
          </Button>
        </div>
      </div>
    </div>
  );
}
