/**
 * Supplier Management Component
 * Admin interface to manage suppliers and their approval status
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Store,
  CheckCircle2,
  XCircle,
  Package,
  DollarSign,
  Clock,
  Mail,
  Phone,
} from 'lucide-react';
import {
  getAllSuppliersWithStats,
  approveSupplier,
  rejectSupplier,
  type SupplierWithProducts,
} from '@/services/supplierService';
import { formatCurrency, formatDate } from '@/lib/utils';

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<SupplierWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllSuppliersWithStats();
      setSuppliers(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (supplierId: string) => {
    setActionLoading(supplierId);
    setError(null);

    try {
      await approveSupplier(supplierId);
      await loadSuppliers(); // Refresh list
    } catch (err) {
      setError((err as Error).message || 'Failed to approve supplier');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (supplierId: string) => {
    setActionLoading(supplierId);
    setError(null);

    try {
      await rejectSupplier(supplierId);
      await loadSuppliers(); // Refresh list
    } catch (err) {
      setError((err as Error).message || 'Failed to reject supplier');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Supplier Management
        </CardTitle>
        <CardDescription>
          Manage supplier accounts and approve new supplier registrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-error bg-red-50">
            <XCircle className="h-4 w-4 text-error" />
            <AlertDescription className="text-error">{error}</AlertDescription>
          </Alert>
        )}

        {suppliers.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No suppliers registered yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.uid}
                className="border border-neutral-200 rounded-lg p-4 space-y-3"
              >
                {/* Supplier Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{supplier.displayName}</h3>
                      {supplier.isApproved ? (
                        <Badge className="bg-success-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-700">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Approval
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-neutral-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {supplier.email}
                      </div>
                      {supplier.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {supplier.phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Supplier Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Products</p>
                      <p className="font-semibold">{supplier.productCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-success-600" />
                    <div>
                      <p className="text-xs text-neutral-500">Total Revenue</p>
                      <p className="font-semibold">{formatCurrency(supplier.totalRevenue)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Joined</p>
                      <p className="font-semibold">{formatDate(supplier.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {supplier.isApproved ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(supplier.uid)}
                      disabled={actionLoading === supplier.uid}
                      className="border-error text-error hover:bg-red-50"
                    >
                      {actionLoading === supplier.uid ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Suspend
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(supplier.uid)}
                        disabled={actionLoading === supplier.uid}
                        className="bg-success-600 hover:bg-success-700"
                      >
                        {actionLoading === supplier.uid ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(supplier.uid)}
                        disabled={actionLoading === supplier.uid}
                        className="border-error text-error hover:bg-red-50"
                      >
                        {actionLoading === supplier.uid ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" className="ml-auto">
                    View Products ({supplier.productCount})
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Total Suppliers: {suppliers.length}</span>
            <span>
              Approved: {suppliers.filter((s) => s.isApproved).length} | Pending:{' '}
              {suppliers.filter((s) => !s.isApproved).length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
