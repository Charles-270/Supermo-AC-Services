/**
 * Supplier Dashboard Overview
 * Main overview page for supplier dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  getSupplierWithStats,
  getSupplierOrders,
  getSupplierCatalog,
} from '@/services/supplierService';
import {
  updateOrderStatus,
  updateTrackingNumber,
  updateSupplierAssignmentStatus,
} from '@/services/productService';
import type { Order, SupplierCatalogItem, OrderStatus } from '@/types/product';
import { SupplierLayout } from '@/components/layout/SupplierLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertCircle, 
  Info, 
  X, 
  ExternalLink,
  MoreHorizontal,
  Loader2,
  Package
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface SupplierStats {
  totalProducts: number;
  lowStock: number;
  pendingOrders: number;
  totalRevenue: number;
}

export function SupplierOverview() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const supplierId = profile?.uid;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [catalog, setCatalog] = useState<SupplierCatalogItem[]>([]);
  const [stats, setStats] = useState<SupplierStats>({
    totalProducts: 0,
    lowStock: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  // Dismissible banners state
  const [policyBannerDismissed, setPolicyBannerDismissed] = useState(false);
  const [lowStockBannerDismissed, setLowStockBannerDismissed] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!supplierId) return;

    try {
      setLoading(true);
      const [supplierStats, supplierOrders, catalogItems] = await Promise.all([
        getSupplierWithStats(supplierId),
        getSupplierOrders(supplierId, 5), // Get recent 5 orders
        getSupplierCatalog(supplierId),
      ]);

      const catalogList = catalogItems as SupplierCatalogItem[];
      const orderList = supplierOrders as Order[];

      const totalProducts = catalogList.length;
      const lowStock = catalogList.filter((item) => item.stockQuantity <= 5).length;
      const pendingOrders = orderList.filter((order) =>
        ['pending-payment', 'payment-confirmed', 'processing'].includes(order.orderStatus)
      ).length;

      setCatalog(catalogList);
      setOrders(orderList);
      setStats({
        totalProducts,
        lowStock,
        pendingOrders,
        totalRevenue: supplierStats?.totalRevenue ?? 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Failed to load dashboard data',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    if (supplierId) {
      void loadDashboardData();
    }
  }, [supplierId, loadDashboardData]);

  const getOrderStatusBadge = (status: Order['orderStatus']) => {
    const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' }> = {
      'pending-payment': { label: 'Pending', variant: 'secondary' },
      'payment-confirmed': { label: 'Pending', variant: 'secondary' },
      'processing': { label: 'Pending', variant: 'secondary' },
      'shipped': { label: 'Shipped', variant: 'default' },
      'delivered': { label: 'Delivered', variant: 'default' },
      'cancelled': { label: 'Cancelled', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const lowStockProducts = catalog.filter(item => item.stockQuantity <= 5);

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Extract<OrderStatus, 'shipped' | 'delivered'>
  ) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, status);

      if (status === 'shipped') {
        await updateTrackingNumber(orderId, 'Awaiting carrier');
      }

      // Sync supplier assignment status to "fulfilled" when order is shipped or delivered
      if (supplierId) {
        await updateSupplierAssignmentStatus(orderId, supplierId, 'fulfilled');
      }

      toast({
        title: 'Order updated',
        description: `Order marked as ${status}.`,
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Update failed',
        description: 'Unable to update order status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {profile?.metadata?.companyName || profile?.displayName || 'Supplier'}
          </p>
        </div>

        {/* Policy Update Banner */}
        {!policyBannerDismissed && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Policy updates platform commission & maintenance fees.
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    Following the discontinuation of the main payment gateway charges, we are unifying all our fees into a single commission. 
                    This adjustment simplifies the fee structure, offering you a clear, predictable cost model.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPolicyBannerDismissed(true)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.lowStock}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingOrders}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && !lowStockBannerDismissed && (
          <Card className="border-yellow-200 bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => navigate('/dashboard/supplier/products?filter=low-stock')}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    Low stock alert: {lowStockProducts.length} products are below 5 units.
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Click to view and update quantities to avoid halting orders.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLowStockBannerDismissed(true);
                  }}
                  className="text-yellow-600 hover:text-yellow-800 p-1"
                  aria-label="Dismiss low stock alert"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent orders</CardTitle>
                <CardDescription>
                  An overview of your most recent incoming orders.
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => navigate('/orders')}
              >
                View all orders
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent orders found.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ORDER ID</TableHead>
                        <TableHead>CUSTOMER</TableHead>
                        <TableHead>ITEMS</TableHead>
                        <TableHead>TOTAL</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-sm text-gray-500">{order.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell>{order.items.length}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            {getOrderStatusBadge(order.orderStatus)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {['payment-confirmed', 'processing'].includes(order.orderStatus) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                  disabled={updatingOrderId === order.id}
                                  aria-label={`Mark order ${order.orderNumber} as shipped`}
                                >
                                  {updatingOrderId === order.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  Mark Shipped
                                </Button>
                              )}
                              {order.orderStatus === 'shipped' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                  disabled={updatingOrderId === order.id}
                                  aria-label={`Mark order ${order.orderNumber} as delivered`}
                                >
                                  {updatingOrderId === order.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  Mark Delivered
                                </Button>
                              )}
                              {!['payment-confirmed', 'processing', 'shipped'].includes(order.orderStatus) && (
                                <Button variant="ghost" size="sm" aria-label={`More actions for order ${order.orderNumber}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600 mt-1">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerPhone}</p>
                          </div>
                          {getOrderStatusBadge(order.orderStatus)}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{order.items.length} items</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                          {['payment-confirmed', 'processing'].includes(order.orderStatus) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                              disabled={updatingOrderId === order.id}
                              aria-label={`Mark order ${order.orderNumber} as shipped`}
                              className="w-full"
                            >
                              {updatingOrderId === order.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Mark Shipped
                            </Button>
                          )}
                          {order.orderStatus === 'shipped' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              disabled={updatingOrderId === order.id}
                              aria-label={`Mark order ${order.orderNumber} as delivered`}
                              className="w-full"
                            >
                              {updatingOrderId === order.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SupplierLayout>
  );
}