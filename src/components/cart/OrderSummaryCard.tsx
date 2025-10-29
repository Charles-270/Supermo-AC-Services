/**
 * Order Summary Card Component
 * Displays order totals and checkout button
 */

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderSummaryCardProps {
  subtotal: number;
  tax: number;
  delivery: number;
  total: number;
  onCheckout: () => void;
  loading?: boolean;
}

export function OrderSummaryCard({
  subtotal,
  tax,
  delivery,
  total,
  onCheckout,
  loading = false,
}: OrderSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">
        Order Summary
      </h2>

      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Subtotal</span>
          <span className="font-medium text-neutral-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Tax (12.5%)</span>
          <span className="font-medium text-neutral-900">
            {formatCurrency(tax)}
          </span>
        </div>

        {/* Delivery */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">Delivery</span>
          <span className="font-medium text-neutral-900">
            {formatCurrency(delivery)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-neutral-900">Total</span>
            <span className="text-2xl font-bold text-teal-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-teal-600 h-12 text-base hover:bg-teal-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Proceed to Checkout'
        )}
      </Button>

      {/* Additional Info */}
      <p className="mt-4 text-center text-xs text-neutral-500">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
}
