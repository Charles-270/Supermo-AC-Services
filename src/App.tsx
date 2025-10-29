/**
 * Main App Component
 * React Router with protected routes for 5 user dashboards
 * Uses lazy loading for optimal performance - only loads routes when needed
 */

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { initAnalytics } from '@/lib/firebase';

// Eager load only the landing page (first page users see)
import { LandingPage } from '@/pages/LandingPage';

// Lazy load all other pages - they'll load only when navigated to
const PendingApproval = lazy(() => import('@/pages/PendingApproval').then(m => ({ default: m.PendingApproval })));
const CustomerDashboard = lazy(() => import('@/pages/dashboards/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const TechnicianOverview = lazy(() => import('@/pages/dashboards/TechnicianOverview').then(m => ({ default: m.TechnicianOverview })));
const SupplierOverview = lazy(() => import('@/pages/dashboards/SupplierOverview').then(m => ({ default: m.SupplierOverview })));
const SupplierProducts = lazy(() => import('@/pages/dashboards/SupplierProducts').then(m => ({ default: m.SupplierProducts })));
const SupplierSettings = lazy(() => import('@/pages/dashboards/SupplierSettings').then(m => ({ default: m.SupplierSettings })));
const AdminDashboard = lazy(() => import('@/pages/dashboards/AdminDashboardRedesigned').then(m => ({ default: m.AdminDashboardRedesigned })));
const TraineeDashboard = lazy(() => import('@/pages/dashboards/TraineeDashboard').then(m => ({ default: m.TraineeDashboard })));
const JobDetail = lazy(() => import('@/pages/technician/JobDetail'));
const JobComplete = lazy(() => import('@/pages/technician/JobComplete'));
const JobsList = lazy(() => import('@/pages/technician/JobsList'));
const EarningsHistory = lazy(() => import('@/pages/technician/EarningsHistory'));
const TechnicianSettings = lazy(() => import('@/pages/dashboards/TechnicianSettings').then(m => ({ default: m.TechnicianSettings })));
const ProductCatalog = lazy(() => import('@/pages/products/ProductCatalogRedesigned').then(m => ({ default: m.ProductCatalogRedesigned })));
const ProductDetail = lazy(() => import('@/pages/products/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart = lazy(() => import('@/pages/cart/CartPage'));
const Checkout = lazy(() => import('@/pages/checkout/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderHistory = lazy(() => import('@/pages/orders/OrderHistoryRedesigned').then(m => ({ default: m.OrderHistoryRedesigned })));
const OrderDetails = lazy(() => import('@/pages/orders/OrderDetailsRedesigned').then(m => ({ default: m.OrderDetailsRedesigned })));
const UpdateProducts = lazy(() => import('@/pages/admin/UpdateProducts'));
const UploadImages = lazy(() => import('@/pages/admin/UploadImages'));
const RemoveDuplicates = lazy(() => import('@/pages/admin/RemoveDuplicates'));
const ClearImages = lazy(() => import('@/pages/admin/ClearImages'));
const ManageProducts = lazy(() => import('@/pages/admin/ManageProductsRedesigned'));
const ManageOrders = lazy(() => import('@/pages/admin/ManageOrders'));
const AdminCatalog = lazy(() => import('@/pages/admin/AdminCatalog'));
const ManageSuppliers = lazy(() => import('@/pages/admin/ManageSuppliers').then(m => ({ default: m.ManageSuppliers })));
const ManageBookings = lazy(() => import('@/pages/admin/ManageBookings').then(m => ({ default: m.ManageBookings })));
const BackfillTechnicianStats = lazy(() => import('@/pages/admin/BackfillTechnicianStats'));
const ManageUsers = lazy(() => import('@/pages/admin/ManageUsersRedesigned'));
const Analytics = lazy(() => import('@/pages/admin/Analytics'));
const PlatformSettings = lazy(() => import('@/pages/admin/PlatformSettings'));
const TestTechnicianSelector = lazy(() => import('@/pages/TestTechnicianSelector').then(m => ({ default: m.TestTechnicianSelector })));
const BookServicesPage = lazy(() => import('@/pages/BookServicesPage').then(m => ({ default: m.BookServicesPage })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  // Initialize Firebase Analytics after page renders (non-blocking)
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LandingPage />} />

          {/* Test Pages - Development Only */}
          <Route path="/test/technician-selector" element={<TestTechnicianSelector />} />

          {/* Pending Approval Route */}
          <Route
            path="/pending-approval"
            element={
              <ProtectedRoute>
                <PendingApproval />
              </ProtectedRoute>
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Booking Routes */}
          <Route
            path="/book-services"
            element={
              <ProtectedRoute requiredRole="customer">
                <BookServicesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/technician"
            element={
              <ProtectedRoute requiredRole="technician">
                <TechnicianOverview />
              </ProtectedRoute>
            }
          />

          {/* Technician Job Management */}
          <Route
            path="/technician/job/:jobId"
            element={
              <ProtectedRoute requiredRole="technician">
                <JobDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician/job/:jobId/complete"
            element={
              <ProtectedRoute requiredRole="technician">
                <JobComplete />
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician/jobs"
            element={
              <ProtectedRoute requiredRole="technician">
                <JobsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician/earnings"
            element={
              <ProtectedRoute requiredRole="technician">
                <EarningsHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/technician/settings"
            element={
              <ProtectedRoute requiredRole="technician">
                <TechnicianSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/supplier"
            element={
              <ProtectedRoute requiredRole="supplier">
                <SupplierOverview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/supplier/products"
            element={
              <ProtectedRoute requiredRole="supplier">
                <SupplierProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/supplier/settings"
            element={
              <ProtectedRoute requiredRole="supplier">
                <SupplierSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/trainee"
            element={
              <ProtectedRoute requiredRole="trainee">
                <TraineeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Utilities - Keep for development */}
          <Route
            path="/admin/update-products"
            element={
              <ProtectedRoute requiredRole="admin">
                <UpdateProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/upload-images"
            element={
              <ProtectedRoute requiredRole="admin">
                <UploadImages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/remove-duplicates"
            element={
              <ProtectedRoute requiredRole="admin">
                <RemoveDuplicates />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/clear-images"
            element={
              <ProtectedRoute requiredRole="admin">
                <ClearImages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/backfill-technician-stats"
            element={
              <ProtectedRoute requiredRole="admin">
                <BackfillTechnicianStats />
              </ProtectedRoute>
            }
          />

          {/* New Admin Routes with Sidebar */}
          <Route
            path="/dashboard/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin/ecommerce/products"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin/ecommerce/orders"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin/ecommerce/catalog"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminCatalog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin/suppliers"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageSuppliers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin/bookings"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <PlatformSettings />
              </ProtectedRoute>
            }
          />

          {/* Legacy Admin Routes - Redirect to new routes */}
          <Route
            path="/admin/manage-users"
            element={<Navigate to="/dashboard/admin/users" replace />}
          />

          <Route
            path="/admin/manage-products"
            element={<Navigate to="/dashboard/admin/ecommerce/products" replace />}
          />

          <Route
            path="/admin/manage-orders"
            element={<Navigate to="/dashboard/admin/ecommerce/orders" replace />}
          />

          <Route
            path="/admin/manage-suppliers"
            element={<Navigate to="/dashboard/admin/suppliers" replace />}
          />

          <Route
            path="/admin/manage-bookings"
            element={<Navigate to="/dashboard/admin/bookings" replace />}
          />

          <Route
            path="/admin/analytics"
            element={<Navigate to="/dashboard/admin/analytics" replace />}
          />

          <Route
            path="/admin/settings"
            element={<Navigate to="/dashboard/admin/settings" replace />}
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <PlatformSettings />
              </ProtectedRoute>
            }
          />

          {/* E-Commerce Routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductCatalog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/:productId"
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Order Management Routes */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
