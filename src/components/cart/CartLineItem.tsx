/**
 * Cart Line Item Component
 * Displays individual cart item with quantity controls
 */

import { Button } from '@/components/ui/button';
import { Plus, Minus, X, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '@/types/product';
import { resolveProductPricing } from '@/utils/pricing';
import { useState } from 'react';

interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartLineItem({ item, onUpdateQuantity, onRemove }: CartLineItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const pricing = resolveProductPricing(item.product);
  const lineTotal = pricing.totalPrice * item.quantity;

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.product.id, item.quantity + 1);
  };

  const handleRemove = () => {
    onRemove(item.product.id);
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-50 sm:h-24 sm:w-24">
          {item.product.images && item.product.images.length > 0 && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-neutral-300 border-t-teal-500" />
                </div>
              )}
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                className={`h-full w-full object-cover ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-neutral-300" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 line-clamp-2">
                  {item.product.name}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {item.product.specifications.brand}
                  {item.product.specifications.capacity && ` • ${item.product.specifications.capacity}`}
                </p>
                {item.installationRequired && (
                  <p className="mt-1 text-xs text-teal-600 font-medium">
                    Installation included
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                aria-label="Remove item"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quantity and Price */}
          <div className="flex items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={item.quantity <= 1}
                className="h-8 w-8 rounded-lg"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                className="h-8 w-8 rounded-lg"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-xs text-neutral-500">
                {formatCurrency(pricing.totalPrice)} each
              </p>
              <p className="text-lg font-semibold text-neutral-900">
                {formatCurrency(lineTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
