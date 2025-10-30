/**
 * Order Review Component
 * Final review before placing order
 *
 * Updated October 2025:
 * - Reflect true pricing model (items, installation, shipping)
 * - Support async order submission
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Package, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '@/types/product';
import { resolveProductPricing } from '@/utils/pricing';

interface AddressData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  landmark?: string;
}

interface OrderReviewProps {
  cart: CartItem[];
  addressData: AddressData;
  paymentMethod: string;
  itemsTotal: number;
  installationFee: number;
  shippingFee: number;
  total: number;
  onBack: () => void;
  onPlaceOrder: () => Promise<void>;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  'card': 'Credit/Debit Card',
  'mobile-money': 'Mobile Money',
  'bank-transfer': 'Bank Transfer',
};

export function OrderReview({
  cart,
  addressData,
  paymentMethod,
  itemsTotal,
  installationFee,
  shippingFee,
  total,
  onBack,
  onPlaceOrder,
}: OrderReviewProps) {
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      await onPlaceOrder();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
          Review & Confirm
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Please review your order before placing it
        </p>
      </div>

      {/* Summary Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Order Summary</h3>

          {/* Delivery Information */}
          <div>
            <p className="text-sm text-neutral-500 mb-2">Delivery Information</p>
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="font-medium text-neutral-900">{addressData.fullName}</p>
              <p className="text-sm text-neutral-600 mt-1">
                {addressData.phone} • {addressData.email}
              </p>
              <p className="text-sm text-neutral-600 mt-2">
                {addressData.address}, {addressData.city}
              </p>
              <p className="text-sm text-neutral-600">
                {addressData.region}
              </p>
              {addressData.landmark && (
                <p className="text-sm text-neutral-500 italic mt-1">
                  Landmark: {addressData.landmark}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-sm text-neutral-500 mb-2">Payment Method</p>
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="font-medium text-neutral-900">
                {PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <p className="text-sm text-neutral-500 mb-3">
              Items ({cart.length})
            </p>
            <div className="space-y-3">
              {cart.map((item) => {
                const pricing = resolveProductPricing(item.product);
                const lineTotal = pricing.totalPrice * item.quantity;

                return (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-neutral-600">
                        Qty: {item.quantity} • {formatCurrency(pricing.totalPrice)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(lineTotal)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Items Total</span>
              <span className="font-medium">{formatCurrency(itemsTotal)}</span>
            </div>
            {installationFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Installation</span>
                <span className="font-medium">{formatCurrency(installationFee)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Shipping ({addressData.region})</span>
              <span className="font-medium">{formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-teal-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="rounded-full px-8 py-6 text-base"
        >
          Back
        </Button>

        <Button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="rounded-full bg-teal-600 px-8 py-6 text-base hover:bg-teal-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </div>

      {/* Mobile: Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white p-4 shadow-lg sm:hidden">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="flex-1 rounded-full py-6"
          >
            Back
          </Button>
          <Button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="flex-1 rounded-full bg-teal-600 py-6 hover:bg-teal-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
