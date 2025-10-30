/**
 * Payment Method Selector Component
 * Payment method selection with card-style radio tiles
 *
 * Updated October 2025:
 * - Align payment options with supported Paystack channels
 * - Removed manual card/mobile money inputs (handled securely by Paystack widget)
 */

import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay securely with your Visa or Mastercard',
    icon: CreditCard,
  },
  {
    id: 'mobile-money',
    name: 'Mobile Money',
    description: 'MTN, Vodafone, AirtelTigo via Paystack',
    icon: Smartphone,
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Pay via bank transfer with instant verification',
    icon: Building2,
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  onBack,
  onNext,
}: PaymentMethodSelectorProps) {
  const handleNext = () => {
    if (!selectedMethod) return;
    onNext();
  };

  const isFormValid = () => Boolean(selectedMethod);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
          Payment Method
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Choose how you’d like to complete your payment
        </p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <div key={method.id}>
              {/* Payment Method Tile */}
              <button
                onClick={() => onSelectMethod(method.id)}
                className={cn(
                  'w-full rounded-xl border-2 p-4 text-left transition-all',
                  'hover:border-neutral-400',
                  isSelected
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-neutral-300 bg-white'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Radio Circle */}
                  <div
                    className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
                      isSelected
                        ? 'border-teal-600 bg-teal-600'
                        : 'border-neutral-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>

                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      isSelected ? 'bg-teal-100 text-teal-600' : 'bg-neutral-100 text-neutral-600'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Method Info */}
                  <div className="flex-1">
                    <p className="text-base font-semibold text-neutral-900">
                      {method.name}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {method.description}
                    </p>
                  </div>
                </div>
              </button>

              {method.id === 'bank-transfer' && isSelected && (
                <div className="mt-4 space-y-2 rounded-xl border border-teal-100 bg-teal-50/70 p-4 text-sm text-neutral-600">
                  <p className="font-medium text-neutral-900">How bank transfer works</p>
                  <p>
                    We’ll display Paystack bank transfer instructions during checkout so you can
                    complete payment securely from your banking app.
                  </p>
                </div>
              )}
            </div>
          );
        })}
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
          onClick={handleNext}
          disabled={!isFormValid()}
          className="rounded-full bg-teal-600 px-8 py-6 text-base hover:bg-teal-700 disabled:opacity-50"
        >
          Review Order
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
            onClick={handleNext}
            disabled={!isFormValid()}
            className="flex-1 rounded-full bg-teal-600 py-6 hover:bg-teal-700 disabled:opacity-50"
          >
            Review
          </Button>
        </div>
      </div>
    </div>
  );
}
