/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Optionally checks for specific user roles
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/user';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If profile hasn't loaded yet but user exists, wait
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check if account is approved (for admin and technician roles)
  if (profile && !profile.isApproved && (profile.role === 'admin' || profile.role === 'technician')) {
    return <Navigate to="/pending-approval" replace />;
  }

  // If role is required, check if user has the role
  if (requiredRole && profile) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(profile.role)
      : profile.role === requiredRole;

    if (!hasRequiredRole) {
      // Redirect to user's appropriate dashboard
      return <Navigate to={`/dashboard/${profile.role}`} replace />;
    }
  }

  // If profile hasn't loaded yet but user exists, wait
  if (requiredRole && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
