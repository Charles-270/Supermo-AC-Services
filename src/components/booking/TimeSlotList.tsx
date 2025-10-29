/**
 * TimeSlotList Component
 * Displays available time slots for a selected date
 */

import { cn } from '@/lib/utils';
import { formatTimeSlot } from '@/utils/dateTime';
import type { TimeSlot } from '@/types/booking-flow';

interface TimeSlotListProps {
  timeSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
  onSlotSelect: (slot: TimeSlot) => void;
  className?: string;
}

export function TimeSlotList({
  timeSlots,
  selectedSlot,
  onSlotSelect,
  className,
}: TimeSlotListProps) {
  const isSlotSelected = (slot: TimeSlot) => {
    if (!selectedSlot) return false;
    return slot.start === selectedSlot.start && slot.end === selectedSlot.end;
  };

  if (timeSlots.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <p className="text-neutral-500">
          No available time slots for this date.
        </p>
        <p className="mt-2 text-sm text-neutral-400">
          Please select another date.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium text-neutral-700">
        Available Time Slots
      </h4>

      <div className="space-y-2">
        {timeSlots.map((slot, index) => {
          const isSelected = isSlotSelected(slot);
          const isAvailable = slot.available;

          return (
            <button
              key={`${slot.start}-${index}`}
              type="button"
              onClick={() => isAvailable && onSlotSelect(slot)}
              disabled={!isAvailable}
              className={cn(
                'w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2',
                isAvailable && !isSelected &&
                  'border-neutral-200 bg-white text-neutral-700 hover:border-cyan-400 hover:bg-cyan-50',
                isSelected &&
                  'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm',
                !isAvailable &&
                  'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 opacity-50'
              )}
              aria-label={`Select time slot ${formatTimeSlot(slot.start, slot.end)}`}
              aria-pressed={isSelected}
              aria-disabled={!isAvailable}
            >
              <div className="flex items-center justify-between">
                <span>{formatTimeSlot(slot.start, slot.end)}</span>
                {isSelected && (
                  <span className="text-xs font-semibold text-cyan-600">
                    Selected
                  </span>
                )}
                {!isAvailable && (
                  <span className="text-xs text-neutral-400">
                    Unavailable
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
