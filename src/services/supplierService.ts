/**
 * Supplier Service
 * Manages supplier-related operations in Firestore
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { UserProfile } from '@/types/user';
import type {
  Order,
  OrderStatus,
  SupplierCatalogItem,
  SupplierCatalogStatus,
  Product,
  ProductCategory,
  ProductFormData,
} from '@/types/product';
import { createProduct, updateProduct } from '@/services/productService';
import { normalizeProductPricing } from '@/utils/pricing';

const PLATFORM_SERVICE_FEE_RATE = 0.02;
const PLATFORM_MAINTENANCE_FEE_RATE = 0.01;
const PLATFORM_TOTAL_FEE_RATE = PLATFORM_SERVICE_FEE_RATE + PLATFORM_MAINTENANCE_FEE_RATE;

const computePlatformPriceFromBase = (basePrice: number): number =>
  parseFloat((basePrice * (1 + PLATFORM_TOTAL_FEE_RATE)).toFixed(2));

const computeBasePriceFromPlatform = (platformPrice: number): number =>
  parseFloat((platformPrice / (1 + PLATFORM_TOTAL_FEE_RATE)).toFixed(2));

export interface SupplierWithProducts extends UserProfile {
  productCount: number;
  catalogCount: number;
  inventoryQuantity: number;
  totalRevenue: number;
  lastActive: Timestamp;
}

/**
 * Get all suppliers (pending and approved)
 */
export async function getAllSuppliers(): Promise<UserProfile[]> {
  const usersCollection = collection(db, 'users');
  const suppliersQuery = query(
    usersCollection,
    where('role', '==', 'supplier'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(suppliersQuery);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    uid: doc.id,
  })) as UserProfile[];
}

/**
 * Get pending suppliers (waiting for approval)
 */
export async function getPendingSuppliers(): Promise<UserProfile[]> {
  const usersCollection = collection(db, 'users');
  const pendingQuery = query(
    usersCollection,
    where('role', '==', 'supplier'),
    where('isApproved', '==', false),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(pendingQuery);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    uid: doc.id,
  })) as UserProfile[];
}

/**
 * Get approved suppliers
 */
export async function getApprovedSuppliers(): Promise<UserProfile[]> {
  const usersCollection = collection(db, 'users');
  const approvedQuery = query(
    usersCollection,
    where('role', '==', 'supplier'),
    where('isApproved', '==', true),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(approvedQuery);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    uid: doc.id,
  })) as UserProfile[];
}

/**
 * Approve a supplier
 */
export async function approveSupplier(supplierId: string): Promise<void> {
  const supplierRef = doc(db, 'users', supplierId);
  await updateDoc(supplierRef, {
    isApproved: true,
    approvedAt: Timestamp.now(),
  });
}

/**
 * Reject/Suspend a supplier
 */
export async function rejectSupplier(supplierId: string): Promise<void> {
  const supplierRef = doc(db, 'users', supplierId);
  await updateDoc(supplierRef, {
    isApproved: false,
    rejectedAt: Timestamp.now(),
  });
}

/**
 * Get supplier with product stats
 */
