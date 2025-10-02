/**
 * Landing Page
 * Public homepage with login/register options
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Snowflake, Calendar, ShoppingCart, GraduationCap, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

export function LandingPage() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<'login' | 'register'>('login');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && profile) {
      navigate(`/dashboard/${profile.role}`);
    }
  }, [user, profile, navigate]);

  const openAuthDialog = (tab: 'login' | 'register') => {
    setAuthDialogTab(tab);
    setAuthDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Snowflake className="h-8 w-8 text-primary-500" />
              <h1 className="text-2xl font-bold text-primary-600">Supremo AC Services</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => openAuthDialog('login')}>
                Sign In
              </Button>
              <Button onClick={() => openAuthDialog('register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
          Ghana's Premier HVAC Service Platform
        </h2>
        <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
          Book services, shop AC units, access training courses, and manage your HVAC needs - all in one place
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" onClick={() => openAuthDialog('register')}>
            Create Account
          </Button>
          <Button size="lg" variant="outline" onClick={() => openAuthDialog('login')}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center text-neutral-900 mb-12">
          Everything You Need for HVAC Services
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Online Booking */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary-500" />
                Online Booking
              </CardTitle>
              <CardDescription>
                Schedule AC maintenance, repairs, and installations instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Book services 24/7 with real-time technician availability. Track your booking from start to finish.
              </p>
            </CardContent>
          </Card>

          {/* E-Commerce */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-accent-500" />
                AC Units & Parts
              </CardTitle>
              <CardDescription>
                Shop for air conditioners and genuine spare parts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Browse our catalog of AC units, filters, remotes, and more. Competitive prices with warranty.
              </p>
            </CardContent>
          </Card>

          {/* Training */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-success" />
                Training Portal
              </CardTitle>
              <CardDescription>
                Learn HVAC skills and earn certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Access professional training courses, video tutorials, and earn industry-recognized certificates.
              </p>
            </CardContent>
          </Card>

          {/* Live Support */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-warning" />
                24/7 Live Chat
              </CardTitle>
              <CardDescription>
                Get instant support from our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Real-time chat support for booking assistance, technical questions, and customer service.
              </p>
            </CardContent>
          </Card>

          {/* For Technicians */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>For Technicians</CardTitle>
              <CardDescription>
                Manage jobs and grow your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Receive job assignments, communicate with customers, and track your performance metrics.
              </p>
            </CardContent>
          </Card>

          {/* For Suppliers */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>For Suppliers</CardTitle>
              <CardDescription>
                Sell products and manage inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                List your products, manage stock levels, fulfill orders, and grow your revenue.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white border-t border-neutral-200 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-neutral-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-neutral-600 mb-8">
            Join hundreds of customers, technicians, and suppliers on Ghana's leading HVAC platform
          </p>
          <Button size="lg" onClick={() => openAuthDialog('register')}>
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Snowflake className="h-6 w-6" />
            <span className="text-lg font-semibold">Supremo AC Services</span>
          </div>
          <p className="text-neutral-400 text-sm">
            © 2025 Supremo AC Services. Providing quality HVAC solutions across Ghana.
          </p>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultTab={authDialogTab}
      />
    </div>
  );
}
