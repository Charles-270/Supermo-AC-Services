/**
 * Admin Orders Management
 * View and manage all customer orders
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  Search,
  Loader2,
  Calendar,
  CreditCard,
  MapPin,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  getAllOrders,
  updateOrderStatus,
  updateTrackingNumber,
} from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import { exportOrdersToCSV, exportDetailedOrdersToCSV } from '@/utils/exportToCSV';
import { printPackingSlip } from '@/utils/printInvoice';
import type { Order, OrderStatus } from '@/types/product';

// Status configurations
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  'pending-payment': { label: 'Pending Payment', variant: 'outline' },
  'payment-confirmed': { label: 'Payment Confirmed', variant: 'secondary' },
  'processing': { label: 'Processing', variant: 'default' },
  'shipped': { label: 'Shipped', variant: 'default' },
  'delivered': { label: 'Delivered', variant: 'secondary' },
  'cancelled': { label: 'Cancelled', variant: 'destructive' },
  'refunded': { label: 'Refunded', variant: 'destructive' },
  'failed': { label: 'Failed', variant: 'destructive' },
};

export default function ManageOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Bulk selection
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('processing');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Date range filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Price range filter
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Update order dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await getAllOrders(100);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const handleOpenUpdateDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setTrackingNumber(order.trackingNumber || '');
    setUpdateDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      // Update status if changed
      if (newStatus !== selectedOrder.orderStatus) {
        await updateOrderStatus(selectedOrder.id, newStatus);
      }

      // Update tracking number if provided and order is being shipped
      if (trackingNumber && newStatus === 'shipped') {
        await updateTrackingNumber(selectedOrder.id, trackingNumber);
      }

      alert('Order updated successfully!');
      setUpdateDialogOpen(false);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Bulk selection handlers
  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleBulkUpdate = async () => {
    setBulkUpdating(true);
    try {
      const updatePromises = Array.from(selectedOrders).map(orderId =>
        updateOrderStatus(orderId, bulkStatus)
      );
      await Promise.all(updatePromises);

      alert(`Successfully updated ${selectedOrders.size} orders!`);
      setBulkDialogOpen(false);
      setSelectedOrders(new Set());
      await fetchOrders();
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      alert('Failed to update some orders. Please try again.');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const ordersToExport = selectedOrders.size > 0
      ? filteredOrders.filter(o => selectedOrders.has(o.id))
      : filteredOrders;

    exportOrdersToCSV(ordersToExport, `orders-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportDetailedCSV = () => {
    const ordersToExport = selectedOrders.size > 0
      ? filteredOrders.filter(o => selectedOrders.has(o.id))
      : filteredOrders;

    exportDetailedOrdersToCSV(ordersToExport, `orders-detailed-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

    // Date range filter
    let matchesDateRange = true;
    if (startDate || endDate) {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      if (startDate) {
        matchesDateRange = matchesDateRange && orderDate >= new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && orderDate <= endDateTime;
      }
    }

    // Price range filter
    let matchesPriceRange = true;
    if (minPrice) {
      matchesPriceRange = matchesPriceRange && order.totalAmount >= parseFloat(minPrice);
    }
    if (maxPrice) {
      matchesPriceRange = matchesPriceRange && order.totalAmount <= parseFloat(maxPrice);
    }

    return matchesSearch && matchesStatus && matchesDateRange && matchesPriceRange;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => ['pending-payment', 'payment-confirmed'].includes(o.orderStatus)).length,
    processing: orders.filter((o) => o.orderStatus === 'processing').length,
    shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Manage Orders</h1>
              <p className="text-sm text-neutral-600">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                {selectedOrders.size > 0 && ` (${selectedOrders.size} selected)`}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard/admin')}>
              Back to Dashboard
            </Button>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedOrders.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <Badge variant="secondary" className="text-base">
                {selectedOrders.size} selected
              </Badge>
              <Button
                size="sm"
                onClick={() => setBulkDialogOpen(true)}
                className="ml-auto"
              >
                <Edit className="h-4 w-4 mr-1" />
                Bulk Update Status
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportDetailedCSV}
              >
                <FileText className="h-4 w-4 mr-1" />
                Detailed CSV
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedOrders(new Set())}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
              <div className="text-sm text-neutral-600">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-sm text-neutral-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
              <div className="text-sm text-neutral-600">Processing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
              <div className="text-sm text-neutral-600">Shipped</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success-600">{stats.delivered}</div>
              <div className="text-sm text-neutral-600">Delivered</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search by order number, customer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending-payment">Pending Payment</SelectItem>
                  <SelectItem value="payment-confirmed">Payment Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <Label className="text-xs text-neutral-600 mb-1">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs text-neutral-600 mb-1">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-xs text-neutral-600 mb-1">Min Price (GH₵)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label className="text-xs text-neutral-600 mb-1">Max Price (GH₵)</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(startDate || endDate || minPrice || maxPrice || searchQuery || statusFilter !== 'all') && (
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setStartDate('');
                    setEndDate('');
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-neutral-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No orders have been placed yet'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Select All Header */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
              <Checkbox
                checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <Label htmlFor="select-all" className="cursor-pointer font-medium">
                Select All ({filteredOrders.length} orders)
              </Label>
              {selectedOrders.size > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedOrders(new Set())}
                  className="ml-auto"
                >
                  Deselect All
                </Button>
              )}
            </div>

            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.orderStatus];
              const isSelected = selectedOrders.has(order.id);

              return (
                <Card
                  key={order.id}
                  className={`hover:shadow-lg transition-shadow ${
                    isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Selection Checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                          onClick={(e) => e.stopPropagation()}
                          id={`order-${order.id}`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Package className="h-4 w-4" />
                              <span>{order.items.length} items</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-600 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold mb-1">Customer</p>
                        <p className="text-sm text-neutral-700">{order.customerName}</p>
                        <p className="text-sm text-neutral-600">{order.customerEmail}</p>
                        <p className="text-sm text-neutral-600">{order.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Shipping Address
                        </p>
                        <p className="text-sm text-neutral-700">{order.shippingAddress.address}</p>
                        <p className="text-sm text-neutral-600">
                          {order.shippingAddress.city}, {order.shippingAddress.region}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-neutral-500" />
                        <span className="capitalize">{order.paymentMethod.replace('-', ' ')}</span>
                      </div>
                      <Badge variant={order.paymentStatus === 'completed' ? 'secondary' : 'outline'}>
                        {order.paymentStatus}
                      </Badge>
                      {order.trackingNumber && (
                        <div className="flex items-center gap-1.5 text-neutral-600">
                          <Truck className="h-4 w-4" />
                          <span className="font-mono text-xs">{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printPackingSlip(order)}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Packing Slip
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenUpdateDialog(order)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Update Order Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
            <DialogDescription>
              Update the status and tracking information for {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Status Update */}
            <div>
              <Label>Order Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending-payment">Pending Payment</SelectItem>
                  <SelectItem value="payment-confirmed">Payment Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Number */}
            <div>
              <Label>Tracking Number (for shipped orders)</Label>
              <Input
                placeholder="e.g., DHL123456789"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Optional: Add tracking number when marking as shipped
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Orders</DialogTitle>
            <DialogDescription>
              Update the status of {selectedOrders.size} selected {selectedOrders.size === 1 ? 'order' : 'orders'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>New Status for All Selected Orders</Label>
              <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as OrderStatus)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment-confirmed">Payment Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500 mt-2">
                Warning: This will update all {selectedOrders.size} selected orders to this status.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate} disabled={bulkUpdating}>
              {bulkUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating {selectedOrders.size} Orders...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update {selectedOrders.size} Orders
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
