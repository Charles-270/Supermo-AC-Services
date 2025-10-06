/**
 * Shopping Cart Page
 * View and manage cart items before checkout
 */

import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import { INSTALLATION_FEES, SHIPPING_FEES } from '@/types/product';

export function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const itemsTotal = getCartTotal();

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

  const grandTotal = itemsTotal + installationFees + shippingFee;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-cool">
        <header className="bg-white border-b border-neutral-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link to="/products">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-neutral-900">Shopping Cart</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="max-w-md mx-auto p-8 text-center">
            <ShoppingBag className="h-20 w-20 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
            <p className="text-neutral-600 mb-6">
              Add some products to get started!
            </p>
            <Link to="/products">
              <Button size="lg">
                Browse Products
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/products">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Shopping Cart</h1>
                <p className="text-sm text-neutral-600">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={clearCart} size="sm">
              Clear Cart
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-4">
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
                          <Link to={`/products/${item.product.id}`}>
                            <h3 className="font-semibold text-neutral-900 hover:text-primary-600 transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-neutral-600 mt-1">
                            {item.product.specifications.brand}
                            {item.product.specifications.capacity &&
                              ` • ${item.product.specifications.capacity}`}
                          </p>
                          <p className="text-lg font-semibold text-primary-600 mt-2">
                            {formatCurrency(item.product.price)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-error-600 hover:text-error-700 hover:bg-error-50"
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
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Total */}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">
                    Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})
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
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-primary-50 rounded-lg p-3 text-sm text-primary-700">
                  <p className="font-medium mb-1">Free Delivery in Greater Accra!</p>
                  <p className="text-xs">Estimated delivery: 1-3 business days</p>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-3">
                <Button size="lg" className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
                <Link to="/products" className="w-full">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