export async function getSupplierWithStats(
  supplierId: string
): Promise<SupplierWithProducts | null> {
  // Get supplier profile
  const supplierRef = doc(db, 'users', supplierId);
  const supplierSnap = await getDoc(supplierRef);

  if (!supplierSnap.exists()) {
    return null;
  }

  const supplier = {
    ...supplierSnap.data(),
    uid: supplierSnap.id,
  } as UserProfile;

  const productsCollection = collection(db, 'products');
  const catalogCollection = collection(db, 'supplier_catalog');
  const ordersCollection = collection(db, 'orders');

  const [productsSnap, catalogSnap, ordersByArraySnap, legacyOrdersSnap] = await Promise.all([
    getDocs(query(productsCollection, where('supplierId', '==', supplierId))),
    getDocs(query(catalogCollection, where('supplierId', '==', supplierId))),
    getDocs(query(ordersCollection, where('supplierIds', 'array-contains', supplierId))),
    getDocs(query(ordersCollection, where('supplierId', '==', supplierId))),
  ]);

  const catalogItems = catalogSnap.docs.map((doc) => doc.data() as SupplierCatalogItem);
  const inventoryQuantity = catalogItems.reduce((total, item) => total + (item.stockQuantity ?? 0), 0);
  const catalogCount = catalogItems.length;

  const linkedProductIds = new Set<string>();
  catalogItems.forEach((item) => {
    if (item.productId) {
      linkedProductIds.add(item.productId);
    } else {
      linkedProductIds.add(`${item.productName}-${item.category}`);
    }
  });

  const directProductCount = productsSnap.size;
  const derivedProductCount = linkedProductIds.size || catalogCount;
  const productCount = directProductCount > 0 ? directProductCount : derivedProductCount;

  let totalRevenue = 0;
  const ordersMap = new Map<string, Order>();

  ordersByArraySnap.forEach((orderDoc) => {
    ordersMap.set(orderDoc.id, orderDoc.data() as Order);
  });

  legacyOrdersSnap.forEach((orderDoc) => {
    if (!ordersMap.has(orderDoc.id)) {
      ordersMap.set(orderDoc.id, orderDoc.data() as Order);
    }
  });

  ordersMap.forEach((order) => {
    if (order.orderStatus === 'delivered' || order.orderStatus === 'payment-confirmed') {
      totalRevenue += order.totalAmount || 0;
    }
  });

  return {
    ...supplier,
    productCount,
    catalogCount,
    inventoryQuantity,
    totalRevenue,
    lastActive: supplier.updatedAt || supplier.createdAt,
  };
}

/**
 * Get all suppliers with stats
 */
export async function getAllSuppliersWithStats(): Promise<SupplierWithProducts[]> {
  const suppliers = await getAllSuppliers();

  const suppliersWithStats = await Promise.all(
    suppliers.map(async (supplier) => {
      const stats = await getSupplierWithStats(supplier.uid);
      return stats!;
    })
  );

  return suppliersWithStats.filter((s) => s !== null);
}

/**
 * Get products by supplier
 */
export async function getSupplierProducts(supplierId: string) {
  const productsCollection = collection(db, 'products');
  const productsQuery = query(
    productsCollection,
    where('supplierId', '==', supplierId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
}


export async function getSupplierOrders(
  supplierId: string,
  limitCount: number = 10
): Promise<Order[]> {
  const ordersCollection = collection(db, 'orders');
  const ordersQuery = query(
    ordersCollection,
    where('supplierIds', 'array-contains', supplierId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as Order),
    id: docSnap.id,
  }));
}

export async function updateSupplierProductStock(
  productId: string,
  newQuantity: number
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    stockQuantity: newQuantity,
    stockStatus: newQuantity > 0 ? 'active' : 'out-of-stock',
    updatedAt: serverTimestamp(),
  });
}

export async function updateSupplierProductPrice(
  productId: string,
  price: number
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    price,
    updatedAt: serverTimestamp(),
  });
}

export async function updateSupplierOrderStatus(
  orderId: string,
  status: OrderStatus,
  options: { trackingNumber?: string } = {}
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  const updatePayload: {
    orderStatus: OrderStatus;
    updatedAt: ReturnType<typeof serverTimestamp>;
    trackingNumber?: string | null;
    deliveredAt?: ReturnType<typeof serverTimestamp>;
  } = {
    orderStatus: status,
    updatedAt: serverTimestamp(),
  };

  if (options.trackingNumber !== undefined) {
    updatePayload.trackingNumber = options.trackingNumber || null;
  }

  if (status === 'delivered') {
    updatePayload.deliveredAt = serverTimestamp();
  }

  await updateDoc(orderRef, updatePayload);
}


export interface SupplierProfileUpdates {
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  warehouseLocation?: string;
  deliveryCapacityPerDay?: number | null;
  fulfillmentRegions?: string[];
  fulfillmentLeadTimeDays?: number | null;
  serviceRadiusKm?: number | null;
  productCategories?: string[];
  notes?: string;
}

