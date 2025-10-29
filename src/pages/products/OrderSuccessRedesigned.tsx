/**
 * Order Success Page - Redesigned
 * Confirmation view with responsive customer navigation
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Package, Home, Loader2, ShoppingBag, Eye, Menu } from 'lucide-react';
import { getOrder, updatePaymentStatus } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types/product';

export function OrderSuccessRedesigned() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const paymentReference = searchParams.get('reference');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const fetchOrderAndUpdatePayment = useCallback(async () => {
    if (!orderId || !paymentReference) return;

    try {
      await updatePaymentStatus(orderId, 'completed', paymentReference);
      const fetchedOrder = await getOrder(orderId);
      setOrder(fetchedOrder);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, paymentReference]);

  useEffect(() => {
    if (orderId && paymentReference) {
      fetchOrderAndUpdatePayment();
    } else {
      setLoading(false);
    }
  }, [orderId, paymentReference, fetchOrderAndUpdatePayment]);

  const headerTitle = loading
    ? 'Processing Order'
    : order
      ? 'Order Confirmation'
      : 'Order Not Found';

  const headerSubtitle = loading
    ? 'Processing your order...'
    : order
      ? 'Your order has been placed successfully'
      : 'We could not find your order.';

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-cyan-500" />
            <p className="text-neutral-600">Processing your order...</p>
          </div>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="mx-auto flex h-full max-w-md items-center justify-center">
          <Card className="p-8 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
            <h2 className="mb-2 text-xl font-semibold">Order Not Found</h2>
            <p className="mb-4 text-neutral-600">We could not find your order.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="text-center">
          <CardContent className="pb-8 pt-12">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-neutral-900">Order Placed Successfully!</h2>
            <p className="mb-6 text-lg text-neutral-600">
              Thank you for your purchase. We have received your order and will process it shortly.
            </p>
            <div className="inline-flex flex-col items-center gap-1">
              <span className="text-sm text-neutral-500">Order Number</span>
              <span className="text-2xl font-bold text-cyan-500">{order.orderNumber}</span>
            </div>
            <div className="mt-4">
              <Badge className="border-green-200 bg-green-100 px-3 py-1 text-green-700">
                Payment Confirmed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-3 rounded-lg bg-neutral-50 p-6">
              <h3 className="text-xl font-semibold">Order Summary</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Order Number</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500">Customer</p>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-neutral-600">
                    {order.customerPhone} - {order.customerEmail}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500">Shipping Address</p>
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-sm text-neutral-600">
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </p>
                  <p className="text-sm text-neutral-600">{order.shippingAddress.region}</p>
                  {order.shippingAddress.landmark && (
                    <p className="text-sm italic text-neutral-500">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-neutral-500">Payment Method</p>
                  <p className="font-medium capitalize">
                    {order.paymentMethod.replace('-', ' ')}
                  </p>
                  <p className="text-sm text-neutral-600">Status: {order.paymentStatus}</p>
                  {paymentReference && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Reference: {paymentReference}
                    </p>
                  )}
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-neutral-500">Total Paid</p>
                  <p className="text-2xl font-bold text-cyan-500">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Items Ordered ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex items-center gap-4 rounded-lg bg-neutral-50 p-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-white">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-8 w-8 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold">{item.productName}</h4>
                      <p className="text-sm text-neutral-600">
                        Qty: {item.quantity} - {formatCurrency(item.price)}
                      </p>
                      {item.installationRequired && (
                        <Badge variant="secondary" className="mt-1">
                          Installation Included
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-600">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Order Processing</h4>
                    <p className="text-sm text-neutral-600">
                      Our team is reviewing your order. Expect a confirmation call within 24 hours to confirm installation details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-600">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Delivery & Installation</h4>
                    <p className="text-sm text-neutral-600">
                      Delivery typically takes 3-5 business days. Installation will be scheduled based on your availability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-600">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Support & Follow-up</h4>
                    <p className="text-sm text-neutral-600">
                      Our support team is available 24/7 for any questions. We will follow up after installation to ensure everything works perfectly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/orders">
                    <Eye className="mr-2 h-4 w-4" />
                    Track Your Orders
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/products">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700" asChild>
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Return Home
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-neutral-50">
      <CustomerSidebar className="hidden lg:flex" />

      <div className="flex min-h-screen flex-col lg:ml-64">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
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
                <h1 className="text-2xl font-bold text-neutral-900">{headerTitle}</h1>
                <p className="mt-1 text-sm text-neutral-600">{headerSubtitle}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </main>
      </div>

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
