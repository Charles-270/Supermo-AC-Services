/**
 * Supplier Dashboard
 * Manage catalog inventory, profile data, and workflow
 */

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getSupplierWithStats,
  getSupplierOrders,
  getSupplierProfile,
  updateSupplierProfile,
  getSupplierCatalog,
  addSupplierCatalogItem,
  updateSupplierCatalogItem,
  getStoreProductsForSupplier,
  type SupplierProfileUpdates,
} from '@/services/supplierService';
import {
  uploadSupplierCatalogImage,
  deleteSupplierCatalogImage,
  validateImageFile,
} from '@/services/storageService';
import {
  updateOrderStatus,
  updateTrackingNumber,
  updateSupplierAssignmentStatus,
} from '@/services/productService';
import type { Product, Order, SupplierCatalogItem, OrderStatus } from '@/types/product';
import { GHANA_REGIONS } from '@/types/product';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  AlertCircle,
  Plus,
  Loader2,
  Truck,
  Edit,
  Store,
  Settings,
  Bell,
  X,
  Upload,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface SupplierStats {
  totalProducts: number;
  lowStock: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface ProfileFormState {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  warehouseLocation: string;
  deliveryCapacityPerDay: string;
  fulfillmentRegions: string;
  fulfillmentLeadTimeDays: string;
  serviceRadiusKm: string;
  productCategories: string;
  notes: string;
}

interface EditableCatalogItem {
  id: string;
  price: string;
  stockQuantity: string;
  minimumOrderQuantity: string;
  leadTimeDays: string;
  deliveryRegions: string;
  notes: string;
}

interface NewCatalogState {
  productId: string;
  stockQuantity: string;
  price: string;
  minimumOrderQuantity: string;
  leadTimeDays: string;
  deliveryRegions: string;
  notes: string;
}

interface NewProductState {
  productName: string;
  category: string;
  stockQuantity: string;
  price: string;
  minimumOrderQuantity: string;
  leadTimeDays: string;
  deliveryRegions: string;
  notes: string;
}

interface LinkQueueItem {
  productId: string;
  productName: string;
  category: Product['category'];
  price: number;
  stockQuantity: number;
  minimumOrderQuantity: number | null;
  leadTimeDays: number | null;
  deliveryRegions: string[];
  notes?: string;
}

const MAX_NEW_PRODUCT_IMAGES = 5;

const DEFAULT_PROFILE: ProfileFormState = {
  companyName: '',
  contactEmail: '',
  contactPhone: '',
  warehouseLocation: '',
  deliveryCapacityPerDay: '',
  fulfillmentRegions: '',
  fulfillmentLeadTimeDays: '',
  serviceRadiusKm: '',
  productCategories: '',
  notes: '',
};

const DEFAULT_NEW_CATALOG: NewCatalogState = {
  productId: '',
  stockQuantity: '',
  price: '',
  minimumOrderQuantity: '',
  leadTimeDays: '',
  deliveryRegions: '',
  notes: '',
};

const PLATFORM_SERVICE_FEE_RATE = 0.02;
const PLATFORM_MAINTENANCE_FEE_RATE = 0.01;
const PLATFORM_TOTAL_FEE_RATE = PLATFORM_SERVICE_FEE_RATE + PLATFORM_MAINTENANCE_FEE_RATE;

const computeBasePriceFromPlatform = (price: number): number =>
  parseFloat((price / (1 + PLATFORM_TOTAL_FEE_RATE)).toFixed(2));



const DEFAULT_NEW_PRODUCT: NewProductState = {
  productName: '',
  category: 'split-ac',
  stockQuantity: '',
  price: '',
  minimumOrderQuantity: '',
  leadTimeDays: '',
  deliveryRegions: '',
  notes: '',
};

export function SupplierDashboard() {
  const { profile, signOut } = useAuth();
  const supplierId = profile?.uid;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SupplierStats>({
    totalProducts: 0,
    lowStock: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [catalog, setCatalog] = useState<SupplierCatalogItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(DEFAULT_PROFILE);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<EditableCatalogItem | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [newCatalogForm, setNewCatalogForm] = useState<NewCatalogState>(DEFAULT_NEW_CATALOG);
  const [newProductForm, setNewProductForm] = useState<NewProductState>(DEFAULT_NEW_PRODUCT);
  const [newProductImages, setNewProductImages] = useState<string[]>([]);
  const [uploadingNewProductImage, setUploadingNewProductImage] = useState(false);
  const [newProductImageProgress, setNewProductImageProgress] = useState(0);
  const [removingProductImage, setRemovingProductImage] = useState<string | null>(null);
  const newProductImageInputRef = useRef<HTMLInputElement | null>(null);
  const [linkQueue, setLinkQueue] = useState<LinkQueueItem[]>([]);
  const [submittingCatalog, setSubmittingCatalog] = useState(false);
  const [submittingNewProduct, setSubmittingNewProduct] = useState(false);

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [lowStockBannerDismissed, setLowStockBannerDismissed] = useState(false);
  const [pendingNotificationDismissed, setPendingNotificationDismissed] = useState(false);
  const [feeNoticeDismissed, setFeeNoticeDismissed] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!supplierId) {
      return;
    }

    try {
      setLoading(true);
      const [supplierStats, supplierOrders, catalogItems, supplierProfile, storeList] =
        await Promise.all([
          getSupplierWithStats(supplierId),
          getSupplierOrders(supplierId, 12),
          getSupplierCatalog(supplierId),
          getSupplierProfile(supplierId),
          getStoreProductsForSupplier(100),
        ]);

      const catalogList = catalogItems as SupplierCatalogItem[];
      const orderList = supplierOrders as Order[];

      console.log('✅ Supplier Dashboard loaded:', {
        storeProducts: (storeList as Product[]).length,
        catalogItems: catalogList.length,
        orders: orderList.length,
      });

      if ((storeList as Product[]).length > 0) {
        console.log('📦 Sample store product:', (storeList as Product[])[0]);
      } else {
        console.warn('⚠️ No products found in store. Add products via /admin/manage-products');
      }

      const totalProducts = catalogList.length;
      const lowStock = catalogList.filter((item) => item.stockQuantity <= 5).length;
      const pendingOrders = orderList.filter((order) =>
        ['pending-payment', 'payment-confirmed', 'processing'].includes(order.orderStatus)
      ).length;

      setCatalog(catalogList);
      setOrders(orderList);
      setStoreProducts(storeList as Product[]);
      setStats({
        totalProducts,
        lowStock,
        pendingOrders,
        totalRevenue: supplierStats?.totalRevenue ?? 0,
      });

      if (supplierProfile) {
        const metadata = supplierProfile.metadata ?? {};
        setProfileForm({
          companyName: metadata.companyName ?? '',
          contactEmail: metadata.contactEmail ?? '',
          contactPhone: metadata.contactPhone ?? '',
          warehouseLocation: metadata.warehouseLocation ?? '',
          deliveryCapacityPerDay:
            metadata.deliveryCapacityPerDay != null ? String(metadata.deliveryCapacityPerDay) : '',
          fulfillmentRegions: metadata.fulfillmentRegions?.join(', ') ?? '',
          fulfillmentLeadTimeDays:
            metadata.fulfillmentLeadTimeDays != null
              ? String(metadata.fulfillmentLeadTimeDays)
              : '',
          serviceRadiusKm:
            metadata.serviceRadiusKm != null ? String(metadata.serviceRadiusKm) : '',
          productCategories: metadata.productCategories?.join(', ') ?? '',
          notes: metadata.notes ?? '',
        });
      } else {
        setProfileForm(DEFAULT_PROFILE);
      }

      setLinkQueue([]);
      setLowStockBannerDismissed(false);
      setPendingNotificationDismissed(false);
    } catch (error) {
      console.error('Error loading supplier dashboard:', error);
      toast({
        title: 'Failed to load supplier data',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    if (supplierId) {
      void loadDashboard();
    }
  }, [supplierId, loadDashboard]);

  const isSupplier = profile?.role === 'supplier';

  const availableStoreProducts = useMemo(() => {
    const existingIds = new Set(
      catalog
        .map((item) => item.productId)
        .filter((id): id is string => Boolean(id))
    );

    const available = storeProducts.filter((product) => !existingIds.has(product.id));

    // Log availability for debugging
    console.log('🔗 Products available to link:', {
      total: storeProducts.length,
      alreadyLinked: existingIds.size,
      availableToLink: available.length
    });

    return available;
  }, [catalog, storeProducts]);
  const selectedStoreProduct = useMemo(
    () => storeProducts.find((product) => product.id === newCatalogForm.productId) ?? null,
    [storeProducts, newCatalogForm.productId]
  );

  const categoryOptions: Array<{ value: Product['category']; label: string }> = [
    { value: 'split-ac', label: 'Split AC' },
    { value: 'central-ac', label: 'Central AC' },
    { value: 'spare-parts', label: 'Spare parts' },
    { value: 'accessories', label: 'Accessories' },
  ];

  const lowStockCatalog = useMemo(
    () => catalog.filter((item) => item.stockQuantity <= 5),
    [catalog]
  );

  const pendingCatalog = useMemo(
    () => catalog.filter((item) => item.status === 'pending'),
    [catalog]
  );

  const parseNumberOrNull = (value: string) => {
    if (!value.trim()) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const parseRegions = (value: string) =>
    value
      .split(',')
      .map((region) => region.trim())
      .filter(Boolean);

  const handleProfileSave = async () => {
    if (!supplierId) {
      return;
    }

    const deliveryCapacity = parseNumberOrNull(profileForm.deliveryCapacityPerDay);
    const leadTime = parseNumberOrNull(profileForm.fulfillmentLeadTimeDays);
    const serviceRadius = parseNumberOrNull(profileForm.serviceRadiusKm);
    const fulfillmentRegions = parseRegions(profileForm.fulfillmentRegions);
    const productCategories = parseRegions(profileForm.productCategories);

    const payload: SupplierProfileUpdates = {
      companyName: profileForm.companyName.trim() || undefined,
      contactEmail: profileForm.contactEmail.trim() || undefined,
      contactPhone: profileForm.contactPhone.trim() || undefined,
      warehouseLocation: profileForm.warehouseLocation.trim() || undefined,
      deliveryCapacityPerDay: deliveryCapacity,
      fulfillmentRegions,
      fulfillmentLeadTimeDays: leadTime,
      serviceRadiusKm: serviceRadius,
      productCategories,
      notes: profileForm.notes.trim() || undefined,
    };

    try {
      setProfileSaving(true);
      await updateSupplierProfile(supplierId, payload);
      toast({
        title: 'Profile updated',
        description: 'Your business profile has been saved.',
      });
      setProfileDialogOpen(false);
    } catch (error) {
      console.error('Error updating supplier profile:', error);
      toast({
        title: 'Update failed',
        description: 'Unable to update your profile right now.',
        variant: 'destructive',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleOpenEditItem = (item: SupplierCatalogItem) => {
    setEditingItem({
      id: item.id,
      price: String(item.price ?? ''),
      stockQuantity: String(item.stockQuantity ?? ''),
      minimumOrderQuantity: item.minimumOrderQuantity != null ? String(item.minimumOrderQuantity) : '',
      leadTimeDays: item.leadTimeDays != null ? String(item.leadTimeDays) : '',
      deliveryRegions: item.deliveryRegions?.join(', ') ?? '',
      notes: item.notes ?? '',
    });
  };

  const handleSaveCatalogChanges = async () => {
    if (!editingItem) {
      return;
    }

    const price = parseNumberOrNull(editingItem.price);
    const stockQuantity = parseNumberOrNull(editingItem.stockQuantity);
    const minimumOrderQuantity = parseNumberOrNull(editingItem.minimumOrderQuantity);
    const leadTimeDays = parseNumberOrNull(editingItem.leadTimeDays);
    const deliveryRegions = parseRegions(editingItem.deliveryRegions);

    if (price == null || stockQuantity == null) {
      toast({
        title: 'Missing fields',
        description: 'Price and stock quantity are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSavingItem(true);
      await updateSupplierCatalogItem(editingItem.id, {
        price,
        stockQuantity,
        minimumOrderQuantity,
        leadTimeDays,
        deliveryRegions,
        notes: editingItem.notes.trim() || null,
      });
      toast({
        title: 'Inventory updated',
        description: 'Catalog item saved successfully.',
      });
      setEditingItem(null);
      await loadDashboard();
    } catch (error) {
      console.error('Error updating catalog item:', error);
      toast({
        title: 'Update failed',
        description: 'Unable to update catalog item right now.',
        variant: 'destructive',
      });
    } finally {
      setSavingItem(false);
    }
  };

  const buildQueueEntryFromForm = (): LinkQueueItem | null => {
    if (!supplierId) {
      return null;
    }

    if (!newCatalogForm.productId) {
      toast({
        title: 'Select a product',
        description: 'Choose a store product before queuing.',
        variant: 'destructive',
      });
      return null;
    }

    const product = storeProducts.find((item) => item.id === newCatalogForm.productId);
    if (!product) {
      toast({
        title: 'Product not found',
        description: 'Unable to find the selected store product.',
        variant: 'destructive',
      });
      return null;
    }

    const stockQuantity = parseNumberOrNull(newCatalogForm.stockQuantity);
    const price = parseNumberOrNull(newCatalogForm.price);
    const minimumOrderQuantity = parseNumberOrNull(newCatalogForm.minimumOrderQuantity);
    const leadTimeDays = parseNumberOrNull(newCatalogForm.leadTimeDays);
    const deliveryRegions = parseRegions(newCatalogForm.deliveryRegions);

    if (stockQuantity == null || price == null) {
      toast({
        title: 'Required fields missing',
        description: 'Provide both price and stock quantity.',
        variant: 'destructive',
      });
      return null;
    }

    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price,
      stockQuantity,
      minimumOrderQuantity,
      leadTimeDays,
      deliveryRegions,
      notes: newCatalogForm.notes.trim() || undefined,
    };
  };

  const handleQueueExistingProduct = () => {
    const entry = buildQueueEntryFromForm();
    if (!entry) {
      return;
    }

    if (linkQueue.some((item) => item.productId === entry.productId)) {
      toast({
        title: 'Already queued',
        description: `${entry.productName} is already waiting to be linked.`,
        variant: 'destructive',
      });
      return;
    }

    setLinkQueue((prev) => [...prev, entry]);
    setNewCatalogForm(DEFAULT_NEW_CATALOG);
    toast({
      title: 'Product queued',
      description: `${entry.productName} added to the linking queue.`,
    });
  };

  const handleRemoveQueueItem = (index: number) => {
    setLinkQueue((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmitLinkQueue = async () => {
    if (!supplierId) {
      return;
    }

    const queue = [...linkQueue];
    if (queue.length === 0) {
      toast({
        title: 'Add a product',
        description: 'Queue at least one store product before linking.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingCatalog(true);
      for (const entry of queue) {
        await addSupplierCatalogItem(supplierId, {
          productId: entry.productId,
          productName: entry.productName,
          category: entry.category,
          price: entry.price,
          stockQuantity: entry.stockQuantity,
          minimumOrderQuantity: entry.minimumOrderQuantity ?? undefined,
          leadTimeDays: entry.leadTimeDays ?? undefined,
          deliveryRegions: entry.deliveryRegions,
          notes: entry.notes,
          status: 'active',
        });
      }

      toast({
        title: 'Products linked',
        description: `${queue.length} product${queue.length === 1 ? '' : 's'} added to your catalogue.`,
      });

      setLinkQueue([]);
      setNewCatalogForm(DEFAULT_NEW_CATALOG);
      setAddExistingOpen(false);
      await loadDashboard();
    } catch (error) {
      console.error('Error linking products:', error);
      toast({
        title: 'Link failed',
        description: 'Unable to add product inventory.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingCatalog(false);
    }
  };

  const handleNewProductImagesSelected = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!supplierId || !files || files.length === 0) {
      return;
    }

    if (newProductImages.length >= MAX_NEW_PRODUCT_IMAGES) {
      toast({
        title: 'Photo limit reached',
        description: `You can upload up to ${MAX_NEW_PRODUCT_IMAGES} photos per request.`,
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    const remainingSlots = MAX_NEW_PRODUCT_IMAGES - newProductImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: 'Photo limit reached',
        description: `You can upload up to ${MAX_NEW_PRODUCT_IMAGES} photos per request.`,
        variant: 'destructive',
      });
      event.target.value = '';
      return;
    }

    const skippedCount = files.length - filesToUpload.length;
    const uploadedUrls: string[] = [];

    setUploadingNewProductImage(true);
    setNewProductImageProgress(0);

    try {
      for (const file of filesToUpload) {
        const validationError = validateImageFile(file);
        if (validationError) {
          toast({
            title: 'Invalid image',
            description: validationError,
            variant: 'destructive',
          });
          continue;
        }

        const url = await uploadSupplierCatalogImage(file, supplierId, (progress) =>
          setNewProductImageProgress(progress)
        );
        uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        setNewProductImages((prev) => [...prev, ...uploadedUrls]);
        toast({
          title:
            uploadedUrls.length === 1
              ? 'Photo uploaded'
              : `${uploadedUrls.length} photos uploaded`,
          description: 'Images attached to your product request.',
        });
      }

      if (skippedCount > 0) {
        toast({
          title: 'Some photos skipped',
          description: `Only ${remainingSlots} additional photo${remainingSlots === 1 ? '' : 's'} allowed.`,
        });
      }
    } catch (error) {
      console.error('Error uploading product images:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Could not upload product photos.',
        variant: 'destructive',
      });
    } finally {
      setUploadingNewProductImage(false);
      setNewProductImageProgress(0);
      if (newProductImageInputRef.current) {
        newProductImageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveNewProductImage = async (imageUrl: string) => {
    setRemovingProductImage(imageUrl);
    try {
      await deleteSupplierCatalogImage(imageUrl);
      setNewProductImages((prev) => prev.filter((url) => url !== imageUrl));
      toast({
        title: 'Photo removed',
        description: 'The image has been removed from this request.',
      });
    } catch (error) {
      console.error('Error deleting product image:', error);
      toast({
        title: 'Failed to remove photo',
        description: error instanceof Error ? error.message : 'Could not remove the selected photo.',
        variant: 'destructive',
      });
    } finally {
      setRemovingProductImage(null);
    }
  };

  const handleSubmitNewProduct = async () => {
    if (!supplierId || !newProductForm.productName.trim()) {
      toast({
        title: 'Product name required',
        description: 'Add a name for the new product request.',
        variant: 'destructive',
      });
      return;
    }

    const stockQuantity = parseNumberOrNull(newProductForm.stockQuantity);
    const price = parseNumberOrNull(newProductForm.price);
    const minimumOrderQuantity = parseNumberOrNull(newProductForm.minimumOrderQuantity);
    const leadTimeDays = parseNumberOrNull(newProductForm.leadTimeDays);
    const deliveryRegions = parseRegions(newProductForm.deliveryRegions);

    if (stockQuantity == null || price == null) {
      toast({
        title: 'Required fields missing',
        description: 'Provide both price and stock quantity.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingNewProduct(true);
      await addSupplierCatalogItem(supplierId, {
        productName: newProductForm.productName.trim(),
        category: newProductForm.category as Product['category'],
        price,
        stockQuantity,
        images: newProductImages,
        minimumOrderQuantity: minimumOrderQuantity ?? undefined,
        leadTimeDays: leadTimeDays ?? undefined,
        deliveryRegions,
        notes: newProductForm.notes.trim() || undefined,
        status: 'pending',
      });

      toast({
        title: 'Submission received',
        description: 'Admin will review and approve your new product request.',
      });
      setAddNewOpen(false);
      setNewProductForm(DEFAULT_NEW_PRODUCT);
      setNewProductImages([]);
      if (newProductImageInputRef.current) {
        newProductImageInputRef.current.value = '';
      }
      await loadDashboard();
    } catch (error) {
      console.error('Error submitting new product:', error);
      toast({
        title: 'Submission failed',
        description: 'Could not submit your product for approval.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingNewProduct(false);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Extract<OrderStatus, 'shipped' | 'delivered'>
  ) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, status);

      if (status === 'shipped') {
        await updateTrackingNumber(orderId, 'Awaiting carrier');
      }

      // Sync supplier assignment status to "fulfilled" when order is shipped or delivered
      if (supplierId) {
        await updateSupplierAssignmentStatus(orderId, supplierId, 'fulfilled');
      }

      toast({
        title: 'Order updated',
        description: `Order marked as ${status}.`,
      });
      await loadDashboard();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Update failed',
        description: 'Unable to update order status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

const getCatalogStatusBadgeClass = (status: SupplierCatalogItem['status']) => {
    switch (status) {
      case 'active':
        return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'pending':
        return 'border border-amber-200 bg-amber-50 text-amber-700';
      case 'inactive':
        return 'border border-neutral-200 bg-neutral-50 text-neutral-600';
      default:
        return 'border border-neutral-200 bg-neutral-50 text-neutral-600';
    }
  };

  const getOrderStatusBadgeClass = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending-payment':
      case 'payment-confirmed':
      case 'processing':
        return 'border border-amber-200 bg-amber-50 text-amber-700';
      case 'shipped':
        return 'border border-blue-200 bg-blue-50 text-blue-700';
      case 'delivered':
        return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'cancelled':
        return 'border border-rose-200 bg-rose-50 text-rose-700';
      default:
        return 'border border-neutral-200 bg-neutral-50 text-neutral-600';
    }
  };

  if (!isSupplier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cool">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Supplier Access Only</CardTitle>
            <CardDescription>Switch to a supplier account to access the Supplier Hub.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-cool">
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Supplier Hub</h1>
                <p className="text-sm text-neutral-600">
                  {profile?.metadata?.companyName || profile?.displayName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button variant="secondary" onClick={() => setProfileDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Business Settings
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {!feeNoticeDismissed && (
        <div className="bg-primary-50 border-b border-primary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary-500 mt-0.5" />
            <div className="flex-1 text-sm text-primary-800">
              <p className="font-semibold">Policy update: platform service & maintenance fees</p>
              <p>
                Following our 2025 review of Ghanaian payment gateway charges (MTN MoMo and Visa average ~1%) and
                marketplace support costs, every sale fulfilled through Supremo AC now attracts a 2% service fee and a
                1% maintenance levy. The storefront automatically adds this 3% to the price customers see, so please
                continue submitting your net supplier price—we will handle the markup and remittance.
              </p>
            </div>
            <button
              type="button"
              className="text-primary-600 hover:text-primary-800"
              onClick={() => setFeeNoticeDismissed(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {lowStockCatalog.length > 0 && !lowStockBannerDismissed && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1 text-sm text-amber-800">
              <p className="font-medium">Low stock alert</p>
              <p>
                {lowStockCatalog.length} product{lowStockCatalog.length === 1 ? '' : 's'} are below 5 units. Update
                quantities to avoid missing orders.
              </p>
            </div>
            <button
              type="button"
              className="text-amber-700 hover:text-amber-900"
              onClick={() => setLowStockBannerDismissed(true)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {!pendingNotificationDismissed && pendingCatalog.length > 0 && (
          <div className="flex justify-end">
            <div className="bg-white border border-neutral-200 shadow-sm rounded-lg px-4 py-3 flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary-500 mt-0.5" />
              <div className="text-sm text-neutral-700">
                <p className="font-semibold">Pending approval</p>
                <p>
                  {pendingCatalog.length} product{pendingCatalog.length === 1 ? '' : 's'} awaiting admin review.
                </p>
              </div>
              <button
                type="button"
                className="text-neutral-500 hover:text-neutral-700"
                onClick={() => setPendingNotificationDismissed(true)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            

            {storeProducts.length === 0 && catalog.length === 0 && (
              <Card className="border border-blue-200 bg-blue-50 shadow-sm mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="font-medium text-blue-900">Getting Started with Your Catalogue</p>
                      <p className="text-sm text-blue-800">
                        No products are available in the e-commerce store yet. You have two options:
                      </p>
                      <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                        <li>Wait for the admin to add products to the store, then link them to your inventory</li>
                        <li>Click <strong>"New product request"</strong> below to submit your own products for admin approval</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border border-neutral-200 shadow-sm">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-xl">Catalogue</CardTitle>
                  <CardDescription>
                    {stats.totalProducts} active product{stats.totalProducts === 1 ? '' : 's'} - {formatCurrency(stats.totalRevenue)} revenue to date
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAddExistingOpen(true)}
                    disabled={storeProducts.length === 0}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Link store products
                  </Button>
                  <Button onClick={() => setAddNewOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New product request
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {catalog.length === 0 ? (
                  <div className="py-12 text-center text-sm text-neutral-500">
                    <Store className="h-8 w-8 mx-auto mb-3 text-neutral-400" />
                    <p>No catalogue items yet. Link products from the store to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Lead time</TableHead>
                          <TableHead>Regions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {catalog.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="min-w-[200px]">
                              <div className="flex flex-col">
                                <span className="font-medium text-neutral-900">{item.productName}</span>
                                {item.notes ? (
                                  <span className="mt-1 text-xs text-neutral-500">{item.notes}</span>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="capitalize text-neutral-600">
                              {item.category.replace('-', ' ')}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${item.stockQuantity <= 5 ? 'text-amber-600' : 'text-neutral-700'}`}>
                              {item.stockQuantity}
                              {item.minimumOrderQuantity ? (
                                <span className="block text-xs text-neutral-500">MOQ {item.minimumOrderQuantity}</span>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getCatalogStatusBadgeClass(item.status)}>
                                {item.status.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.leadTimeDays ? `${item.leadTimeDays} day${item.leadTimeDays === 1 ? '' : 's'}` : '-'}
                            </TableCell>
                            <TableCell className="min-w-[160px]">
                              {item.deliveryRegions?.length ? item.deliveryRegions.join(', ') : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleOpenEditItem(item)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            

            <Card className="border border-neutral-200 shadow-sm">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-xl">Recent orders</CardTitle>
                  <CardDescription>
                    {orders.length === 0
                      ? 'No orders yet.'
                      : `${orders.length} order${orders.length === 1 ? '' : 's'} requiring action.`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.length === 0 ? (
                  <div className="py-12 text-center text-sm text-neutral-500">
                    <Truck className="h-8 w-8 mx-auto mb-3 text-neutral-400" />
                    <p>No supplier orders yet. Orders will appear here when customers check out your items.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead className="text-right">Items</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium text-neutral-900">
                              {order.orderNumber}
                              <div className="text-xs text-neutral-500">
                                {order.items[0]?.productName ?? 'Marketplace order'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-neutral-900">{order.customerName}</span>
                                <span className="text-xs text-neutral-500">{order.customerPhone}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-neutral-700">{order.items.length}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(order.totalAmount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getOrderStatusBadgeClass(order.orderStatus)}>
                                {order.orderStatus.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {['payment-confirmed', 'processing'].includes(order.orderStatus) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                    disabled={updatingOrderId === order.id}
                                  >
                                    {updatingOrderId === order.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Mark shipped
                                  </Button>
                                )}
                                {order.orderStatus === 'shipped' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                    disabled={updatingOrderId === order.id}
                                  >
                                    {updatingOrderId === order.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Mark delivered
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

          </>
        )}
      </main>

            
<Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Business settings</DialogTitle>
      <DialogDescription>Update the details customers see in the marketplace.</DialogDescription>
    </DialogHeader>
    <div className="grid gap-4">
      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="profile-company-name">Business name</Label>
          <Input
            id="profile-company-name"
            value={profileForm.companyName}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, companyName: event.target.value }))}
            placeholder="Supremo AC Services"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-email">Contact email</Label>
          <Input
            id="profile-email"
            type="email"
            value={profileForm.contactEmail}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
            placeholder="orders@supremoac.com"
          />
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="profile-phone">Contact phone</Label>
          <Input
            id="profile-phone"
            value={profileForm.contactPhone}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
            placeholder="+233 20 000 0000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-warehouse">Warehouse location</Label>
          <Input
            id="profile-warehouse"
            value={profileForm.warehouseLocation}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, warehouseLocation: event.target.value }))}
            placeholder="Tema Industrial Area"
          />
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-3 md:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="profile-capacity">Daily capacity</Label>
          <Input
            id="profile-capacity"
            type="number"
            min="0"
            value={profileForm.deliveryCapacityPerDay}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, deliveryCapacityPerDay: event.target.value }))}
            placeholder="25 shipments"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-lead-time">Lead time (days)</Label>
          <Input
            id="profile-lead-time"
            type="number"
            min="0"
            value={profileForm.fulfillmentLeadTimeDays}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, fulfillmentLeadTimeDays: event.target.value }))}
            placeholder="2"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-radius">Service radius (km)</Label>
          <Input
            id="profile-radius"
            type="number"
            min="0"
            value={profileForm.serviceRadiusKm}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, serviceRadiusKm: event.target.value }))}
            placeholder="60"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-regions">Fulfillment regions</Label>
        <Input
          id="profile-regions"
          value={profileForm.fulfillmentRegions}
          onChange={(event) => setProfileForm((prev) => ({ ...prev, fulfillmentRegions: event.target.value }))}
          placeholder="Greater Accra, Ashanti, Eastern"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-categories">Product categories</Label>
        <Input
          id="profile-categories"
          value={profileForm.productCategories}
          onChange={(event) => setProfileForm((prev) => ({ ...prev, productCategories: event.target.value }))}
          placeholder="Split AC, Spare parts"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-notes">Notes</Label>
        <Textarea
          id="profile-notes"
          value={profileForm.notes}
          onChange={(event) => setProfileForm((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Share delivery constraints or special instructions."
          rows={4}
        />
      </div>
    </div>
    <DialogFooter className="mt-2">
      <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleProfileSave} disabled={profileSaving}>
        {profileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      
<Dialog
  open={addExistingOpen}
  onOpenChange={(open) => {
    setAddExistingOpen(open);
    if (!open) {
      setNewCatalogForm(DEFAULT_NEW_CATALOG);
      setLinkQueue([]);
    }
  }}
>
  <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
    <DialogHeader className="flex-shrink-0">
      <DialogTitle>Link store products</DialogTitle>
      <DialogDescription>Select items from the marketplace and queue them for your catalogue.</DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 overflow-y-auto flex-1 pr-2">
      <div className="grid gap-2">
        <Label htmlFor="existing-product">Store product</Label>
        <Select
          value={newCatalogForm.productId}
          onValueChange={(value) => {
            const selected = storeProducts.find((item) => item.id === value);
            setNewCatalogForm((prev) => ({
              ...prev,
              productId: value,
              price: selected ? computeBasePriceFromPlatform(selected.price).toString() : prev.price,
              stockQuantity: selected ? String(selected.stockQuantity ?? 0) : prev.stockQuantity,
            }));
          }}
          disabled={availableStoreProducts.length === 0}
        >
          <SelectTrigger id="existing-product">
            <SelectValue
              placeholder={
                storeProducts.length === 0
                  ? 'No products in store yet'
                  : availableStoreProducts.length === 0
                    ? 'All store products are linked'
                    : 'Pick a product to link'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableStoreProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {storeProducts.length === 0 ? (
          <p className="text-xs text-amber-600">
            No products available in the e-commerce store yet. Admin needs to add products first, or use "New product request" to submit your own.
          </p>
        ) : availableStoreProducts.length === 0 ? (
          <p className="text-xs text-neutral-500">
            Everything from the store is already in your catalogue.
          </p>
        ) : (
          <p className="text-xs text-neutral-500">
            {availableStoreProducts.length} product{availableStoreProducts.length === 1 ? '' : 's'} available to link
          </p>
        )}
      </div>
      {selectedStoreProduct && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
          <p className="font-medium text-neutral-900">{selectedStoreProduct.name}</p>
          <p className="mt-1 text-sm text-neutral-600">{selectedStoreProduct.description}</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="existing-price">Supplier base price (GHS)</Label>
          <Input
            id="existing-price"
            type="number"
            min="0"
            step="0.01"
            value={newCatalogForm.price}
            onChange={(event) => setNewCatalogForm((prev) => ({ ...prev, price: event.target.value }))}
            placeholder="0.00"
          />
          <p className="text-xs text-neutral-500">
            Enter the supplier cost; the 3% platform fees are applied automatically.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="existing-stock">On-hand stock</Label>
          <Input
            id="existing-stock"
            type="number"
            min="0"
            value={newCatalogForm.stockQuantity}
            onChange={(event) => setNewCatalogForm((prev) => ({ ...prev, stockQuantity: event.target.value }))}
            placeholder="100"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="existing-moq">Minimum order quantity</Label>
          <Input
            id="existing-moq"
            type="number"
            min="0"
            value={newCatalogForm.minimumOrderQuantity}
            onChange={(event) => setNewCatalogForm((prev) => ({ ...prev, minimumOrderQuantity: event.target.value }))}
            placeholder="Optional"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="existing-lead">Lead time (days)</Label>
          <Input
            id="existing-lead"
            type="number"
            min="0"
            value={newCatalogForm.leadTimeDays}
            onChange={(event) => setNewCatalogForm((prev) => ({ ...prev, leadTimeDays: event.target.value }))}
            placeholder="Optional"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="existing-regions">Delivery regions</Label>
        <div className="border border-neutral-200 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {GHANA_REGIONS.map((region) => {
              const selectedRegions = newCatalogForm.deliveryRegions
                .split(',')
                .map((r) => r.trim())
                .filter(Boolean);
              const isChecked = selectedRegions.includes(region);

              return (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      let updatedRegions: string[];
                      if (checked) {
                        updatedRegions = [...selectedRegions, region];
                      } else {
                        updatedRegions = selectedRegions.filter((r) => r !== region);
                      }
                      setNewCatalogForm((prev) => ({
                        ...prev,
                        deliveryRegions: updatedRegions.join(', '),
                      }));
                    }}
                  />
                  <label
                    htmlFor={`region-${region}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {region}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          {newCatalogForm.deliveryRegions
            ? `${newCatalogForm.deliveryRegions.split(',').filter(Boolean).length} region(s) selected`
            : 'Select delivery regions'}
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="existing-notes">Internal notes</Label>
        <Textarea
          id="existing-notes"
          value={newCatalogForm.notes}
          onChange={(event) => setNewCatalogForm((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Add any fulfillment notes or packaging details."
          rows={3}
        />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-800">Link queue</h4>
          {linkQueue.length > 0 ? (
            <span className="text-xs text-neutral-500">
              {linkQueue.length} product{linkQueue.length === 1 ? '' : 's'} ready to link
            </span>
          ) : null}
        </div>
        {linkQueue.length === 0 ? (
          <p className="text-sm text-neutral-500">Queue is empty. Add a product before linking.</p>
        ) : (
          <div className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200">
            {linkQueue.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="flex items-center justify-between gap-4 p-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{item.productName}</p>
                  <p className="text-xs text-neutral-500">
                    {formatCurrency(item.price)}  -  {item.stockQuantity} in stock
                    {item.minimumOrderQuantity ? `  -  MOQ ${item.minimumOrderQuantity}` : ''}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveQueueItem(index)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove {item.productName}</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between flex-shrink-0 mt-4">
      <Button
        variant="secondary"
        onClick={handleQueueExistingProduct}
        disabled={submittingCatalog || !newCatalogForm.productId}
      >
        Add to queue
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setAddExistingOpen(false);
            setNewCatalogForm(DEFAULT_NEW_CATALOG);
            setLinkQueue([]);
          }}
          disabled={submittingCatalog}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmitLinkQueue} disabled={submittingCatalog || linkQueue.length === 0}>
          {submittingCatalog ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Link products
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
      
<Dialog
  open={addNewOpen}
  onOpenChange={(open) => {
    setAddNewOpen(open);
    if (!open) {
      if (newProductImages.length > 0) {
        newProductImages.forEach((url) => {
          void deleteSupplierCatalogImage(url).catch(() => undefined);
        });
      }
      setNewProductForm(DEFAULT_NEW_PRODUCT);
      setNewProductImages([]);
      setUploadingNewProductImage(false);
      setNewProductImageProgress(0);
      setRemovingProductImage(null);
      if (newProductImageInputRef.current) {
        newProductImageInputRef.current.value = '';
      }
    }
  }}
>
  <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
    <DialogHeader className="flex-shrink-0">
      <DialogTitle>Request a new product</DialogTitle>
      <DialogDescription>Submit items that are not yet available in the store catalogue.</DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 overflow-y-auto flex-1 pr-2">
      <div className="grid gap-2">
        <Label htmlFor="new-product-name">Product name</Label>
        <Input
          id="new-product-name"
          value={newProductForm.productName}
          onChange={(event) => setNewProductForm((prev) => ({ ...prev, productName: event.target.value }))}
          placeholder="High efficiency inverter unit"
        />
      </div>
      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="new-product-category">Category</Label>
          <Select
            value={newProductForm.category}
            onValueChange={(value) => setNewProductForm((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger id="new-product-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new-product-price">Target price (GHS)</Label>
          <Input
            id="new-product-price"
            type="number"
            min="0"
            step="0.01"
            value={newProductForm.price}
            onChange={(event) => setNewProductForm((prev) => ({ ...prev, price: event.target.value }))}
            placeholder="0.00"
          />
          <p className="text-xs text-neutral-500">
            The storefront will add a 3% markup (2% service + 1% maintenance) to this price before customers see it.
          </p>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="new-product-stock">Initial stock</Label>
          <Input
            id="new-product-stock"
            type="number"
            min="0"
            value={newProductForm.stockQuantity}
            onChange={(event) => setNewProductForm((prev) => ({ ...prev, stockQuantity: event.target.value }))}
            placeholder="50"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new-product-moq">Minimum order quantity</Label>
          <Input
            id="new-product-moq"
            type="number"
            min="0"
            value={newProductForm.minimumOrderQuantity}
            onChange={(event) => setNewProductForm((prev) => ({ ...prev, minimumOrderQuantity: event.target.value }))}
            placeholder="Optional"
          />
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2 md:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="new-product-lead">Lead time (days)</Label>
          <Input
            id="new-product-lead"
            type="number"
            min="0"
            value={newProductForm.leadTimeDays}
            onChange={(event) => setNewProductForm((prev) => ({ ...prev, leadTimeDays: event.target.value }))}
            placeholder="Optional"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new-product-regions">Delivery regions</Label>
          <div className="border border-neutral-200 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {GHANA_REGIONS.map((region) => {
                const selectedRegions = newProductForm.deliveryRegions
                  .split(',')
                  .map((r) => r.trim())
                  .filter(Boolean);
                const isChecked = selectedRegions.includes(region);

                return (
                  <div key={region} className="flex items-center space-x-2">
                    <Checkbox
                      id={`new-region-${region}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let updatedRegions: string[];
                        if (checked) {
                          updatedRegions = [...selectedRegions, region];
                        } else {
                          updatedRegions = selectedRegions.filter((r) => r !== region);
                        }
                        setNewProductForm((prev) => ({
                          ...prev,
                          deliveryRegions: updatedRegions.join(', '),
                        }));
                      }}
                    />
                    <label
                      htmlFor={`new-region-${region}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {region}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            {newProductForm.deliveryRegions
              ? `${newProductForm.deliveryRegions.split(',').filter(Boolean).length} region(s) selected`
              : 'Select delivery regions'}
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Product photos</Label>
        <p className="text-xs text-neutral-500">
          Upload up to {MAX_NEW_PRODUCT_IMAGES} photos so the admin can verify the product visually.
        </p>
        <div className="flex flex-wrap gap-3">
          {newProductImages.map((url) => (
            <div
              key={url}
              className="relative h-24 w-24 overflow-hidden rounded-md border border-neutral-200"
            >
              <img src={url} alt="New product preview" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 rounded-full bg-neutral-900/70 p-1 text-white hover:bg-neutral-900"
                onClick={() => void handleRemoveNewProductImage(url)}
                disabled={removingProductImage === url || submittingNewProduct}
              >
                {removingProductImage === url ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
          {newProductImages.length < MAX_NEW_PRODUCT_IMAGES && (
            <button
              type="button"
              onClick={() => newProductImageInputRef.current?.click()}
              className="flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-neutral-300 text-sm text-neutral-600 transition-colors hover:border-primary-500 hover:text-primary-600"
              disabled={uploadingNewProductImage || submittingNewProduct}
            >
              {uploadingNewProductImage ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5" />
                  <span>Add photo</span>
                </div>
              )}
            </button>
          )}
        </div>
        <input
          ref={newProductImageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          multiple
          onChange={handleNewProductImagesSelected}
          disabled={uploadingNewProductImage || submittingNewProduct}
        />
        {uploadingNewProductImage && (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
            Uploading photos… {newProductImageProgress}%
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new-product-notes">Supporting notes</Label>
        <Textarea
          id="new-product-notes"
          value={newProductForm.notes}
          onChange={(event) => setNewProductForm((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Share supplier details, warranty, or marketing copy."
          rows={4}
        />
      </div>
    </div>
    <DialogFooter className="flex-shrink-0 mt-4">
      <Button variant="outline" onClick={() => setAddNewOpen(false)} disabled={submittingNewProduct}>
        Cancel
      </Button>
      <Button onClick={handleSubmitNewProduct} disabled={submittingNewProduct}>
        {submittingNewProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit for approval
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      
<Dialog
  open={Boolean(editingItem)}
  onOpenChange={(open) => {
    if (!open) {
      setEditingItem(null);
    }
  }}
>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Edit catalogue item</DialogTitle>
      <DialogDescription>Tune pricing or availability details.</DialogDescription>
    </DialogHeader>
    {editingItem ? (
      <div className="grid gap-4">
        <div className="grid gap-2 md:grid-cols-2 md:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-price">Unit price (GHS)</Label>
            <Input
              id="edit-price"
              type="number"
              min="0"
              step="0.01"
              value={editingItem.price}
              onChange={(event) =>
                setEditingItem((prev) => (prev ? { ...prev, price: event.target.value } : prev))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-stock">Stock quantity</Label>
            <Input
              id="edit-stock"
              type="number"
              min="0"
              value={editingItem.stockQuantity}
              onChange={(event) =>
                setEditingItem((prev) => (prev ? { ...prev, stockQuantity: event.target.value } : prev))
              }
            />
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 md:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-moq">Minimum order quantity</Label>
            <Input
              id="edit-moq"
              type="number"
              min="0"
              value={editingItem.minimumOrderQuantity}
              onChange={(event) =>
                setEditingItem((prev) => (prev ? { ...prev, minimumOrderQuantity: event.target.value } : prev))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-lead">Lead time (days)</Label>
            <Input
              id="edit-lead"
              type="number"
              min="0"
              value={editingItem.leadTimeDays}
              onChange={(event) =>
                setEditingItem((prev) => (prev ? { ...prev, leadTimeDays: event.target.value } : prev))
              }
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-regions">Delivery regions</Label>
          <Input
            id="edit-regions"
            value={editingItem.deliveryRegions}
            onChange={(event) =>
              setEditingItem((prev) => (prev ? { ...prev, deliveryRegions: event.target.value } : prev))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-notes">Notes</Label>
          <Textarea
            id="edit-notes"
            value={editingItem.notes}
            onChange={(event) =>
              setEditingItem((prev) => (prev ? { ...prev, notes: event.target.value } : prev))
            }
            rows={4}
          />
        </div>
      </div>
    ) : null}
    <DialogFooter>
      <Button variant="outline" onClick={() => setEditingItem(null)} disabled={savingItem}>
        Cancel
      </Button>
      <Button onClick={handleSaveCatalogChanges} disabled={savingItem || !editingItem}>
        {savingItem ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}
