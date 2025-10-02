/**
 * Customer Dashboard
 * Book services, shop products, track orders
 */

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Snowflake, ShoppingCart, Calendar, Package } from 'lucide-react';

export function CustomerDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Snowflake className="h-8 w-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Customer Portal</h1>
                <p className="text-sm text-neutral-600">Welcome back, {profile?.displayName}!</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Book Service */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-500" />
                Book Service
              </CardTitle>
              <CardDescription>
                Schedule AC maintenance, repair, or installation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Book Now</Button>
            </CardContent>
          </Card>

          {/* Shop Products */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-accent-500" />
                Shop Products
              </CardTitle>
              <CardDescription>
                Browse AC units, spare parts, and accessories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Browse Catalog
              </Button>
            </CardContent>
          </Card>

          {/* Track Orders */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-success" />
                Track Orders
              </CardTitle>
              <CardDescription>
                View service bookings and product orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Orders
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest bookings and purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-500 text-center py-8">
              No recent activity. Start by booking a service or shopping for products!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
