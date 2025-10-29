/**
 * Payment Method Selector Component
 * Payment method selection with card-style radio tiles
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CreditCard, Smartphone, Wallet, Check } from 'lucide-react';
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
    description: 'Pay securely with your card',
    icon: CreditCard,
    hasAdditionalFields: true,
  },
  {
    id: 'mobile-money',
    name: 'Mobile Money',
    description: 'MTN, Vodafone, AirtelTigo',
    icon: Smartphone,
    hasAdditionalFields: true,
  },
  {
    id: 'cash-on-delivery',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: Wallet,
    hasAdditionalFields: false,
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  onBack,
  onNext,
}: PaymentMethodSelectorProps) {
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const handleNext = () => {
    if (!selectedMethod) return;

    // Validate additional fields if needed
    if (selectedMethod === 'mobile-money' && !mobileMoneyNumber) {
      return;
    }
    if (selectedMethod === 'card' && !cardNumber) {
      return;
    }

    onNext();
  };

  const isFormValid = () => {
    if (!selectedMethod) return false;
    if (selectedMethod === 'mobile-money' && !mobileMoneyNumber) return false;
    if (selectedMethod === 'card' && !cardNumber) return false;
    return true;
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
          Payment Method
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Choose how you'd like to pay
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
                    <p className="font-semibold text-neutral-900">{method.name}</p>
                    <p className="text-sm text-neutral-600">{method.description}</p>
                  </div>
                </div>
              </button>

              {/* Additional Fields (Accordion) */}
              {isSelected && method.hasAdditionalFields && (
                <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
                  {method.id === 'mobile-money' && (
                    <div className="space-y-2">
                      <Label htmlFor="mobileMoneyNumber" className="text-sm font-medium">
                        Mobile Money Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <select
                          className="h-12 w-24 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
                          defaultValue="+233"
                        >
                          <option value="+233">+233</option>
                        </select>
                        <Input
                          id="mobileMoneyNumber"
                          type="tel"
                          inputMode="tel"
                          placeholder="Enter mobile money number"
                          value={mobileMoneyNumber}
                          onChange={(e) => setMobileMoneyNumber(e.target.value)}
                          className="h-12 flex-1 rounded-xl"
                          required
                        />
                      </div>
                      <p className="text-xs text-neutral-500">
                        You'll receive a prompt to authorize payment
                      </p>
                    </div>
                  )}

                  {method.id === 'card' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-sm font-medium">
                          Card Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="h-12 rounded-xl"
                          maxLength={19}
                          required
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate" className="text-sm font-medium">
                            Expiry Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="expiryDate"
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            className="h-12 rounded-xl"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv" className="text-sm font-medium">
                            CVV <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="cvv"
                            type="text"
                            inputMode="numeric"
                            placeholder="123"
                            className="h-12 rounded-xl"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  )}
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
