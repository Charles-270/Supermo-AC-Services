/**
 * Order Details Dialog Component
 * Modal overlay for viewing order details
 * Matches checkout success style
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Package, Download, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types/product';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onDownloadReceipt?: () => void;
  onReorder?: () => void;
}

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

export function OrderDetailsDialog({
  order,
  open,
  onClose,
  onDownloadReceipt,
  onReorder,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl font-bold">
              {order.orderNumber}
            </DialogTitle>
            <Badge className={`${getStatusBadgeClass(order.orderStatus)} border px-3 py-1 text-sm font-medium`}>
              {STATUS_LABELS[order.orderStatus]}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Summary Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Customer */}
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500 mb-1">Customer</p>
              <p className="font-medium text-neutral-900">{order.customerName}</p>
              <p className="text-sm text-neutral-600">
                {order.customerPhone} • {order.customerEmail}
              </p>
            </div>

            {/* Delivery Address */}
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500 mb-1">Delivery Address</p>
              <p className="font-medium text-neutral-900">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-neutral-600">
                {order.shippingAddress.address}, {order.shippingAddress.city}
              </p>
              <p className="text-sm text-neutral-600">{order.shippingAddress.region}</p>
            </div>

            {/* Payment Method */}
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500 mb-1">Payment Method</p>
              <p className="font-medium text-neutral-900 capitalize">
                {order.paymentMethod.replace('-', ' ')}
              </p>
              <p className="text-sm text-neutral-600">Status: {order.paymentStatus}</p>
            </div>

            {/* Order Date */}
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500 mb-1">Placed At</p>
              <p className="font-medium text-neutral-900">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Items List */}
          <div>
            <p className="text-sm font-semibold text-neutral-900 mb-3">
              Items ({order.items.length})
            </p>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-neutral-50 p-3"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-neutral-600">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(order.subtotal || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Delivery</span>
              <span className="font-medium">{formatCurrency(order.deliveryFee || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Tax</span>
              <span className="font-medium">{formatCurrency(order.tax || 0)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-lg font-semibold">Grand Total</span>
              <span className="text-2xl font-bold text-teal-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Fulfillment/Technician Info (if exists) */}
          {order.fulfillmentDetails && (
            <div className="rounded-lg bg-teal-50 border border-teal-200 p-4">
              <p className="text-sm font-semibold text-teal-900 mb-2">
                Fulfillment Details
              </p>
              {order.fulfillmentDetails.technicianName && (
                <p className="text-sm text-teal-700">
                  Technician: {order.fulfillmentDetails.technicianName}
                </p>
              )}
              {order.fulfillmentDetails.technicianPhone && (
                <p className="text-sm text-teal-700">
                  Phone: {order.fulfillmentDetails.technicianPhone}
                </p>
              )}
              {order.fulfillmentDetails.assignedTime && (
                <p className="text-sm text-teal-700">
                  Scheduled: {formatDate(order.fulfillmentDetails.assignedTime)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
          {onDownloadReceipt && (
            <Button
              variant="outline"
              onClick={onDownloadReceipt}
              className="flex-1 rounded-xl"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          )}
          {onReorder && order.orderStatus === 'delivered' && (
            <Button
              onClick={onReorder}
              className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reorder
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
