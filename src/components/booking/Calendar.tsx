/**
 * Calendar Component
 * Month view calendar for date selection
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatDateToISO,
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
  addMonths,
  isPastDate,
  isToday,
} from '@/utils/dateTime';

interface CalendarProps {
  selectedDate?: string; // YYYY-MM-DD
  availableDates?: string[]; // Array of YYYY-MM-DD dates
  onDateSelect: (date: string) => void;
  className?: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({
  selectedDate,
  availableDates = [],
  onDateSelect,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const handlePreviousMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    const dateString = formatDateToISO(date);
    
    if (!isPastDate(dateString)) {
      onDateSelect(dateString);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, day: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDateClick(day);
    }
  };

  const isDateAvailable = (day: number) => {
    const date = new Date(year, month, day);
    const dateString = formatDateToISO(date);
    return availableDates.includes(dateString);
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(year, month, day);
    const dateString = formatDateToISO(date);
    return dateString === selectedDate;
  };

  const isDatePast = (day: number) => {
    const date = new Date(year, month, day);
    const dateString = formatDateToISO(date);
    return isPastDate(dateString);
  };

  const isDateToday = (day: number) => {
    const date = new Date(year, month, day);
    const dateString = formatDateToISO(date);
    return isToday(dateString);
  };

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-8 w-8"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <h3 className="text-lg font-semibold text-neutral-900">
          {getMonthName(currentMonth)}
        </h3>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day Labels */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-neutral-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isPast = isDatePast(day);
          const isSelected = isDateSelected(day);
          const hasAvailability = isDateAvailable(day);
          const isTodayDate = isDateToday(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              onKeyDown={(e) => handleKeyDown(e, day)}
              disabled={isPast}
              className={cn(
                'relative aspect-square rounded-lg text-sm font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2',
                isPast &&
                  'cursor-not-allowed text-neutral-300 opacity-40',
                !isPast && !isSelected &&
                  'text-neutral-700 hover:bg-neutral-100',
                isSelected &&
                  'bg-teal-600 text-white shadow-md hover:bg-teal-700',
                isTodayDate && !isSelected &&
                  'border-2 border-teal-600 font-semibold'
              )}
              aria-label={`Select ${day} ${getMonthName(currentMonth)}`}
              aria-pressed={isSelected}
            >
              {day}
              
              {/* Availability Indicator */}
              {hasAvailability && !isSelected && !isPast && (
                <span
                  className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-500"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-4 text-center text-sm text-neutral-600">
          <span className="font-medium text-teal-600">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  );
}
