/**
 * Supplier Management Component
 * Admin interface to manage suppliers and their approval status
 */

import { useState, useEffect, useCallback } from 'react';
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
  Trash2,
} from 'lucide-react';
import {
  getAllSuppliersWithStats,
  getSupplierCatalog,
  setSupplierCatalogItemStatus,
  approveSupplier,
  rejectSupplier,
  type SupplierWithProducts,
} from '@/services/supplierService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteProduct } from '@/services/productService';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import type { SupplierCatalogItem } from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PLATFORM_SERVICE_FEE_RATE = 0.02;
const PLATFORM_MAINTENANCE_FEE_RATE = 0.01;
const PLATFORM_TOTAL_FEE_RATE = PLATFORM_SERVICE_FEE_RATE + PLATFORM_MAINTENANCE_FEE_RATE;
interface SupplierCatalogState {
  loading: boolean;
  error: string | null;
  items: SupplierCatalogItem[];
}

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<SupplierWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [catalogState, setCatalogState] = useState<Record<string, SupplierCatalogState>>({});
  const [catalogActionLoading, setCatalogActionLoading] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithProducts | null>(null);

  const formatCategoryLabel = (category?: SupplierCatalogItem['category']) =>
    category ? category.replace(/-/g, ' ') : 'Uncategorized';

  const formatCatalogStatus = (status: SupplierCatalogItem['status']) =>
    status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');

  const getCatalogStatusBadgeClass = (status: SupplierCatalogItem['status']) => {
    switch (status) {
      case 'active':
        return 'border-success-500 text-success-700';
      case 'pending':
        return 'border-amber-500 text-amber-700';
      case 'inactive':
        return 'border-neutral-400 text-neutral-600';
      case 'rejected':
        return 'border-red-500 text-red-700';
      default:
        return 'border-neutral-300 text-neutral-600';
    }
  };

  const resolveBasePrice = (item: SupplierCatalogItem): number => {
    if (typeof item.basePrice === 'number') {
      return item.basePrice;
    }

    if (item.status === 'active') {
      return parseFloat(
        (item.price / (1 + PLATFORM_TOTAL_FEE_RATE)).toFixed(2)
      );
    }

    return item.price;
  };

  const applyPlatformFees = (price: number): number =>
    parseFloat((price * (1 + PLATFORM_TOTAL_FEE_RATE)).toFixed(2));

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

  const loadSupplierCatalog = useCallback(async (supplierId: string) => {
    setCatalogState((prev) => ({
      ...prev,
      [supplierId]: {
        items: prev[supplierId]?.items ?? [],
        loading: true,
        error: null,
      },
    }));

    try {
      const catalogItems = await getSupplierCatalog(supplierId);
      setCatalogState((prev) => ({
        ...prev,
        [supplierId]: {
          items: catalogItems,
          loading: false,
          error: null,
        },
      }));
    } catch (err) {
      setCatalogState((prev) => ({
        ...prev,
        [supplierId]: {
          items: prev[supplierId]?.items ?? [],
          loading: false,
          error: (err as Error).message || 'Failed to load supplier catalog',
        },
      }));
    }
  }, []);

  const openSupplierDetails = useCallback(
    (supplier: SupplierWithProducts) => {
      setSelectedSupplier(supplier);
      setDetailsOpen(true);
      void loadSupplierCatalog(supplier.uid);
    },
    [loadSupplierCatalog]
  );

  const handleCatalogStatusChange = async (
    itemId: string,
    status: SupplierCatalogItem['status']
  ) => {
    if (!selectedSupplier) return;

    setCatalogActionLoading(itemId);
    try {
      await setSupplierCatalogItemStatus(itemId, status);
      toast({
        title: status === 'active' ? 'Product approved' : 'Product rejected',
        description:
          status === 'active'
            ? 'The product is now available in the store.'
            : 'The supplier has been notified of the rejection.',
      });
      await loadSupplierCatalog(selectedSupplier.uid);
    } catch (err) {
      toast({
        title: 'Update failed',
        description: (err as Error).message || 'Could not update product status.',
        variant: 'destructive',
      });
      setCatalogState((prev) => ({
        ...prev,
        [selectedSupplier.uid]: {
          items: prev[selectedSupplier.uid]?.items ?? [],
          loading: false,
          error: (err as Error).message || 'Failed to update product status',
        },
      }));
    } finally {
      setCatalogActionLoading(null);
    }
  };

  const handleRemoveApprovedProduct = async (item: SupplierCatalogItem) => {
    if (!selectedSupplier) return;

    const confirmed = window.confirm(
      `Remove "${item.productName}" from the storefront? This will hide the product from customers.`
    );

    if (!confirmed) {
      return;
    }

    setCatalogActionLoading(item.id);
    try {
      if (item.productId) {
        await deleteProduct(item.productId);
      }

      await setSupplierCatalogItemStatus(item.id, 'inactive', { productId: null });

      await addDoc(collection(db, 'notifications'), {
        userId: selectedSupplier.uid,
        type: 'supplier-product-removed',
        title: 'Product removed from shop',
        message: `Your product "${item.productName}" has been removed from the Supremo AC storefront by an administrator.`,
        data: {
          catalogItemId: item.id,
          productId: item.productId ?? null,
          reason: 'Removed by administrator',
        },
        actionURL: '/dashboard/supplier/catalog',
        read: false,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Product removed from shop',
        description: `${item.productName} is no longer visible in the store. The supplier has been notified.`,
      });

      await loadSupplierCatalog(selectedSupplier.uid);
    } catch (err) {
      toast({
        title: 'Removal failed',
        description: (err as Error).message || 'Could not remove the product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCatalogActionLoading(null);
    }
  };

  const handleRefreshCatalog = () => {
    if (selectedSupplier) {
      void loadSupplierCatalog(selectedSupplier.uid);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDetailsOpen(open);
    if (!open) {
      setSelectedSupplier(null);
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

  const selectedCatalog = selectedSupplier ? catalogState[selectedSupplier.uid] : undefined;
  const visibleCatalogItems = selectedCatalog
    ? selectedCatalog.items.filter((item) => item.status !== 'inactive')
    : [];
  const totalInventoryUnits =
    visibleCatalogItems.reduce((total, item) => total + (item.stockQuantity ?? 0), 0) ?? 0;
  const pendingItemsCount =
    visibleCatalogItems.filter((item) => item.status === 'pending').length ?? 0;
  const statusOrder: Record<SupplierCatalogItem['status'], number> = {
    pending: 0,
    active: 1,
    inactive: 2,
    rejected: 3,
  };
  const orderedCatalogItems =
    visibleCatalogItems.length > 0
      ? [...visibleCatalogItems].sort(
          (a, b) =>
            statusOrder[a.status] - statusOrder[b.status] ||
            a.productName.localeCompare(b.productName, undefined, { sensitivity: 'base' })
        )
      : [];

  return (
    <>
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
            {suppliers.map((supplier) => {
              const catalogInfo = catalogState[supplier.uid];
              const isCurrentSelection = selectedSupplier?.uid === supplier.uid && detailsOpen;
              const isLoadingCatalog = isCurrentSelection && catalogInfo?.loading;

              return (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 py-3 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary-500" />
                      <div>
                        <p className="text-xs text-neutral-500">Linked Products</p>
                        <p className="font-semibold">{supplier.productCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="text-xs text-neutral-500">Inventory Units</p>
                        <p className="font-semibold">{supplier.inventoryQuantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="text-xs text-neutral-500">Store Listings</p>
                        <p className="font-semibold">{supplier.catalogCount}</p>
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
                        <p className="text-xs text-neutral-500">Last Active</p>
                        <p className="font-semibold">{formatDateTime(supplier.lastActive)}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Joined {formatDate(supplier.createdAt)}
                        </p>
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
                          className="bg-success-600 hover:bg-success-700 text-white"
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto flex items-center gap-2"
                      onClick={() => openSupplierDetails(supplier)}
                      disabled={isLoadingCatalog}
                    >
                      {isLoadingCatalog ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'View Details'
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
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

      <Dialog open={detailsOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div>
            <DialogTitle>Supplier catalogue</DialogTitle>
            <DialogDescription>
              Review store listings and pending approvals for your suppliers.
            </DialogDescription>
            <p className="text-xs text-neutral-500 mt-1">
              Approving a product automatically adds a 2% service fee and 1% maintenance fee to the shop price.
            </p>
          </div>
        </DialogHeader>

        {selectedSupplier ? (
          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-neutral-900">{selectedSupplier.displayName}</p>
                <p className="text-sm text-neutral-600">{selectedSupplier.email}</p>
                {selectedSupplier.phoneNumber && (
                  <p className="text-sm text-neutral-600">{selectedSupplier.phoneNumber}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-neutral-600">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Store listings</p>
                  <p className="font-semibold text-neutral-900">{selectedSupplier.catalogCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Inventory units</p>
                  <p className="font-semibold text-neutral-900">{totalInventoryUnits}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Pending approvals</p>
                  <p className="font-semibold text-amber-700">{pendingItemsCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Total revenue</p>
                  <p className="font-semibold text-success-700">{formatCurrency(selectedSupplier.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshCatalog}
                disabled={!selectedSupplier || selectedCatalog?.loading}
              >
                {selectedCatalog?.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh Catalog'
                )}
              </Button>
            </div>

            {selectedCatalog?.error && (
              <Alert className="border-error bg-red-50">
                <XCircle className="h-4 w-4 text-error" />
                <AlertDescription className="text-error">{selectedCatalog.error}</AlertDescription>
              </Alert>
            )}

            {selectedCatalog?.loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-500 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                <p className="text-sm">Loading supplier catalogue...</p>
              </div>
            ) : orderedCatalogItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-200 py-12 text-center text-neutral-500">
                No products submitted to the store yet.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-2 max-h-[55vh]">
                {orderedCatalogItems.map((item) => {
                  const basePrice = resolveBasePrice(item);
                  const platformPrice = applyPlatformFees(basePrice);
                  const showFeeDetails =
                    Math.abs(platformPrice - basePrice) > 0.01;

                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-base font-semibold text-neutral-900">{item.productName}</p>
                          <p className="text-xs uppercase tracking-wide text-neutral-500">
                            {formatCategoryLabel(item.category)}
                          </p>
                        </div>
                        <Badge variant="outline" className={getCatalogStatusBadgeClass(item.status)}>
                          {formatCatalogStatus(item.status)}
                        </Badge>
                      </div>

                      {item.images && item.images.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto">
                          {item.images.map((url) => (
                            <div
                              key={url}
                              className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200"
                            >
                              <img
                                src={url}
                                alt={`${item.productName} preview`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid gap-2 text-sm text-neutral-600 md:grid-cols-2">
                        <div>
                          <span className="font-semibold text-neutral-900">
                            {formatCurrency(platformPrice)}
                          </span>
                          <span className="text-neutral-500"> • Stock {item.stockQuantity}</span>
                        </div>
                        <div className="text-neutral-500">
                          Updated {formatDate(item.updatedAt)} • Submitted {formatDate(item.createdAt)}
                        </div>
                        {showFeeDetails && (
                          <p className="text-xs text-neutral-500 md:col-span-2">
                            Supplier price {formatCurrency(basePrice)} + platform fees (2% service + 1% maintenance) ={' '}
                            {formatCurrency(platformPrice)}
                          </p>
                        )}
                      </div>

                      {item.notes && (
                        <p className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
                          {item.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        {item.status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              className="bg-success-600 hover:bg-success-700 text-white"
                              onClick={() => void handleCatalogStatusChange(item.id, 'active')}
                              disabled={catalogActionLoading === item.id}
                            >
                              {catalogActionLoading === item.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-error text-error hover:bg-red-50"
                              onClick={() => void handleCatalogStatusChange(item.id, 'rejected')}
                              disabled={catalogActionLoading === item.id}
                            >
                              {catalogActionLoading === item.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                              )}
                              Reject
                            </Button>
                          </>
                        ) : item.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-error text-error hover:bg-red-50"
                            onClick={() => void handleRemoveApprovedProduct(item)}
                            disabled={catalogActionLoading === item.id}
                          >
                            {catalogActionLoading === item.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Remove from Shop
                          </Button>
                        ) : item.status === 'inactive' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleCatalogStatusChange(item.id, 'active')}
                            disabled={catalogActionLoading === item.id}
                          >
                            {catalogActionLoading === item.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Reactivate
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center text-neutral-500">
            Select a supplier to review their catalogue entries.
          </div>
        )}
        </DialogContent>
      </Dialog>
    </>
  );
}
