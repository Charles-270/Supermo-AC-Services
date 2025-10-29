/**
 * Utility functions for exporting data to CSV
 */

import type { Order } from '@/types/product';
import { toast } from '@/components/ui/use-toast';
import { resolveDate } from '@/lib/utils';

/**
 * Convert orders data to CSV format
 */
export function exportOrdersToCSV(orders: Order[], filename = 'orders.csv') {
  if (orders.length === 0) {
    toast({
      title: 'Nothing to export',
      description: 'There are no orders to export right now.',
      variant: 'destructive',
    });
    return;
  }

  // Define CSV headers
  const headers = [
    'Order Number',
    'Order Date',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Status',
    'Payment Status',
    'Payment Method',
    'Items Count',
    'Items Total',
    'Shipping Fee',
    'Installation Fee',
    'Total Amount',
    'Shipping Address',
    'City',
    'Region',
    'Tracking Number',
    'Created At',
  ];

  // Convert orders to CSV rows
  const rows = orders.map((order) => {
    const createdDate = resolveDate(order.createdAt) ?? new Date(0);

    return [
      order.orderNumber,
      createdDate.toLocaleDateString('en-GB'),
      order.customerName,
      order.customerEmail,
      order.customerPhone || '',
      order.orderStatus,
      order.paymentStatus,
      order.paymentMethod,
      order.items.length,
      order.itemsTotal.toFixed(2),
      order.shippingFee.toFixed(2),
      order.installationFee?.toFixed(2) || '0.00',
      order.totalAmount.toFixed(2),
      order.shippingAddress.address,
      order.shippingAddress.city,
      order.shippingAddress.region,
      order.trackingNumber || '',
      createdDate.toISOString(),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export detailed order report with line items
 */
export function exportDetailedOrdersToCSV(orders: Order[], filename = 'orders-detailed.csv') {
  if (orders.length === 0) {
    toast({
      title: 'Nothing to export',
      description: 'There are no orders to export right now.',
      variant: 'destructive',
    });
    return;
  }

  // Define CSV headers
  const headers = [
    'Order Number',
    'Order Date',
    'Customer Name',
    'Customer Email',
    'Order Status',
    'Product Name',
    'Product ID',
    'Quantity',
    'Unit Price',
    'Line Total',
    'Installation Required',
  ];

  // Convert orders to CSV rows (one row per line item)
  const rows: (string | number)[][] = [];

  orders.forEach((order) => {
    const createdDate = resolveDate(order.createdAt) ?? new Date(0);

    order.items.forEach((item) => {
      rows.push([
        order.orderNumber,
        createdDate.toLocaleDateString('en-GB'),
        order.customerName,
        order.customerEmail,
        order.orderStatus,
        item.productName,
        item.productId,
        item.quantity,
        item.price.toFixed(2),
        item.subtotal.toFixed(2),
        item.installationRequired ? 'Yes' : 'No',
      ]);
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
