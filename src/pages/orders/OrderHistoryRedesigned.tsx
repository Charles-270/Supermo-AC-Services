/**
 * Order History Page - Redesigned
 * Modern layout with sidebar navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Search,
  Loader2,
  ShoppingBag,
  Calendar,
  MapPin,
  CreditCard,
  X,
  SlidersHorizontal,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getCustomerOrders } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types/product';
import { cn } from '@/lib/utils';

// Status badge configurations
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

export function OrderHistoryRedesigned() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getCustomerOrders(user.uid);
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowFilters(false);
    }
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (timestamp: { toDate: () => Date } | Date | string | undefined) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'object' && 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    active: orders.filter(o => ['pending-payment', 'payment-confirmed', 'processing', 'shipped'].includes(o.orderStatus)).length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => ['cancelled', 'refunded', 'failed'].includes(o.orderStatus)).length,
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: stats.total },
    { value: 'pending-payment', label: 'Pending Payment', count: orders.filter(o => o.orderStatus === 'pending-payment').length },
    { value: 'processing', label: 'Processing', count: orders.filter(o => ['payment-confirmed', 'processing'].includes(o.orderStatus)).length },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.orderStatus === 'shipped').length },
    { value: 'delivered', label: 'Delivered', count: stats.delivered },
    { value: 'cancelled', label: 'Cancelled', count: stats.cancelled },
  ];

  const activeFiltersCount = [searchQuery, statusFilter !== 'all'].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="relative min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <CustomerSidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                  <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
                  <p className="mt-1 text-sm text-neutral-600">
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button onClick={() => navigate('/products')}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mt-4 lg:mt-6">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by order number or product..."
                className="rounded-lg py-6 pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {error ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Failed to Load Orders</h2>
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-neutral-500 mb-6">
                We couldn't load your orders. This may be due to a connection issue.
              </p>
              <Button onClick={() => fetchOrders()}>
                <Loader2 className="h-4 w-4 mr-2" />
                Retry Loading Orders
              </Button>
            </Card>
          ) : (
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Filters Sidebar */}
              {showFilters && (
                <aside className="w-full flex-shrink-0 lg:w-64">
                  <div className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-6 lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-6">
                      <h2 className="font-semibold text-lg">Filters</h2>
                      {activeFiltersCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear All
                        </Button>
                      )}
                    </div>

                    {/* Active Filters */}
                    {activeFiltersCount > 0 && (
                      <div className="mb-6">
                        <Label className="text-sm font-medium mb-2 block">Active Filters</Label>
                        <div className="flex flex-wrap gap-2">
                          {statusFilter !== 'all' && (
                            <Badge variant="secondary" className="gap-1">
                              {statusOptions.find(s => s.value === statusFilter)?.label}
                              <button onClick={() => setStatusFilter('all')}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )}
                          {searchQuery && (
                            <Badge variant="secondary" className="gap-1">
                              Search: {searchQuery.substring(0, 10)}...
                              <button onClick={() => setSearchQuery('')}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status Filter */}
                    <div className="mb-6">
                      <Label className="text-sm font-medium mb-3 block">Order Status</Label>
                      <div className="space-y-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => setStatusFilter(status.value)}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                              (statusFilter === status.value || (!statusFilter && status.value === 'all'))
                                ? 'bg-cyan-50 text-cyan-700 font-medium'
                                : 'hover:bg-neutral-50 text-neutral-700'
                            )}
                          >
                            <span>{status.label}</span>
                            <span className="text-neutral-500">({status.count})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="pt-6 border-t">
                      <Label className="text-sm font-medium mb-3 block">Summary</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Total Orders</span>
                          <span className="font-semibold">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Active</span>
                          <span className="font-semibold text-blue-600">{stats.active}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Delivered</span>
                          <span className="font-semibold text-green-600">{stats.delivered}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>
              )}

              {/* Orders Area */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>

                  <Select value="recent" onValueChange={() => {}}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="amount-high">Amount: High to Low</SelectItem>
                      <SelectItem value="amount-low">Amount: Low to High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Orders List */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                      {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                    </h2>
                    <p className="text-neutral-600 mb-6">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Start shopping to place your first order!'}
                    </p>
                    <Button onClick={() => navigate('/products')}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Browse Products
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <Card
                        key={order.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <div className="p-6">
                          {/* Order Header */}
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                                <Badge className={`${getStatusBadgeClass(order.orderStatus)} border px-2 py-0.5 text-xs font-medium`}>
                                  {STATUS_LABELS[order.orderStatus]}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(order.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Package className="h-4 w-4" />
                                  <span>
                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CreditCard className="h-4 w-4" />
                                  <span className="capitalize">{order.paymentMethod.replace('-', ' ')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-neutral-600 mb-1">Total Amount</p>
                              <p className="text-2xl font-bold text-cyan-500">
                                {formatCurrency(order.totalAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="space-y-3 mb-4">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-neutral-100 rounded flex-shrink-0 overflow-hidden">
                                  {item.productImage ? (
                                    <img
                                      src={item.productImage}
                                      alt={item.productName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-6 w-6 text-neutral-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{item.productName}</p>
                                  <p className="text-sm text-neutral-600">
                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                  </p>
                                </div>
                                <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-sm text-neutral-500 italic">
                                + {order.items.length - 2} more {order.items.length - 2 === 1 ? 'item' : 'items'}
                              </p>
                            )}
                          </div>

                          {/* Shipping Address */}
                          <div className="flex items-start gap-2 text-sm text-neutral-600 mb-4">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-neutral-900">{order.shippingAddress.fullName}</p>
                              <p>
                                {order.shippingAddress.address}, {order.shippingAddress.city}
                              </p>
                              <p>{order.shippingAddress.region}</p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/orders/${order.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation Overlay */}
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
