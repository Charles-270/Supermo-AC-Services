/**
 * Utility functions for printing invoices and packing slips
 */

import type { Order } from '@/types/product';
import { toast } from '@/components/ui/use-toast';

/**
 * Format date for invoice
 */
function formatInvoiceDate(timestamp: { toDate: () => Date } | Date | string | undefined): string {
  if (!timestamp) return 'N/A';
  const date = typeof timestamp === 'object' && 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Generate HTML for printable invoice
 */
export function generateInvoiceHTML(order: Order): string {
  const createdDate = formatInvoiceDate(order.createdAt);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    @media print {
      @page { margin: 1cm; }
      body { margin: 0; }
      .no-print { display: none; }
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0891b2;
    }

    .company-info h1 {
      margin: 0 0 10px 0;
      color: #0891b2;
      font-size: 28px;
    }

    .company-info p {
      margin: 5px 0;
      color: #666;
    }

    .invoice-meta {
      text-align: right;
    }

    .invoice-meta h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
      color: #333;
    }

    .invoice-meta p {
      margin: 5px 0;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 8px;
    }

    .status-delivered { background: #d1fae5; color: #065f46; }
    .status-shipped { background: #dbeafe; color: #1e40af; }
    .status-processing { background: #fef3c7; color: #92400e; }

    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }

    .party h3 {
      margin: 0 0 15px 0;
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
      letter-spacing: 0.5px;
    }

    .party p {
      margin: 5px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    thead {
      background: #f3f4f6;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      border-bottom: 2px solid #e5e7eb;
    }

    th.right, td.right {
      text-align: right;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .item-name {
      font-weight: 500;
      color: #111;
    }

    .item-meta {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .totals {
      margin-left: auto;
      width: 300px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .totals-row.grand-total {
      border-top: 2px solid #0891b2;
      border-bottom: 3px double #0891b2;
      padding: 15px 0;
      margin-top: 10px;
      font-size: 18px;
      font-weight: 700;
      color: #0891b2;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 14px;
    }

    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #0891b2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .print-button:hover {
      background: #0e7490;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print Invoice</button>

  <div class="header">
    <div class="company-info">
      <h1>Supremo AC Services</h1>
      <p><strong>Address:</strong> Accra, Ghana</p>
      <p><strong>Phone:</strong> +233 123 456 789</p>
      <p><strong>Email:</strong> info@supremo-ac.com</p>
    </div>

    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p><strong>Invoice #:</strong> ${order.orderNumber}</p>
      <p><strong>Date:</strong> ${createdDate}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod.replace('-', ' ').toUpperCase()}</p>
      <div class="status-badge status-${order.orderStatus.split('-')[0]}">
        ${order.orderStatus.replace(/-/g, ' ').toUpperCase()}
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Bill To</h3>
      <p><strong>${order.customerName}</strong></p>
      <p>${order.customerEmail}</p>
      <p>${order.customerPhone || ''}</p>
    </div>

    <div class="party">
      <h3>Ship To</h3>
      <p><strong>${order.shippingAddress.fullName}</strong></p>
      <p>${order.shippingAddress.address}</p>
      <p>${order.shippingAddress.city}, ${order.shippingAddress.region}</p>
      <p>${order.shippingAddress.phone}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="right">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map(item => `
        <tr>
          <td>
            <div class="item-name">${item.productName}</div>
            ${item.installationRequired ? '<div class="item-meta">✓ Installation Included</div>' : ''}
          </td>
          <td class="right">${item.quantity}</td>
          <td class="right">GH₵ ${item.price.toFixed(2)}</td>
          <td class="right">GH₵ ${item.subtotal.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>GH₵ ${order.itemsTotal.toFixed(2)}</span>
    </div>

    ${order.installationFee ? `
      <div class="totals-row">
        <span>Installation Fee:</span>
        <span>GH₵ ${order.installationFee.toFixed(2)}</span>
      </div>
    ` : ''}

    <div class="totals-row">
      <span>Shipping Fee:</span>
      <span>GH₵ ${order.shippingFee.toFixed(2)}</span>
    </div>

    <div class="totals-row grand-total">
      <span>TOTAL:</span>
      <span>GH₵ ${order.totalAmount.toFixed(2)}</span>
    </div>
  </div>

  ${order.trackingNumber ? `
    <div style="margin-top: 30px; padding: 15px; background: #f3f4f6; border-radius: 6px;">
      <p style="margin: 0;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
    </div>
  ` : ''}

  <div class="footer">
    <p><strong>Thank you for your business!</strong></p>
    <p>For questions about this invoice, please contact us at info@supremo-ac.com</p>
    <p style="margin-top: 20px; font-size: 12px;">
      Payment Method: ${order.paymentMethod.replace('-', ' ').toUpperCase()}
      ${order.paymentReference ? `| Reference: ${order.paymentReference}` : ''}
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for packing slip (admin use)
 */
export function generatePackingSlipHTML(order: Order): string {
  const createdDate = formatInvoiceDate(order.createdAt);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Packing Slip - ${order.orderNumber}</title>
  <style>
    @media print {
      @page { margin: 1cm; }
      body { margin: 0; }
      .no-print { display: none; }
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #000;
    }

    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      text-transform: uppercase;
    }

    .order-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f9fafb;
      border: 2px solid #e5e7eb;
    }

    .order-info div {
      margin: 5px 0;
    }

    .order-info strong {
      display: inline-block;
      width: 120px;
    }

    .shipping-address {
      padding: 20px;
      background: #fff7ed;
      border: 2px dashed #fb923c;
      margin-bottom: 30px;
    }

    .shipping-address h2 {
      margin: 0 0 15px 0;
      color: #c2410c;
    }

    .shipping-address p {
      margin: 5px 0;
      font-size: 16px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    thead {
      background: #111;
      color: white;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }

    th.center, td.center {
      text-align: center;
    }

    td {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
    }

    .item-name {
      font-weight: 600;
      font-size: 16px;
    }

    .item-id {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #333;
      display: inline-block;
    }

    .notes {
      padding: 20px;
      background: #fef3c7;
      border: 2px solid #fbbf24;
      margin-top: 30px;
    }

    .notes h3 {
      margin: 0 0 10px 0;
      color: #92400e;
    }

    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #000;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print Packing Slip</button>

  <div class="header">
    <h1>Packing Slip</h1>
    <p style="font-size: 14px; color: #666;">SUPREMO AC SERVICES</p>
  </div>

  <div class="order-info">
    <div>
      <div><strong>Order #:</strong> ${order.orderNumber}</div>
      <div><strong>Order Date:</strong> ${createdDate}</div>
      <div><strong>Items:</strong> ${order.items.length}</div>
    </div>
    <div>
      <div><strong>Customer:</strong> ${order.customerName}</div>
      <div><strong>Email:</strong> ${order.customerEmail}</div>
      <div><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</div>
    </div>
  </div>

  <div class="shipping-address">
    <h2>📦 SHIP TO:</h2>
    <p><strong>${order.shippingAddress.fullName}</strong></p>
    <p>${order.shippingAddress.address}</p>
    <p>${order.shippingAddress.city}, ${order.shippingAddress.region}</p>
    <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
    ${order.shippingAddress.landmark ? `<p><strong>Landmark:</strong> ${order.shippingAddress.landmark}</p>` : ''}
    ${order.shippingAddress.deliveryInstructions ? `
      <p style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #fb923c;">
        <strong>Instructions:</strong> ${order.shippingAddress.deliveryInstructions}
      </p>
    ` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th class="center">✓</th>
        <th>Item Details</th>
        <th class="center">Qty</th>
        <th>Special Notes</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map(item => `
        <tr>
          <td class="center"><span class="checkbox"></span></td>
          <td>
            <div class="item-name">${item.productName}</div>
            <div class="item-id">ID: ${item.productId}</div>
          </td>
          <td class="center" style="font-size: 20px; font-weight: 700;">${item.quantity}</td>
          <td>
            ${item.installationRequired ? '⚙️ <strong>INSTALLATION REQUIRED</strong>' : '-'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  ${order.installationFee ? `
    <div class="notes">
      <h3>⚙️ Installation Service</h3>
      <p>This order includes professional installation service. Coordinate with customer before delivery.</p>
    </div>
  ` : ''}

  <div style="margin-top: 40px; padding: 20px; border: 2px solid #000;">
    <p style="margin: 0 0 10px 0;"><strong>Packed by:</strong> _______________________</p>
    <p style="margin: 0 0 10px 0;"><strong>Date:</strong> _______________________</p>
    <p style="margin: 0;"><strong>Signature:</strong> _______________________</p>
  </div>

  <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
    <p>Supremo AC Services | Accra, Ghana | +233 123 456 789</p>
  </div>
</body>
</html>
  `;
}

/**
 * Print invoice in new window
 */
export function printInvoice(order: Order) {
  const invoiceHTML = generateInvoiceHTML(order);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  } else {
    toast({
      title: 'Popup blocked',
      description: 'Please allow popups to print the invoice.',
      variant: 'destructive',
    });
  }
}

/**
 * Print packing slip in new window
 */
export function printPackingSlip(order: Order) {
  const packingSlipHTML = generatePackingSlipHTML(order);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(packingSlipHTML);
    printWindow.document.close();
  } else {
    toast({
      title: 'Popup blocked',
      description: 'Please allow popups to print the packing slip.',
      variant: 'destructive',
    });
  }
}