export async function getSupplierProfile(supplierId: string): Promise<UserProfile | null> {
  const supplierRef = doc(db, 'users', supplierId);
  const supplierSnap = await getDoc(supplierRef);
  return supplierSnap.exists() ? ({ ...supplierSnap.data(), uid: supplierSnap.id } as UserProfile) : null;
}

export async function updateSupplierProfile(
  supplierId: string,
  updates: SupplierProfileUpdates
): Promise<void> {
  const supplierRef = doc(db, 'users', supplierId);
  const updatePayload: Record<string, string | number | string[] | null | ReturnType<typeof serverTimestamp>> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.companyName !== undefined) {
    updatePayload['metadata.companyName'] = updates.companyName || null;
  }

  if (updates.contactEmail !== undefined) {
    updatePayload['metadata.contactEmail'] = updates.contactEmail || null;
  }

  if (updates.contactPhone !== undefined) {
    updatePayload['metadata.contactPhone'] = updates.contactPhone || null;
  }

  if (updates.warehouseLocation !== undefined) {
    updatePayload['metadata.warehouseLocation'] = updates.warehouseLocation || null;
  }

  if (updates.deliveryCapacityPerDay !== undefined) {
    updatePayload['metadata.deliveryCapacityPerDay'] = updates.deliveryCapacityPerDay ?? null;
  }

  if (updates.fulfillmentRegions !== undefined) {
    updatePayload['metadata.fulfillmentRegions'] =
      updates.fulfillmentRegions && updates.fulfillmentRegions.length > 0
        ? updates.fulfillmentRegions
        : [];
  }

  if (updates.fulfillmentLeadTimeDays !== undefined) {
    updatePayload['metadata.fulfillmentLeadTimeDays'] = updates.fulfillmentLeadTimeDays ?? null;
  }

  if (updates.serviceRadiusKm !== undefined) {
    updatePayload['metadata.serviceRadiusKm'] = updates.serviceRadiusKm ?? null;
  }

  if (updates.productCategories !== undefined) {
    updatePayload['metadata.productCategories'] =
      updates.productCategories && updates.productCategories.length > 0
        ? updates.productCategories
        : [];
  }

  if (updates.notes !== undefined) {
    updatePayload['metadata.notes'] = updates.notes || null;
  }

  await updateDoc(supplierRef, updatePayload);
}

