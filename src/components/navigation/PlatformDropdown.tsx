/**
 * Platform Dropdown Component
 * Dropdown menu for selecting user platform/role
 */

import { useState, useRef, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/material-icon';
import { USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS, type UserRole } from '@/types/user';

interface PlatformDropdownProps {
  onSelectPlatform: (role: UserRole) => void;
}

export function PlatformDropdown({ onSelectPlatform }: PlatformDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const platforms: UserRole[] = ['customer', 'technician', 'supplier', 'trainee', 'admin'];

  const handleSelect = (role: UserRole) => {
    // Clear any pending timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    setIsOpen(false);
    onSelectPlatform(role);
  };

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Add a delay before closing the dropdown
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300); // 300ms delay - gives user time to move mouse to dropdown
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex h-10 items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="inline-flex h-full items-center gap-1.5 text-base font-medium leading-none text-text-light transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-text-dark"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Platform</span>
        <MaterialIcon icon={isOpen ? 'expand_less' : 'expand_more'} size="sm" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card-light dark:bg-card-dark rounded-lg shadow-2xl border border-border-light dark:border-border-dark z-50 py-2">
          {platforms.map((role) => (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-text-light dark:text-text-dark">
                  {USER_ROLE_LABELS[role]}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {USER_ROLE_DESCRIPTIONS[role]}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
