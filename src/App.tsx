/**
 * Main App Component
 * React Router with protected routes for 5 user dashboards
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { PendingApproval } from '@/pages/PendingApproval';
import { CustomerDashboard } from '@/pages/dashboards/CustomerDashboard';
import { TechnicianDashboard } from '@/pages/dashboards/TechnicianDashboard';
import { SupplierDashboard } from '@/pages/dashboards/SupplierDashboard';
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard';
import { TraineeDashboard } from '@/pages/dashboards/TraineeDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LandingPage />} />

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

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