export async function getSupplierCatalog(supplierId: string): Promise<SupplierCatalogItem[]> {
  const catalogRef = collection(db, 'supplier_catalog');
  const catalogQuery = query(
    catalogRef,
    where('supplierId', '==', supplierId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(catalogQuery);
  const normalized: SupplierCatalogItem[] = [];

  for (const docSnap of snapshot.docs) {
    let item = {
      ...(docSnap.data() as SupplierCatalogItem),
      id: docSnap.id,
    };

    const basePrice =
      item.basePrice !== undefined
        ? item.basePrice
        : computeBasePriceFromPlatform(item.price);

    const isActive = item.status === 'active';
    const expectedPrice = isActive
      ? computePlatformPriceFromBase(basePrice)
      : basePrice;

    const updates: Record<string, unknown> = {};
    if (item.basePrice === undefined || Math.abs(item.basePrice - basePrice) > 0.01) {
      updates.basePrice = basePrice;
    }

    if (Math.abs(item.price - expectedPrice) > 0.01) {
      updates.price = expectedPrice;
    }

    if (isActive && updates.price !== undefined) {
      updates.platformFeesAppliedAt = serverTimestamp();
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp();
      await updateDoc(docSnap.ref, updates);
      item = {
        ...item,
        ...updates,
        price: expectedPrice,
        basePrice,
      } as SupplierCatalogItem;
    } else {
      item = {
        ...item,
        price: expectedPrice,
        basePrice,
      };
    }

    if (isActive && item.productId && (updates.price !== undefined || updates.basePrice !== undefined)) {
      await updateProduct(item.productId, {
        price: expectedPrice,
        stockQuantity: item.stockQuantity,
        compareAtPrice: basePrice,
      });

      await updateDoc(doc(db, 'products', item.productId), {
        images: item.images ?? [],
      });
    }

    normalized.push(item);
  }

  return normalized;
}

interface CatalogItemPayload {
  productId?: string;
  productName: string;
  category: ProductCategory;
  price: number;
  stockQuantity: number;
  images?: string[];
  notes?: string;
  status?: SupplierCatalogStatus;
  minimumOrderQuantity?: number;
  leadTimeDays?: number;
  deliveryRegions?: string[];
  approvalNotes?: string;
}

export async function addSupplierCatalogItem(
  supplierId: string,
  payload: CatalogItemPayload
): Promise<string> {
  const catalogRef = collection(db, 'supplier_catalog');
  const status: SupplierCatalogStatus = payload.status ?? 'pending';
  const basePrice = parseFloat((payload.price ?? 0).toFixed(2));
  const priceToStore =
    status === 'active'
      ? computePlatformPriceFromBase(basePrice)
      : basePrice;

  const docRef = await addDoc(catalogRef, {
    supplierId,
    productId: payload.productId || null,
    productName: payload.productName,
    category: payload.category,
    price: priceToStore,
    basePrice,
    stockQuantity: payload.stockQuantity,
    images: payload.images ?? [],
    notes: payload.notes || null,
    status,
    minimumOrderQuantity: payload.minimumOrderQuantity ?? null,
    leadTimeDays: payload.leadTimeDays ?? null,
    deliveryRegions:
      payload.deliveryRegions && payload.deliveryRegions.length > 0 ? payload.deliveryRegions : [],
    approvalNotes: payload.approvalNotes || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (status === 'active' && payload.productId) {
    await updateProduct(payload.productId, {
      price: priceToStore,
      stockQuantity: payload.stockQuantity,
      compareAtPrice: basePrice,
    });

    if (payload.images) {
      await updateDoc(doc(db, 'products', payload.productId), {
        images: payload.images,
      });
    }
  }

  return docRef.id;
}

export async function updateSupplierCatalogItem(
  itemId: string,
  updates: Partial<{
    price: number;
    stockQuantity: number;
    images: string[];
    status: SupplierCatalogStatus;
    notes: string | null;
    minimumOrderQuantity: number | null;
    leadTimeDays: number | null;
    deliveryRegions: string[];
    approvalNotes: string | null;
  }>
): Promise<void> {
  const itemRef = doc(db, 'supplier_catalog', itemId);
  const itemSnap = await getDoc(itemRef);

  if (!itemSnap.exists()) {
    throw new Error('Supplier catalog item not found');
  }

  const existingItem = itemSnap.data() as SupplierCatalogItem;
  const nextStatus: SupplierCatalogStatus = updates.status ?? existingItem.status;

  const nextBasePrice =
    updates.price !== undefined
      ? parseFloat(updates.price.toFixed(2))
      : existingItem.basePrice ?? computeBasePriceFromPlatform(existingItem.price);

  const nextPlatformPrice =
    nextStatus === 'active' ? computePlatformPriceFromBase(nextBasePrice) : nextBasePrice;

  const updatePayload: Record<string, unknown> = {
    ...updates,
    price: nextPlatformPrice,
    basePrice: nextBasePrice,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(itemRef, updatePayload);

  const productId = existingItem.productId ?? null;
  if (nextStatus === 'active' && productId) {
    await updateProduct(productId, {
      price: nextPlatformPrice,
      stockQuantity: updates.stockQuantity ?? existingItem.stockQuantity,
      compareAtPrice: nextBasePrice,
    });

    const imagesToPersist = updates.images ?? existingItem.images ?? [];
    await updateDoc(doc(db, 'products', productId), {
      images: imagesToPersist,
    });
  }
}

export async function getSupplierCatalogItemsByStatus(
  status: SupplierCatalogStatus,
  limitCount = 50
): Promise<SupplierCatalogItem[]> {
  const catalogRef = collection(db, 'supplier_catalog');
  const catalogQuery = query(
    catalogRef,
    where('status', '==', status),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(catalogQuery);
  return snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as SupplierCatalogItem),
    id: docSnap.id,
  }));
}

export async function getActiveCatalogItemsByProduct(
  productId: string
): Promise<SupplierCatalogItem[]> {
  if (!productId) return [];

  const catalogRef = collection(db, 'supplier_catalog');
  const catalogQuery = query(
    catalogRef,
    where('productId', '==', productId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(catalogQuery);
  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as SupplierCatalogItem),
      id: docSnap.id,
    }))
    .filter((item) => item.status === 'active' && item.stockQuantity > 0);
}

