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
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { UserProfile } from '@/types/user';

export interface SupplierWithProducts extends UserProfile {
  productCount: number;
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

  // Get product count
  const productsCollection = collection(db, 'products');
  const productsQuery = query(productsCollection, where('supplierId', '==', supplierId));
  const productsSnap = await getDocs(productsQuery);
  const productCount = productsSnap.size;

  // Get orders for revenue calculation
  const ordersCollection = collection(db, 'orders');
  const ordersQuery = query(ordersCollection, where('supplierId', '==', supplierId));
  const ordersSnap = await getDocs(ordersQuery);

  let totalRevenue = 0;
  ordersSnap.forEach((orderDoc) => {
    const order = orderDoc.data();
    if (order.status === 'delivered' || order.status === 'payment-confirmed') {
      totalRevenue += order.totalAmount || 0;
    }
  });

  return {
    ...supplier,
    productCount,
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
