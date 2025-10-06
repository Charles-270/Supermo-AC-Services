/**
 * Order Details Page
 * Detailed view of a single order with tracking
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  ArrowLeft,
  Package,
  Loader2,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  FileText,
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

// Status configurations
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }
> = {
  'pending-payment': { label: 'Pending Payment', variant: 'outline', icon: Clock },
  'payment-confirmed': { label: 'Payment Confirmed', variant: 'secondary', icon: CheckCircle2 },
  'processing': { label: 'Processing', variant: 'default', icon: Package },
  'shipped': { label: 'Shipped', variant: 'default', icon: Truck },
  'delivered': { label: 'Delivered', variant: 'secondary', icon: Home },
  'cancelled': { label: 'Cancelled', variant: 'destructive', icon: Clock },
  'refunded': { label: 'Refunded', variant: 'destructive', icon: Clock },
  'failed': { label: 'Failed', variant: 'destructive', icon: Clock },
};

// Order timeline steps
const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending-payment', label: 'Order Placed' },
  { status: 'payment-confirmed', label: 'Payment Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [returnRequest, setReturnRequest] = useState<any>(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      checkExistingReview();
      checkReturnRequest();
    }
  }, [orderId]);

  const checkExistingReview = async () => {
    if (!orderId) return;
    try {
      const review = await getReviewByOrderId(orderId);
      setExistingReview(review);
    } catch (error) {
      console.error('Error checking review:', error);
    }
  };

  const checkReturnRequest = async () => {
    if (!orderId) return;
    try {
      const request = await getReturnByOrderId(orderId);
      setReturnRequest(request);
    } catch (error) {
      console.error('Error checking return request:', error);
    }
  };

  const handleSubmitReturn = async () => {
    if (!order || !user || !profile) return;

    if (!returnReason || !returnDescription) {
      alert('Please provide a reason and description for the return');
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

      alert('Return request submitted successfully! We will review it shortly.');
      setShowReturnDialog(false);
      await checkReturnRequest();
    } catch (error) {
      console.error('Error submitting return:', error);
      alert('Failed to submit return request. Please try again.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const fetchOrder = async () => {
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
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
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
      alert('This order cannot be cancelled at this stage');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
    try {
      await cancelOrder(orderId, 'Cancelled by customer');
      await fetchOrder(); // Refresh order data
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const copyTrackingNumber = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      alert('Tracking number copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cool flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-cool flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-neutral-600 mb-4">We couldn't find this order.</p>
          <Link to="/orders">
            <Button>View All Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.orderStatus];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/orders">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{order.orderNumber}</h1>
                <p className="text-sm text-neutral-600">Placed on {formatDate(order.createdAt)}</p>
              </div>
            </div>
            <Badge variant={config.variant} className="text-base px-4 py-1.5">
              <StatusIcon className="h-4 w-4 mr-2" />
              {config.label}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                              className={`absolute left-[18px] top-[36px] w-0.5 h-[calc(100%-36px)] ${
                                stepStatus === 'completed' ? 'bg-primary-500' : 'bg-neutral-200'
                              }`}
                              style={{ top: `${36 + index * 64}px`, height: '64px' }}
                            />
                          )}

                          {/* Step Icon */}
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 z-10 ${
                              stepStatus === 'completed'
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : stepStatus === 'current'
                                ? 'bg-white border-primary-500 text-primary-500'
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
                              <p className="text-sm text-primary-600 mt-0.5">In progress</p>
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

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold">{order.shippingAddress.fullName}</p>
                  <p className="text-neutral-600">{order.shippingAddress.phone}</p>
                  <p className="text-neutral-600">{order.shippingAddress.address}</p>
                  <p className="text-neutral-600">
                    {order.shippingAddress.city}, {order.shippingAddress.region}
                  </p>
                  {order.shippingAddress.landmark && (
                    <p className="text-sm text-neutral-500 italic">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                  {order.shippingAddress.deliveryInstructions && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded border border-neutral-200">
                      <p className="text-sm font-medium mb-1">Delivery Instructions:</p>
                      <p className="text-sm text-neutral-600">
                        {order.shippingAddress.deliveryInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Review Section (for delivered orders) */}
            {order.orderStatus === 'delivered' && (
              <div>
                {existingReview ? (
                  <Card className="bg-success-50 border-success-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success-600" />
                        Your Review
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`h-6 w-6 ${
                                star <= existingReview.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'
                              }`}
                            >
                              ⭐
                            </div>
                          ))}
                        </div>
                        <h4 className="font-semibold text-lg">{existingReview.title}</h4>
                        <p className="text-neutral-700">{existingReview.comment}</p>
                        {existingReview.photos && existingReview.photos.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {existingReview.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Review ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-neutral-500">
                          Submitted on {formatDate(existingReview.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : showReviewForm ? (
                  <ReviewForm
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      checkExistingReview();
                    }}
                  />
                ) : (
                  <Card className="bg-primary-50 border-primary-200">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-lg mb-2">How was your experience?</h3>
                      <p className="text-neutral-600 mb-4">
                        Share your thoughts to help other customers
                      </p>
                      <Button onClick={() => setShowReviewForm(true)}>
                        Write a Review
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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

                <div className="border-t border-neutral-200 pt-3 flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-500" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Payment Method</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Payment Status</span>
                  <Badge
                    variant={
                      order.paymentStatus === 'completed' ? 'secondary' : 'outline'
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                {order.paymentReference && (
                  <div className="text-xs text-neutral-500 pt-2 border-t">
                    Reference: {order.paymentReference}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary-500" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded border">
                    <div>
                      <p className="text-xs text-neutral-600 mb-1">Tracking Number</p>
                      <p className="font-mono font-semibold">{order.trackingNumber}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={copyTrackingNumber}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="text-sm">
                      <span className="text-neutral-600">Estimated Delivery: </span>
                      <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Support */}
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-primary-900 mb-2">Need Help?</h3>
                <p className="text-sm text-primary-700 mb-4">
                  Our customer support team is here to assist you.
                </p>
                <div className="space-y-2">
                  <a href="tel:+233123456789" className="flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900">
                    <Phone className="h-4 w-4" />
                    <span>+233 123 456 789</span>
                  </a>
                  <a href="mailto:support@supremoac.com" className="flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900">
                    <Mail className="h-4 w-4" />
                    <span>support@supremoac.com</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Print Invoice Button */}
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={() => printInvoice(order)}
              >
                <Printer className="h-5 w-5 mr-2" />
                Print Invoice
              </Button>

              {/* Request Return Button (for delivered orders) */}
              {order.orderStatus === 'delivered' && !returnRequest && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowReturnDialog(true)}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Request Return/Refund
                </Button>
              )}

              {/* Return Status */}
              {returnRequest && (
                <Card className={`${
                  returnRequest.status === 'approved' ? 'bg-success-50 border-success-200' :
                  returnRequest.status === 'rejected' ? 'bg-destructive-50 border-destructive-200' :
                  'bg-amber-50 border-amber-200'
                }`}>
                  <CardContent className="p-4">
                    <p className="font-semibold mb-1">
                      Return Request: {returnRequest.status.toUpperCase()}
                    </p>
                    <p className="text-sm">{returnRequest.reason}</p>
                  </CardContent>
                </Card>
              )}

              {/* Cancel Order Button */}
              {['pending-payment', 'payment-confirmed', 'processing'].includes(order.orderStatus) && (
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              )}

              <Link to="/dashboard/customer" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  <Home className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link to="/orders" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  <FileText className="h-5 w-5 mr-2" />
                  All Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Return Request Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Return/Refund</DialogTitle>
            <DialogDescription>
              Please provide details for your return request for order {order?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Reason for Return</Label>
              <Select value={returnReason} onValueChange={setReturnReason}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Defective Product</SelectItem>
                  <SelectItem value="not-as-described">Not as Described</SelectItem>
                  <SelectItem value="wrong-item">Wrong Item Received</SelectItem>
                  <SelectItem value="changed-mind">Changed Mind</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Please provide more details about your return request..."
                value={returnDescription}
                onChange={(e) => setReturnDescription(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-sm text-amber-900">
                <strong>Refund Amount:</strong> {order && formatCurrency(order.totalAmount)}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Your request will be reviewed within 2-3 business days
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReturn} disabled={submittingReturn}>
              {submittingReturn ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
