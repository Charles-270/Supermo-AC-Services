/**
 * Main App Component
 * React Router with protected routes for 5 user dashboards
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { PendingApproval } from '@/pages/PendingApproval';
import { CustomerDashboard } from '@/pages/dashboards/CustomerDashboard';
import { TechnicianDashboard } from '@/pages/dashboards/TechnicianDashboard';
import { SupplierDashboard } from '@/pages/dashboards/SupplierDashboard';
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard';
import { TraineeDashboard } from '@/pages/dashboards/TraineeDashboard';
import JobDetail from '@/pages/technician/JobDetail';
import JobComplete from '@/pages/technician/JobComplete';
import { ProductCatalog } from '@/pages/products/ProductCatalog';
import { ProductDetail } from '@/pages/products/ProductDetail';
import { Cart } from '@/pages/products/Cart';
import { Checkout } from '@/pages/products/Checkout';
import { OrderSuccess } from '@/pages/products/OrderSuccess';
import { OrderHistory } from '@/pages/orders/OrderHistory';
import { OrderDetails } from '@/pages/orders/OrderDetails';
import UpdateProducts from '@/pages/admin/UpdateProducts';
import UploadImages from '@/pages/admin/UploadImages';
import RemoveDuplicates from '@/pages/admin/RemoveDuplicates';
import ClearImages from '@/pages/admin/ClearImages';
import ManageProducts from '@/pages/admin/ManageProducts';
import ManageOrders from '@/pages/admin/ManageOrders';
import ManageUsers from '@/pages/admin/ManageUsers';
import Analytics from '@/pages/admin/Analytics';
import PlatformSettings from '@/pages/admin/PlatformSettings';
import { TestTechnicianSelector } from '@/pages/TestTechnicianSelector';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
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

          <Route
            path="/dashboard/technician"
            element={
              <ProtectedRoute requiredRole="technician">
                <TechnicianDashboard />
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
            path="/dashboard/supplier"
            element={
              <ProtectedRoute requiredRole="supplier">
                <SupplierDashboard />
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

          {/* Admin Utilities */}
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
            path="/admin/manage-products"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/manage-orders"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/manage-users"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            }
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

          <Route
            path="/orders/:orderId/success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
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
        <Toaster />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
