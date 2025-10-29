/**
 * Order Details Page - Redesigned
 * Detailed view of a single order with sidebar navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  Loader2,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  XCircle,
  Copy,
  Printer,
} from 'lucide-react';
import { getOrder, cancelOrder } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import { printInvoice } from '@/utils/printInvoice';
import { getReviewByOrderId } from '@/services/reviewService';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { submitReturnRequest, getReturnByOrderId } from '@/services/returnService';
import type { Order, OrderStatus } from '@/types/product';
import type { Review } from '@/types/review';
import { toast } from '@/components/ui/use-toast';

// Status configurations with colors matching design system
const getStatusBadgeClass = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'shipped':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'processing':
    case 'payment-confirmed':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'pending-payment':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'cancelled':
    case 'refunded':
    case 'failed':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  'pending-payment': 'Pending Payment',
  'payment-confirmed': 'Payment Confirmed',
  'processing': 'Processing',
  'shipped': 'Shipped',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
  'refunded': 'Refunded',
  'failed': 'Failed',
};

const STATUS_ICONS: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  'pending-payment': Clock,
  'payment-confirmed': CheckCircle2,
  'processing': Package,
  'shipped': Truck,
  'delivered': Home,
  'cancelled': XCircle,
  'refunded': XCircle,
  'failed': XCircle,
};

// Order timeline steps
const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending-payment', label: 'Order Placed' },
  { status: 'payment-confirmed', label: 'Payment Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

export function OrderDetailsRedesigned() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, profile } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [returnRequest, setReturnRequest] = useState<{ status: string; reason: string } | null>(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false); 
 const checkExistingReview = useCallback(async () => {
    if (!orderId) return;
    try {
      const review = await getReviewByOrderId(orderId);
      setExistingReview(review);
    } catch (error) {
      console.error('Error checking review:', error);
    }
  }, [orderId]);

  const checkReturnRequest = useCallback(async () => {
    if (!orderId) return;
    try {
      const request = await getReturnByOrderId(orderId);
      setReturnRequest(request);
    } catch (error) {
      console.error('Error checking return request:', error);
    }
  }, [orderId]);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const fetchedOrder = await getOrder(orderId);
      setOrder(fetchedOrder);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      checkExistingReview();
      checkReturnRequest();
    }
  }, [orderId, fetchOrder, checkExistingReview, checkReturnRequest]);

  const handleSubmitReturn = async () => {
    if (!order || !user || !profile) return;

    if (!returnReason || !returnDescription) {
      toast({
        title: 'Return details required',
        description: 'Please provide both a reason and description for the return.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingReturn(true);
    try {
      await submitReturnRequest(
        order.id,
        order.orderNumber,
        user.uid,
        profile.displayName || 'Anonymous',
        profile.email,
        returnReason,
        returnDescription,
        order.totalAmount
      );

      toast({
        title: 'Return requested',
        description: 'Your return request has been submitted for review.',
      });
      setShowReturnDialog(false);
      await checkReturnRequest();
    } catch (error) {
      console.error('Error submitting return:', error);
      toast({
        title: 'Return failed',
        description: 'Failed to submit return request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReturn(false);
    }
  };  
const formatDate = (timestamp: { toDate: () => Date } | Date | string | undefined) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'object' && 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimelineStepStatus = (stepStatus: OrderStatus): 'completed' | 'current' | 'pending' => {
    if (!order) return 'pending';

    const currentIndex = TIMELINE_STEPS.findIndex((s) => s.status === order.orderStatus);
    const stepIndex = TIMELINE_STEPS.findIndex((s) => s.status === stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const handleCancelOrder = async () => {
    if (!orderId || !order) return;

    const canCancel = ['pending-payment', 'payment-confirmed', 'processing'].includes(order.orderStatus);

    if (!canCancel) {
      toast({
        title: 'Cannot cancel order',
        description: 'This order cannot be cancelled at its current stage.',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
    try {
      await cancelOrder(orderId, 'Cancelled by customer');
      await fetchOrder(); // Refresh order data
      toast({
        title: 'Order cancelled',
        description: 'The order has been cancelled successfully.',
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Cancellation failed',
        description: 'Failed to cancel order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const copyTrackingNumber = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      toast({
        title: 'Tracking number copied',
        description: 'The tracking number has been copied to your clipboard.',
      });
    }
  }; 
 if (loading) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <CustomerSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <CustomerSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-neutral-600 mb-4">We couldn't find this order.</p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[order.orderStatus];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <CustomerSidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{order.orderNumber}</h1>
                <p className="text-sm text-neutral-600 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <Badge className={`${getStatusBadgeClass(order.orderStatus)} border px-3 py-1 text-sm font-medium`}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {STATUS_LABELS[order.orderStatus]}
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary Card - Matching Step 4 Style */}
              <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold">Order Summary</h3>

                <div className="space-y-3">
                  {/* Order Info */}
                  <div>
                    <p className="text-sm text-neutral-500">Order Number</p>
                    <p className="font-medium">{order.orderNumber}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-sm text-neutral-500">Order Date</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-sm text-neutral-500">Customer</p>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-neutral-600">{order.customerPhone} • {order.customerEmail}</p>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <p className="text-sm text-neutral-500">Shipping Address</p>
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-neutral-600">
                      {order.shippingAddress.address}, {order.shippingAddress.city}
                    </p>
                    <p className="text-sm text-neutral-600">{order.shippingAddress.region}</p>
                    {order.shippingAddress.landmark && (
                      <p className="text-sm text-neutral-500 italic">
                        Landmark: {order.shippingAddress.landmark}
                      </p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <p className="text-sm text-neutral-500">Payment Method</p>
                    <p className="font-medium capitalize">
                      {order.paymentMethod.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-neutral-600">Status: {order.paymentStatus}</p>
                  </div>

                  {/* Total Amount */}
                  <div className="pt-3 border-t">
                    <p className="text-sm text-neutral-500">Total Amount</p>
                    <p className="text-2xl font-bold text-cyan-500">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>     
         {/* Order Timeline */}
              {!['cancelled', 'refunded', 'failed'].includes(order.orderStatus) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {TIMELINE_STEPS.map((step, index) => {
                        const stepStatus = getTimelineStepStatus(step.status);

                        return (
                          <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                            {/* Timeline Line */}
                            {index < TIMELINE_STEPS.length - 1 && (
                              <div
                                className={`absolute left-[18px] w-0.5 h-16 ${
                                  stepStatus === 'completed' ? 'bg-teal-500' : 'bg-neutral-200'
                                }`}
                                style={{ top: `${36 + index * 64}px` }}
                              />
                            )}

                            {/* Step Icon */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 z-10 ${
                                stepStatus === 'completed'
                                  ? 'bg-teal-500 border-teal-500 text-white'
                                  : stepStatus === 'current'
                                  ? 'bg-white border-teal-500 text-teal-500'
                                  : 'bg-white border-neutral-200 text-neutral-400'
                              }`}
                            >
                              {stepStatus === 'completed' ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-current" />
                              )}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 pt-1">
                              <p
                                className={`font-medium ${
                                  stepStatus !== 'pending' ? 'text-neutral-900' : 'text-neutral-500'
                                }`}
                              >
                                {step.label}
                              </p>
                              {stepStatus === 'current' && (
                                <p className="text-sm text-teal-600 mt-0.5">In progress</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Items Ordered ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                      <div className="w-20 h-20 bg-white rounded flex-shrink-0 overflow-hidden">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-neutral-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{item.productName}</h4>
                        <p className="text-sm text-neutral-600">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                        {item.installationRequired && (
                          <Badge variant="secondary" className="mt-1">
                            Installation Included
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-lg">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Order Actions */}
            <div className="space-y-6">
              {/* Order Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Track Order */}
                  {order.trackingNumber && (
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600 mb-1">Tracking Number</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-white px-2 py-1 rounded border flex-1">
                          {order.trackingNumber}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copyTrackingNumber}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Print Invoice */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => printInvoice(order)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Invoice
                  </Button>

                  {/* Cancel Order */}
                  {['pending-payment', 'payment-confirmed', 'processing'].includes(order.orderStatus) && (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                    >
                      {cancelling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </>
                      )}
                    </Button>
                  )}

                  {/* Return Request */}
                  {order.orderStatus === 'delivered' && !returnRequest && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowReturnDialog(true)}
                    >
                      Request Return
                    </Button>
                  )}

                  {/* Return Status */}
                  {returnRequest && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-amber-800">Return Request</p>
                      <p className="text-xs text-amber-600 mt-1">
                        Status: {returnRequest.status}
                      </p>
                      <p className="text-xs text-amber-600">
                        Reason: {returnRequest.reason}
                      </p>
                    </div>
                  )}

                  {/* Review Product */}
                  {order.orderStatus === 'delivered' && !existingReview && (
                    <Button
                      variant="outline"
                      className="w-full bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write Review
                    </Button>
                  )}

                  {/* Existing Review */}
                  {existingReview && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">Review Submitted</p>
                      <p className="text-xs text-green-600 mt-1">
                        Rating: {existingReview.rating}/5 stars
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="bg-cyan-50 border-cyan-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-cyan-700 mb-3">
                    Need help with your order?
                  </p>
                  <div className="space-y-2 text-xs text-cyan-600">
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>+233 24 123 4567</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>support@supremo.com</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Return Request Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
            <DialogDescription>
              Please provide details for your return request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="returnReason">Reason for Return</Label>
              <Select value={returnReason} onValueChange={setReturnReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Defective Product</SelectItem>
                  <SelectItem value="wrong-item">Wrong Item Received</SelectItem>
                  <SelectItem value="not-as-described">Not as Described</SelectItem>
                  <SelectItem value="damaged">Damaged in Transit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="returnDescription">Description</Label>
              <Textarea
                id="returnDescription"
                value={returnDescription}
                onChange={(e) => setReturnDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReturn}
              disabled={submittingReturn || !returnReason || !returnDescription}
              className="bg-teal-700 hover:bg-teal-800"
            >
              {submittingReturn ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Return Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Form Dialog */}
      {showReviewForm && (
        <ReviewForm
          orderId={order.id}
          orderNumber={order.orderNumber}
          onSuccess={() => {
            setShowReviewForm(false);
            checkExistingReview();
          }}
        />
      )}
    </div>
  );
}
