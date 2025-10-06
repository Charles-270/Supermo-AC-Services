/**
 * Order Success Page
 * Confirmation page after successful payment
 */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, Home, FileText } from 'lucide-react';
import { getOrder } from '@/services/productService';
import { updatePaymentStatus } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types/product';

export function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const paymentReference = searchParams.get('reference');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && paymentReference) {
      fetchOrderAndUpdatePayment();
    }
  }, [orderId, paymentReference]);

  const fetchOrderAndUpdatePayment = async () => {
    if (!orderId || !paymentReference) return;

    try {
      // Update payment status
      await updatePaymentStatus(orderId, 'completed', paymentReference);

      // Fetch order details
      const fetchedOrder = await getOrder(orderId);
      setOrder(fetchedOrder);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cool flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Package className="h-16 w-16 text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-cool flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-neutral-600 mb-4">We couldn't find your order.</p>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cool py-12">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <Card className="mb-8 text-center">
          <CardContent className="pt-12 pb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success-100 rounded-full mb-6">
              <CheckCircle2 className="h-12 w-12 text-success-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-lg text-neutral-600 mb-6">
              Thank you for your purchase. We've received your order and will process it shortly.
            </p>
            <div className="inline-flex flex-col items-center gap-1">
              <span className="text-sm text-neutral-500">Order Number</span>
              <span className="text-2xl font-bold text-primary-600">{order.orderNumber}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div>
              <h3 className="font-semibold mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-16 h-16 bg-white rounded flex-shrink-0">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-neutral-600">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                      {item.installationRequired && (
                        <p className="text-xs text-primary-600 mt-1">✓ Installation included</p>
                      )}
                    </div>
                    <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-neutral-600 mt-1">{order.shippingAddress.phone}</p>
                <p className="text-sm text-neutral-600 mt-1">
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.region}
                </p>
                {order.shippingAddress.landmark && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Landmark: {order.shippingAddress.landmark}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <h3 className="font-semibold mb-2">Payment Summary</h3>
              <div className="p-3 bg-neutral-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Items Total</span>
                  <span className="font-medium">{formatCurrency(order.itemsTotal)}</span>
                </div>
                {order.installationFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Installation Fee</span>
                    <span className="font-medium">{formatCurrency(order.installationFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping Fee</span>
                  <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between">
                  <span className="font-semibold">Total Paid</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div className="text-xs text-neutral-500">
                  Payment Reference: {paymentReference}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium">Order Confirmation Email</p>
                <p className="text-neutral-600">You'll receive a confirmation email at {order.customerEmail}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-neutral-600">We'll prepare your items for shipment within 1-2 business days</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-neutral-600">
                  Estimated delivery: 1-3 business days to {order.shippingAddress.region}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/dashboard/customer" className="flex-1">
            <Button size="lg" className="w-full">
              <Home className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button size="lg" variant="outline" className="w-full">
              <Package className="h-5 w-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support */}
        <Card className="mt-6 bg-primary-50 border-primary-200">
          <CardContent className="p-4 text-center text-sm">
            <p className="text-primary-700">
              Need help with your order?{' '}
              <Link to="/support" className="font-semibold underline">
                Contact our support team
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
