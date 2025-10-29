/**
 * Admin Orders Management - Redesigned
 * View and manage all customer orders
 * Google Stitch-inspired design - October 2025
 */

import { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Package,
  Search,
  Loader2,
  Calendar,
  CreditCard,
  MapPin,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Users,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import {
  getAllOrders,
  updateOrderStatus,
  updateTrackingNumber,
  assignOrderToSupplier,
  updateSupplierAssignmentStatus,
  type OrderAssignmentInput,
} from '@/services/productService';
import {
  getActiveCatalogItemsByProductIds,
  getSupplierProfile,
} from '@/services/supplierService';
import { formatCurrency, resolveDate } from '@/lib/utils';
import { exportOrdersToCSV, exportDetailedOrdersToCSV } from '@/utils/exportToCSV';
import { printPackingSlip } from '@/utils/printInvoice';
import type {
  Order,
  OrderStatus,
  SupplierCatalogItem,
  SupplierAssignmentStatus,
  SupplierAssignmentItem,
} from '@/types/product';
import { toast } from '@/components/ui/use-toast';

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

  // Supplier assignment
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignOrder, setAssignOrder] = useState<Order | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [availableCatalog, setAvailableCatalog] = useState<Record<string, SupplierCatalogItem[]>>(
    {}
  );
  const [availableSuppliers, setAvailableSuppliers] = useState<
    Record<string, { name: string; company?: string | null }>
  >({});
  const [assignmentStatusUpdating, setAssignmentStatusUpdating] = useState<string | null>(null);

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

  const formatDate = (timestamp: Date | string | number | { toDate: () => Date } | null | undefined) => {
    const date = resolveDate(timestamp);
    if (!date) return 'N/A';
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

      toast({
        title: 'Order updated',
        description: `${selectedOrder.orderNumber} has been updated successfully.`,
        variant: 'success',
      });
      setUpdateDialogOpen(false);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const closeAssignmentDialog = () => {
    setAssignDialogOpen(false);
    setAssignOrder(null);
    setAvailableCatalog({});
    setAvailableSuppliers({});
    setSelectedSupplierId('');
    setAssignNotes('');
    setAssignLoading(false);
  };

  const handleAssignmentDialogChange = (open: boolean) => {
    if (!open) {
      closeAssignmentDialog();
    }
  };

  const handleOpenAssignmentDialog = async (order: Order) => {
    setAssignOrder(order);
    setAssignDialogOpen(true);
    setAssignLoading(true);
    setSelectedSupplierId('');
    setAssignNotes('');
    setAvailableCatalog({});
    setAvailableSuppliers({});

    try {
      const productIds = order.items.map((item) => item.productId).filter(Boolean);

      if (productIds.length === 0) {
        toast({
          title: 'No products available',
          description: 'This order does not contain any products to assign.',
          variant: 'destructive',
        });
        return;
      }

      const catalogMap = await getActiveCatalogItemsByProductIds(productIds);
      setAvailableCatalog(catalogMap);

      const supplierIds = new Set<string>();
      Object.values(catalogMap).forEach((items) => {
        items.forEach((item) => supplierIds.add(item.supplierId));
      });

      if (supplierIds.size === 0) {
        toast({
          title: 'No supplier availability',
          description: 'No suppliers currently have inventory for the items in this order.',
          variant: 'destructive',
        });
        return;
      }

      const profiles = await Promise.all(
        Array.from(supplierIds).map(async (supplierId) => {
          try {
            return await getSupplierProfile(supplierId);
          } catch (error) {
            console.error('Error fetching supplier profile:', error);
            return null;
          }
        })
      );

      const profileMap: Record<string, { name: string; company?: string | null }> = {};
      profiles.forEach((profile) => {
        if (profile) {
          profileMap[profile.uid] = {
            name: profile.displayName,
            company: profile.metadata?.companyName ?? null,
          };
        }
      });

      setAvailableSuppliers(profileMap);
    } catch (error) {
      console.error('Error loading supplier availability:', error);
      toast({
        title: 'Failed to load suppliers',
        description: 'Unable to load supplier availability for this order.',
        variant: 'destructive',
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const assignmentCandidates = useMemo(() => {
    if (!assignOrder) return [];

    const supplierMap = new Map<
      string,
      {
        supplierId: string;
        supplierName: string;
        items: SupplierAssignmentItem[];
        coverage: Set<string>;
        insufficient: boolean;
        minLeadTime: number | null;
        notes?: string | null;
      }
    >();

    assignOrder.items.forEach((orderItem) => {
      const catalogItems = availableCatalog[orderItem.productId] || [];

      catalogItems.forEach((catalogItem) => {
        if (!supplierMap.has(catalogItem.supplierId)) {
          supplierMap.set(catalogItem.supplierId, {
            supplierId: catalogItem.supplierId,
            supplierName:
              availableSuppliers[catalogItem.supplierId]?.company ||
              availableSuppliers[catalogItem.supplierId]?.name ||
              catalogItem.supplierId,
            items: [],
            coverage: new Set<string>(),
            insufficient: false,
            minLeadTime: catalogItem.leadTimeDays ?? null,
            notes: catalogItem.notes ?? null,
          });
        }

        const entry = supplierMap.get(catalogItem.supplierId)!;
        const item: SupplierAssignmentItem = {
          productId: orderItem.productId,
          quantity: orderItem.quantity,
        };
        if (catalogItem.id) {
          item.catalogItemId = catalogItem.id;
        }
        entry.items.push(item);

        if (catalogItem.deliveryRegions) {
          catalogItem.deliveryRegions.forEach((region) => entry.coverage.add(region));
        }

        if (catalogItem.stockQuantity < orderItem.quantity) {
          entry.insufficient = true;
        }

        if (catalogItem.leadTimeDays !== undefined && catalogItem.leadTimeDays !== null) {
          entry.minLeadTime =
            entry.minLeadTime === null
              ? catalogItem.leadTimeDays
              : Math.max(entry.minLeadTime, catalogItem.leadTimeDays);
        }
      });
    });

    return Array.from(supplierMap.values()).map((entry) => ({
      supplierId: entry.supplierId,
      supplierName: entry.supplierName,
      items: entry.items,
      coverage: Array.from(entry.coverage),
      insufficient: entry.insufficient,
      minLeadTime: entry.minLeadTime,
      notes: entry.notes,
      fullCoverage: entry.items.length === assignOrder.items.length,
    }));
  }, [assignOrder, availableCatalog, availableSuppliers]);

  const sortedAssignmentCandidates = useMemo(() => {
    const candidates = [...assignmentCandidates];
    candidates.sort((a, b) => {
      if (a.fullCoverage !== b.fullCoverage) {
        return a.fullCoverage ? -1 : 1;
      }
      if (a.insufficient !== b.insufficient) {
        return a.insufficient ? 1 : -1;
      }
      return (a.minLeadTime ?? 0) - (b.minLeadTime ?? 0);
    });
    return candidates;
  }, [assignmentCandidates]);

  const handleSubmitAssignment = async () => {
    if (!assignOrder || !selectedSupplierId) {
      toast({
        title: 'Select a supplier',
        description: 'Choose a supplier to assign before submitting.',
        variant: 'destructive',
      });
      return;
    }

    const candidate = sortedAssignmentCandidates.find(
      (item) => item.supplierId === selectedSupplierId
    );

    if (!candidate) {
      toast({
        title: 'Supplier not available',
        description: 'Selected supplier is no longer available. Refresh and try again.',
        variant: 'destructive',
      });
      return;
    }

    const payload: OrderAssignmentInput = {
      supplierId: candidate.supplierId,
      supplierName: candidate.supplierName,
      items: candidate.items,
      ...(assignNotes.trim() && { notes: assignNotes.trim() }),
    };

    setAssignSubmitting(true);
    try {
      await assignOrderToSupplier(assignOrder.id, payload);
      toast({
        title: 'Supplier assigned',
        description: `${candidate.supplierName} has been assigned to ${assignOrder.orderNumber}.`,
      });
      closeAssignmentDialog();
      await fetchOrders();
    } catch (error) {
      console.error('Error assigning supplier:', error);
      toast({
        title: 'Assignment failed',
        description: 'Could not assign supplier. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUpdateAssignmentStatus = async (
    orderId: string,
    supplierId: string,
    status: SupplierAssignmentStatus
  ) => {
    const key = `${orderId}:${supplierId}:${status}`;
    setAssignmentStatusUpdating(key);
    try {
      await updateSupplierAssignmentStatus(orderId, supplierId, status);
      toast({
        title: 'Assignment updated',
        description: `Supplier marked as ${formatAssignmentStatus(status)}.`,
      });
      await fetchOrders();
    } catch (error) {
      console.error('Error updating supplier assignment status:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update supplier assignment status.',
        variant: 'destructive',
      });
    } finally {
      setAssignmentStatusUpdating(null);
    }
  };

  const getAssignmentBadgeVariant = (status: SupplierAssignmentStatus) => {
    switch (status) {
      case 'fulfilled':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'declined':
        return 'destructive';
      case 'reassigned':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatAssignmentStatus = (status: SupplierAssignmentStatus) =>
    status
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

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

      toast({
        title: 'Bulk update successful',
        description: `Updated ${selectedOrders.size} order${selectedOrders.size === 1 ? '' : 's'} successfully.`,
        variant: 'success',
      });
      setBulkDialogOpen(false);
      setSelectedOrders(new Set());
      await fetchOrders();
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      toast({
        title: 'Bulk update failed',
        description: 'Failed to update some orders. Please try again.',
        variant: 'destructive',
      });
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
      const orderDate = resolveDate(order.createdAt) ?? new Date(0);
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
    <AdminLayout
      title="Manage Orders"
      subtitle={`${filteredOrders.length} ${filteredOrders.length === 1 ? 'order' : 'orders'}${selectedOrders.size > 0 ? ` • ${selectedOrders.size} selected` : ''}`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'E-Commerce', href: '/dashboard/admin/ecommerce/orders' },
        { label: 'Orders' }
      ]}
    >
      <div className="space-y-6">
        {/* Bulk Actions Toolbar */}
        {selectedOrders.size > 0 && (
          <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
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
            </CardContent>
          </Card>
        )}

        {/* Original header content moved here */}
        <div className="hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-600">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                {selectedOrders.size > 0 && ` (${selectedOrders.size} selected)`}
              </p>
            </div>
          </div>

        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-neutral-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-neutral-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-neutral-600 mb-1">Processing</p>
              <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-neutral-600 mb-1">Shipped</p>
              <p className="text-3xl font-bold text-purple-600">{stats.shipped}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-neutral-600 mb-1">Delivered</p>
              <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
            </CardContent>
          </Card>
        </div>

        {/* Notification Alerts */}
        {!loading && (
          <div className="mb-6">
            {stats.pending > 0 && (
              <Alert className="border-amber-500 bg-amber-50">
                <ShoppingBag className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-900">
                  {stats.pending} {stats.pending === 1 ? 'Order' : 'Orders'} Awaiting Payment Confirmation
                </AlertTitle>
                <AlertDescription className="text-amber-800">
                  {stats.pending === 1
                    ? 'There is 1 order pending payment confirmation.'
                    : `There are ${stats.pending} orders pending payment confirmation.`}{' '}
                  Review and process these orders to move them forward.
                </AlertDescription>
              </Alert>
            )}
            {stats.processing > 0 && stats.pending === 0 && (
              <Alert className="border-primary-500 bg-primary-50">
                <Package className="h-5 w-5 text-primary-600" />
                <AlertTitle className="text-primary-900">
                  {stats.processing} {stats.processing === 1 ? 'Order' : 'Orders'} Being Processed
                </AlertTitle>
                <AlertDescription className="text-primary-800">
                  Active orders are being prepared for shipment. Assign suppliers if needed.
                </AlertDescription>
              </Alert>
            )}
            {stats.pending === 0 && stats.processing === 0 && stats.total > 0 && (
              <Alert className="border-success-500 bg-green-50">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <AlertTitle className="text-success-900">All Orders Up to Date</AlertTitle>
                <AlertDescription className="text-success-800">
                  Great work! All pending orders have been processed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm">
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
                  className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
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
                            <h3 className="text-lg font-semibold">
                              {order.items.length === 1
                                ? order.items[0].productName
                                : `${order.items[0].productName}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}`}
                            </h3>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-600">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{order.orderNumber}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(order.createdAt)}</span>
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
                    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenAssignmentDialog(order)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Assign Supplier
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenUpdateDialog(order)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printPackingSlip(order)}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Packing Slip
                      </Button>
                      {/* Note: All order details are displayed in the card above.
                          The View Details button has been removed to keep admins in the admin context.
                          All necessary information (customer, shipping, payment, items, supplier assignments)
                          is already visible in the expanded card view. */}
                    </div>

                    {order.supplierAssignments && order.supplierAssignments.length > 0 ? (
                      <div className="mt-4 border-t pt-4 space-y-3">
                        <p className="text-sm font-semibold">Supplier Assignments</p>
                        {order.supplierAssignments.map((assignment) => {
                          const statusKey = `${order.id}:${assignment.supplierId}:fulfilled`;
                          return (
                            <div
                              key={`${order.id}-${assignment.supplierId}`}
                              className="rounded-md border border-neutral-200 bg-neutral-50 p-3"
                            >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium">
                                  {assignment.supplierName || assignment.supplierId}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  Assigned{' '}
                                  {assignment.assignedAt ? formatDate(assignment.assignedAt) : 'N/A'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getAssignmentBadgeVariant(assignment.status)}>
                                  {formatAssignmentStatus(assignment.status)}
                                </Badge>
                                {assignment.status !== 'fulfilled' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                      handleUpdateAssignmentStatus(
                                        order.id,
                                        assignment.supplierId,
                                        'fulfilled'
                                      )
                                    }
                                    disabled={assignmentStatusUpdating === statusKey}
                                  >
                                    {assignmentStatusUpdating === statusKey ? (
                                      <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Updating...
                                      </>
                                    ) : (
                                      'Mark Fulfilled'
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 grid gap-1 text-xs text-neutral-600">
                              {assignment.items.map((item) => {
                                const orderItem = order.items.find(
                                  (oi) => oi.productId === item.productId
                                );
                                return (
                                  <div
                                    key={`${assignment.supplierId}-${item.productId}`}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="truncate">
                                      {orderItem?.productName || item.productId}
                                    </span>
                                    <span>Qty {item.quantity}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {assignment.notes && (
                              <p className="text-xs text-neutral-500 mt-2 italic">
                                Notes: {assignment.notes}
                              </p>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-4 border-t pt-4 text-sm text-neutral-500">
                        No suppliers assigned yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

      {/* Assign Supplier Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={handleAssignmentDialogChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Assign Supplier</DialogTitle>
            <DialogDescription>
              Match {assignOrder?.orderNumber ?? 'this order'} to suppliers with available inventory.
            </DialogDescription>
          </DialogHeader>

          {assignLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="space-y-5 py-2">
              {assignOrder && (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-sm font-semibold text-neutral-700 mb-3">Order Items</p>
                  <div className="grid gap-2 text-sm text-neutral-700">
                    {assignOrder.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between"
                      >
                        <span className="font-medium truncate max-w-xs">{item.productName}</span>
                        <span className="text-neutral-500">Qty {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-semibold text-neutral-700">Available Suppliers</p>
                {sortedAssignmentCandidates.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-3 text-sm text-neutral-600">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>No suppliers currently have inventory for these items.</span>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {sortedAssignmentCandidates.map((candidate) => {
                      const disabled = candidate.insufficient;
                      const isSelected = selectedSupplierId === candidate.supplierId;
                      return (
                        <button
                          key={candidate.supplierId}
                          type="button"
                          onClick={() => !disabled && setSelectedSupplierId(candidate.supplierId)}
                          className={`w-full text-left rounded-md border p-3 transition ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-200 hover:border-primary-300'
                          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-neutral-800">
                                {candidate.supplierName}
                              </p>
                              <p className="text-xs text-neutral-500">
                                Covers {candidate.items.length} of {assignOrder?.items.length ?? 0}{' '}
                                items
                              </p>
                            </div>
                            {candidate.insufficient && (
                              <Badge variant="outline" className="text-amber-600 border-amber-400">
                                Limited stock
                              </Badge>
                            )}
                            {!candidate.fullCoverage && !candidate.insufficient && (
                              <Badge variant="outline" className="text-neutral-600">
                                Partial
                              </Badge>
                            )}
                            {candidate.fullCoverage && !candidate.insufficient && (
                              <Badge variant="secondary">Full coverage</Badge>
                            )}
                          </div>
                          {candidate.coverage.length > 0 && (
                            <p className="mt-2 text-xs text-neutral-500">
                              Regions: {candidate.coverage.join(', ')}
                            </p>
                          )}
                          {candidate.minLeadTime !== null && (
                            <p className="mt-1 text-xs text-neutral-500">
                              Avg. lead time: {candidate.minLeadTime} day
                              {candidate.minLeadTime === 1 ? '' : 's'}
                            </p>
                          )}
                          {candidate.notes && (
                            <p className="mt-1 text-xs text-neutral-500 italic">
                              Notes: {candidate.notes}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm text-neutral-700">Notes for supplier (optional)</Label>
                <Textarea
                  value={assignNotes}
                  onChange={(event) => setAssignNotes(event.target.value)}
                  placeholder="Highlight delivery expectations, packaging needs, etc."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeAssignmentDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAssignment}
              disabled={
                assignSubmitting || sortedAssignmentCandidates.length === 0 || !selectedSupplierId
              }
            >
              {assignSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Assign Supplier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </AdminLayout>
  );
}
