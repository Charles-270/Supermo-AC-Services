/**
 * Shopping Cart Page - Redesigned
 * View and manage cart items with sidebar navigation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ShoppingBag, Package, Menu } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

import { formatCurrency } from '@/lib/utils';
import { INSTALLATION_FEES, SHIPPING_FEES } from '@/types/product';
import {
  PLATFORM_MAINTENANCE_FEE_RATE,
  PLATFORM_SERVICE_FEE_RATE,
  currencyRound,
  resolveProductPricing,
} from '@/utils/pricing';

export function CartRedesigned() {
  const navigate = useNavigate();

  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const feeTotals = cart.reduce(
    (acc, item) => {
      const pricing = resolveProductPricing(item.product);
      acc.base += pricing.basePrice * item.quantity;
      acc.service += pricing.serviceFee * item.quantity;
      acc.maintenance += pricing.maintenanceFee * item.quantity;
      acc.total += pricing.totalPrice * item.quantity;
      return acc;
    },
    { base: 0, service: 0, maintenance: 0, total: 0 }
  );

  const supplierSubtotal = currencyRound(feeTotals.base);
  const serviceFeeTotal = currencyRound(feeTotals.service);
  const maintenanceFeeTotal = currencyRound(feeTotals.maintenance);
  const itemsTotal = currencyRound(feeTotals.total);

  // Calculate installation fees
  const installationFees = cart.reduce((total, item) => {
    if (item.installationRequired) {
      const fee = INSTALLATION_FEES[item.product.category] || 0;
      return total + fee;
    }
    return total;
  }, 0);

  // Default shipping (Greater Accra)
  const shippingFee = SHIPPING_FEES['Greater Accra'];

  const grandTotal = currencyRound(itemsTotal + installationFees + shippingFee);
  const serviceFeeLabel = `Service fee (${Math.round(PLATFORM_SERVICE_FEE_RATE * 100)}%)`;
  const maintenanceFeeLabel = `Maintenance fee (${Math.round(
    PLATFORM_MAINTENANCE_FEE_RATE * 100
  )}%)`;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="relative min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <CustomerSidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileNavOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">Shopping Cart</h1>
                  <p className="mt-1 text-sm text-neutral-600">
                    {cart.length === 0
                      ? 'Your cart is empty'
                      : `${cart.length} ${cart.length === 1 ? 'item' : 'items'} in your cart`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {cart.length === 0 ? (
            <div className="max-w-md mx-auto">
              <Card className="p-12 text-center">
                <ShoppingBag className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
                <p className="text-neutral-600 mb-6">
                  Add some products to get started!
                </p>
                <Button 
                  size="lg"
                  className="bg-teal-700 hover:bg-teal-800 text-white"
                  onClick={() => navigate('/products')}
                >
                  Browse Products
                </Button>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => {
                  const pricing = resolveProductPricing(item.product);
                  return (
                    <Card key={item.product.id}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-10 w-10 text-neutral-300" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <button
                                  onClick={() => navigate(`/products/${item.product.id}`)}
                                  className="text-left"
                                >
                                  <h3 className="font-semibold text-neutral-900 hover:text-cyan-600 transition-colors">
                                    {item.product.name}
                                  </h3>
                                </button>
                                <p className="text-sm text-neutral-600 mt-1">
                                  {item.product.specifications.brand}
                                  {item.product.specifications.capacity &&
                                    ` • ${item.product.specifications.capacity}`}
                                </p>
                                <p className="text-lg font-semibold text-cyan-500 mt-2">
                                  {formatCurrency(pricing.totalPrice)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>

                            {/* Installation Badge */}
                            {item.installationRequired && (
                              <Badge variant="secondary" className="mt-2">
                                Professional Installation Included
                              </Badge>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 mt-4">
                              <span className="text-sm text-neutral-600">Quantity:</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stockQuantity}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="text-sm text-neutral-500">
                                ({item.product.stockQuantity} available)
                              </span>
                            </div>

                            {/* Item Subtotal */}
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-sm text-neutral-600">Item Total:</span>
                              <span className="text-lg font-semibold text-neutral-900">
                                {formatCurrency(pricing.totalPrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Clear Cart Button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={clearCart}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pricing Breakdown */}
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Supplier subtotal</span>
                      <span className="font-medium">{formatCurrency(supplierSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">{serviceFeeLabel}</span>
                      <span className="font-medium">{formatCurrency(serviceFeeTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">{maintenanceFeeLabel}</span>
                      <span className="font-medium">{formatCurrency(maintenanceFeeTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-neutral-600">
                        Items ({totalQuantity})
                      </span>
                      <span className="font-medium">{formatCurrency(itemsTotal)}</span>
                    </div>

                    {/* Installation Fees */}
                    {installationFees > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Installation</span>
                        <span className="font-medium">{formatCurrency(installationFees)}</span>
                      </div>
                    )}

                    {/* Shipping */}
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Shipping (Greater Accra)</span>
                      <span className="font-medium">{formatCurrency(shippingFee)}</span>
                    </div>

                    <div className="border-t border-neutral-200 pt-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-cyan-500">
                          {formatCurrency(grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-cyan-50 rounded-lg p-3 text-sm text-cyan-700">
                      <p className="font-medium mb-1">Free Delivery in Greater Accra!</p>
                      <p className="text-xs">Estimated delivery: 1-3 business days</p>
                    </div>
                  </CardContent>

                  <CardFooter className="flex-col gap-3">
                    <Button 
                      size="lg" 
                      className="w-full bg-teal-700 hover:bg-teal-800 text-white" 
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      onClick={() => navigate('/products')}
                    >
                      Continue Shopping
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <CustomerSidebar
            variant="mobile"
            className="relative z-40 h-full w-72 max-w-[80%]"
            onClose={() => setIsMobileNavOpen(false)}
            onNavigate={() => setIsMobileNavOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
