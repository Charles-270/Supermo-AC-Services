/**
 * Order Success Component
 * Success screen after order placement
 */

import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderSuccessProps {
  orderNumber: string;
  total: number;
  onViewOrder: () => void;
  onContinueShopping: () => void;
}

export function OrderSuccess({
  orderNumber,
  total,
  onViewOrder,
  onContinueShopping,
}: OrderSuccessProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {/* Success Icon and Message */}
      <div className="text-center">
        <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Order Placed Successfully!
        </h2>
        <p className="text-neutral-600">
          Thank you for your purchase. We'll send you a confirmation email shortly.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-6">
          {/* Order Number */}
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-neutral-900">{orderNumber}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-200" />

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-neutral-600">
              <Package className="h-5 w-5" />
              <span className="text-sm">Your order is being processed</span>
            </div>

            <div className="rounded-lg bg-neutral-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Total Amount</span>
                <span className="text-xl font-bold text-teal-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="rounded-lg bg-teal-50 border border-teal-200 p-4">
            <h3 className="font-semibold text-teal-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-teal-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">•</span>
                <span>You'll receive an order confirmation email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">•</span>
                <span>We'll notify you when your order ships</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">•</span>
                <span>Track your order status in "My Orders"</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button
          onClick={onViewOrder}
          className="rounded-xl bg-teal-600 px-8 py-6 text-base hover:bg-teal-700"
        >
          <Package className="mr-2 h-5 w-5" />
          View Order
        </Button>
        <Button
          onClick={onContinueShopping}
          variant="outline"
          className="rounded-xl px-8 py-6 text-base"
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
