/**
 * Admin Dashboard
 * Platform oversight, analytics, user management
 */

import { useAuth } from '@/hooks/useAuth';
import { useAdminStats } from '@/hooks/useAdminStats';
import { AdminDashboardAlerts } from '@/components/admin/AdminDashboardAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, BarChart3, Settings, Loader2, Package, Edit, ShoppingBag, Calendar, Store } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const { totalUsers, activeBookings, totalRevenue, averageResponseTime, loading } = useAdminStats();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Admin Console</h1>
                <p className="text-sm text-neutral-600">Welcome, {profile?.displayName}!</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                ) : (
                  totalUsers
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Bookings</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                ) : (
                  activeBookings
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                ) : (
                  formatCurrency(totalRevenue)
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg. Response Time</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                ) : (
                  averageResponseTime
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Priority Alerts Section */}
        <div className="mb-8">
          <AdminDashboardAlerts />
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-500" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage customers, technicians, suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/admin/manage-users')}>
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent-500" />
                Analytics
              </CardTitle>
              <CardDescription>
                Platform performance and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/admin/analytics')}>
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-neutral-600" />
                Platform Settings
              </CardTitle>
              <CardDescription>
                Configure platform settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => navigate('/admin/settings')}>
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Product & Order Management Tools */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-500" />
              E-Commerce Management
            </CardTitle>
            <CardDescription>
              Manage products, orders, images, and inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate('/admin/manage-products')}
                variant="default"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2"
              >
                <Edit className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold text-lg">Manage Products</div>
                  <div className="text-sm opacity-90">Add, edit, delete products & images</div>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/admin/manage-orders')}
                variant="default"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2 bg-accent-500 hover:bg-accent-600"
              >
                <ShoppingBag className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold text-lg">Manage Orders</div>
                  <div className="text-sm opacity-90">View & update customer orders</div>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col items-center gap-2"
              >
                <Package className="h-8 w-8 text-primary-500" />
                <div className="text-center">
                  <div className="font-semibold text-lg">View Catalog</div>
                  <div className="text-sm text-neutral-500">Browse all products</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Supplier & Bookings Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-success-600" />
                Supplier Management
              </CardTitle>
              <CardDescription>
                Manage and approve supplier accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate('/admin/manage-suppliers')}
              >
                Manage Suppliers
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-warning-600" />
                Bookings Management
              </CardTitle>
              <CardDescription>
                View and manage service bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate('/admin/manage-bookings')}
              >
                Manage Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
