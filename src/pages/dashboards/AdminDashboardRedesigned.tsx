/**
 * Admin Dashboard - Redesigned
 * Platform oversight, analytics, user management
 * Google Stitch-inspired design - October 2025
 */

import { useAdminStats } from '@/hooks/useAdminStats';
import { AdminDashboardAlerts } from '@/components/admin/AdminDashboardAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Loader2, 
  Package, 
  ShoppingBag, 
  Calendar, 
  Store,
  Clock,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';

export function AdminDashboardRedesigned() {
  const { totalUsers, activeBookings, totalRevenue, averageResponseTime, loading } = useAdminStats();
  const navigate = useNavigate();

  return (
    <AdminLayout
      title="Dashboard Overview"
      subtitle="Here's a summary of your key metrics and alerts."
    >
      <div className="space-y-6">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Total Users</p>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : (
                  <p className="text-3xl font-bold text-neutral-900">{totalUsers}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Active Bookings</p>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                ) : (
                  <p className="text-3xl font-bold text-neutral-900">{activeBookings}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Total Revenue</p>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                ) : (
                  <p className="text-3xl font-bold text-neutral-900">{formatCurrency(totalRevenue)}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Avg. Response Time</p>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                ) : (
                  <p className="text-3xl font-bold text-neutral-900">{averageResponseTime}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Alerts Section */}
        <div>
          <AdminDashboardAlerts />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Management Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Management</CardTitle>
              <CardDescription>Manage users, suppliers, and platform operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4 px-4 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={() => navigate('/dashboard/admin/users')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-neutral-900">User Management</p>
                    <p className="text-sm text-neutral-600">Manage customers, technicians, suppliers</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4 px-4 hover:bg-green-50 hover:border-green-200 transition-colors"
                onClick={() => navigate('/dashboard/admin/suppliers')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                    <Store className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-neutral-900">Supplier Management</p>
                    <p className="text-sm text-neutral-600">Manage and approve supplier accounts</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4 px-4 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                onClick={() => navigate('/dashboard/admin/bookings')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-neutral-900">Bookings Management</p>
                    <p className="text-sm text-neutral-600">View and manage service bookings</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400" />
              </Button>
            </CardContent>
          </Card>

          {/* E-Commerce Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">E-Commerce</CardTitle>
              <CardDescription>Manage products, orders, and inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4 px-4 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                onClick={() => navigate('/dashboard/admin/ecommerce/products')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100">
                    <Package className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-neutral-900">Manage Products</p>
                    <p className="text-sm text-neutral-600">Add, edit, delete products & images</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4 px-4 hover:bg-orange-50 hover:border-orange-200 transition-colors"
                onClick={() => navigate('/dashboard/admin/ecommerce/orders')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
                    <ShoppingBag className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-neutral-900">Manage Orders</p>
                    <p className="text-sm text-neutral-600">View & update customer orders</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4 px-4 hover:bg-slate-50 hover:border-slate-200 transition-colors"
                onClick={() => navigate('/products')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100">
                    <Package className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-neutral-900">View Catalog</p>
                    <p className="text-sm text-neutral-600">Browse all products</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-100">
                    <BarChart3 className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Analytics</h3>
                    <p className="text-sm text-neutral-600">Platform performance and metrics</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard/admin/analytics')}
                  className="hover:bg-cyan-50"
                >
                  <ArrowRight className="h-5 w-5 text-cyan-600" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                    <Settings className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Platform Settings</h3>
                    <p className="text-sm text-neutral-600">Configure platform settings</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard/admin/settings')}
                  className="hover:bg-slate-50"
                >
                  <ArrowRight className="h-5 w-5 text-slate-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