export async function getActiveCatalogItemsByProductIds(
  productIds: string[]
): Promise<Record<string, SupplierCatalogItem[]>> {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return {};
  }

  const results: Record<string, SupplierCatalogItem[]> = {};

  await Promise.all(
    uniqueIds.map(async (productId) => {
      results[productId] = await getActiveCatalogItemsByProduct(productId);
    })
  );

  return results;
}

export async function setSupplierCatalogItemStatus(
  itemId: string,
  status: SupplierCatalogStatus,
  options: { approvalNotes?: string | null; productId?: string | null } = {}
): Promise<void> {
  const itemRef = doc(db, 'supplier_catalog', itemId);
  const itemSnap = await getDoc(itemRef);

  if (!itemSnap.exists()) {
    throw new Error('Supplier catalog item not found');
  }

  const existingItem = itemSnap.data() as SupplierCatalogItem;
  const basePrice = existingItem.basePrice ?? computeBasePriceFromPlatform(existingItem.price);
  const updatePayload: Record<string, unknown> = {
    status,
    basePrice,
    updatedAt: serverTimestamp(),
  };

  if (options.approvalNotes !== undefined) {
    updatePayload.approvalNotes = options.approvalNotes;
  }

  let productIdToUse = existingItem.productId ?? options.productId ?? null;

  if (status === 'active') {
    const platformPrice = computePlatformPriceFromBase(basePrice);
    updatePayload.price = platformPrice;
    updatePayload.platformFeesAppliedAt = serverTimestamp();

    const supplierRef = doc(db, 'users', existingItem.supplierId);
    const supplierSnap = await getDoc(supplierRef);
    const supplierData = supplierSnap.exists()
      ? (supplierSnap.data() as UserProfile)
      : null;

    const supplierDisplayName =
      (supplierData?.metadata?.companyName as string | undefined)?.trim() ||
      supplierData?.displayName ||
      'Supplier';

    if (!productIdToUse) {
      const productPayload: ProductFormData = {
        name: existingItem.productName,
        description:
          existingItem.notes?.trim() ||
          'Supplier-submitted product approved for storefront.',
        category: existingItem.category,
        price: platformPrice,
        compareAtPrice: basePrice,
        specifications: {},
        stockQuantity: existingItem.stockQuantity,
        condition: 'new',
        tags: ['supplier', existingItem.category],
        featured: false,
      };

      productIdToUse = await createProduct(
        productPayload,
        existingItem.supplierId,
        supplierDisplayName,
        existingItem.images ?? []
      );
    } else {
      await updateProduct(productIdToUse, {
        price: platformPrice,
        stockQuantity: existingItem.stockQuantity,
        compareAtPrice: basePrice,
      });

      await updateDoc(doc(db, 'products', productIdToUse), {
        images: existingItem.images ?? [],
      });
    }

    updatePayload.productId = productIdToUse;
  } else {
    if (options.productId !== undefined) {
      updatePayload.productId = options.productId;
    }

    updatePayload.price = basePrice;
  }

  await updateDoc(itemRef, updatePayload);
}

export async function getStoreProductsForSupplier(limitCount = 20): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const productsQuery = query(productsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const snapshot = await getDocs(productsQuery);
  const products = snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as Product),
    id: docSnap.id,
  }));

  return Promise.all(
    products.map(async (product) => {
      const { normalized, updates } = normalizeProductPricing(product);

      if (updates && Object.keys(updates).length > 0) {
        try {
          await updateDoc(doc(db, 'products', product.id), {
            ...updates,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          console.warn(
            `[supplierService] Skipped pricing normalization for product ${product.id}`,
            error
          );
        }
      }

      return normalized;
    })
  );
}
