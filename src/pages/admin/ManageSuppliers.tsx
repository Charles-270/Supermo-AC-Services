/**
 * Manage Suppliers Page - Redesigned
 * Admin interface to manage all suppliers and their approval status
 * Google Stitch-inspired design - October 2025
 */

import { SupplierManagement } from '@/components/admin/SupplierManagement';
import { AdminLayout } from '@/components/layout/AdminLayout';

export function ManageSuppliers() {
  return (
    <AdminLayout
      title="Manage Suppliers"
      subtitle="Approve suppliers and manage supplier accounts"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'Suppliers' }
      ]}
    >
      <SupplierManagement />
    </AdminLayout>
  );
}
