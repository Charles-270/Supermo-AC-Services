/**
 * CheckoutStepper Component
 * Visual progress indicator for the checkout flow
 * Reuses BookingStepper pattern for consistency
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type CheckoutStep = 1 | 2 | 3 | 4;

const CHECKOUT_STEP_LABELS: Record<CheckoutStep, string> = {
  1: 'Cart',
  2: 'Delivery',
  3: 'Payment',
  4: 'Review',
};

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  completedSteps: number[];
  className?: string;
}

export function CheckoutStepper({ currentStep, completedSteps, className }: CheckoutStepperProps) {
  const steps: CheckoutStep[] = [1, 2, 3, 4];

  const isStepCompleted = (step: CheckoutStep) => completedSteps.includes(step);
  const isStepActive = (step: CheckoutStep) => step === currentStep;
  const isStepInactive = (step: CheckoutStep) => step > currentStep && !isStepCompleted(step);

  return (
    <div
      className={cn('w-full', className)}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={4}
      aria-label={`Checkout progress: Step ${currentStep} of 4`}
    >
      {/* Desktop Stepper */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-1 items-center">
              {/* Step Node */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isStepCompleted(step) &&
                    'border-teal-600 bg-teal-600 text-white',
                    isStepActive(step) &&
                    'border-teal-600 bg-teal-600 text-white shadow-lg',
                    isStepInactive(step) &&
                    'border-neutral-300 bg-white text-neutral-400'
                  )}
                  aria-current={isStepActive(step) ? 'step' : undefined}
                >
                  {isStepCompleted(step) ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-semibold">{step}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium transition-colors',
                    (isStepActive(step) || isStepCompleted(step)) &&
                    'text-neutral-900',
                    isStepInactive(step) && 'text-neutral-400'
                  )}
                >
                  {CHECKOUT_STEP_LABELS[step]}
                </span>
              </div>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 flex-1 transition-colors',
                    isStepCompleted(step) ? 'bg-teal-600' : 'bg-neutral-300'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2',
                'border-teal-600 bg-teal-600 text-white'
              )}
            >
              {isStepCompleted(currentStep) ? (
                <Check className="h-5 w-5" aria-hidden="true" />
              ) : (
                <span className="text-sm font-semibold">{currentStep}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">
                Step {currentStep} of 4
              </p>
              <p className="text-sm font-semibold text-neutral-900">
                {CHECKOUT_STEP_LABELS[currentStep]}
              </p>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="flex gap-1">
            {steps.map((step) => (
              <div
                key={step}
                className={cn(
                  'h-1.5 w-8 rounded-full transition-colors',
                  step <= currentStep ? 'bg-teal-600' : 'bg-neutral-300'
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isStepActive(currentStep) &&
          `Now on step ${currentStep}: ${CHECKOUT_STEP_LABELS[currentStep]}`}
      </div>
    </div>
  );
}
