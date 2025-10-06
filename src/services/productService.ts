/**
 * Product Service
 * Firestore operations for products and orders
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Product,
  ProductFormData,
  ProductFilters,
  Order,
  OrderItem,
  ShippingAddress,
  PaymentMethod,
  OrderStatus,
  PaymentStatus,
} from '@/types/product';

/**
 * Create a new product (Supplier/Admin only)
 */
export async function createProduct(
  productData: ProductFormData,
  supplierId: string,
  supplierName: string,
  images: string[] = []
): Promise<string> {
  try {
    const productsRef = collection(db, 'products');

    const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      ...productData,
      images,
      supplierId,
      supplierName,
      stockStatus: productData.stockQuantity > 0 ? 'active' : 'out-of-stock',
      rating: 0,
      reviewCount: 0,
      soldCount: 0,
    };

    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Product created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

/**
 * Get product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data(),
      } as Product;
    }

    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw new Error('Failed to fetch product');
  }
}

/**
 * Get products with filters and pagination
 */
export async function getProducts(
  filters: ProductFilters = {},
  limitCount: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ products: Product[]; lastVisible: DocumentSnapshot | null }> {
  try {
    const productsRef = collection(db, 'products');
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters.condition) {
      constraints.push(where('condition', '==', filters.condition));
    }

    if (filters.inStock) {
      constraints.push(where('stockStatus', '==', 'active'));
    }

    if (filters.featured) {
      constraints.push(where('featured', '==', true));
    }

    if (filters.brand) {
      constraints.push(where('specifications.brand', '==', filters.brand));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        constraints.push(orderBy('price', 'asc'));
        break;
      case 'price-desc':
        constraints.push(orderBy('price', 'desc'));
        break;
      case 'name-asc':
        constraints.push(orderBy('name', 'asc'));
        break;
      case 'name-desc':
        constraints.push(orderBy('name', 'desc'));
        break;
      case 'newest':
        constraints.push(orderBy('createdAt', 'desc'));
        break;
      case 'popular':
        constraints.push(orderBy('soldCount', 'desc'));
        break;
      default:
        constraints.push(orderBy('createdAt', 'desc'));
    }

    // Add pagination
    constraints.push(limit(limitCount));
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(productsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    // Apply client-side filters (Firestore doesn't support range queries with other filters)
    let filteredProducts = products;

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
      );
    }

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { products: filteredProducts, lastVisible };
  } catch (error) {
    console.error('Error getting products:', error);
    throw new Error('Failed to fetch products');
  }
}

/**
 * Update product
 */
export async function updateProduct(
  productId: string,
  updates: Partial<ProductFormData>
): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);

    // Auto-update stock status based on quantity
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.stockQuantity !== undefined) {
      updateData.stockStatus = updates.stockQuantity > 0 ? 'active' : 'out-of-stock';
    }

    await updateDoc(productRef, updateData);
    console.log('✅ Product updated:', productId);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    console.log('✅ Product deleted:', productId);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}

/**
 * Update product stock after order
 */
export async function updateProductStock(
  productId: string,
  quantityChange: number
): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      throw new Error('Product not found');
    }

    const currentStock = productSnap.data().stockQuantity || 0;
    const newStock = currentStock + quantityChange;

    await updateDoc(productRef, {
      stockQuantity: newStock,
      stockStatus: newStock > 0 ? 'active' : 'out-of-stock',
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Stock updated for product:', productId, 'New stock:', newStock);
  } catch (error) {
    console.error('Error updating stock:', error);
    throw new Error('Failed to update product stock');
  }
}

/**
 * Create order
 */
export async function createOrder(
  customerId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: OrderItem[],
  shippingAddress: ShippingAddress,
  paymentMethod: PaymentMethod,
  shippingFee: number,
  installationFee?: number
): Promise<string> {
  try {
    const ordersRef = collection(db, 'orders');

    // Calculate totals
    const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalAmount = itemsTotal + shippingFee + (installationFee || 0);

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      orderNumber,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      itemsTotal,
      shippingFee,
      installationFee: installationFee || 0,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending-payment',
    };

    const docRef = await addDoc(ordersRef, {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update product stock and sold count
    for (const item of items) {
      await updateProductStock(item.productId, -item.quantity);

      // Update sold count
      const productRef = doc(db, 'products', item.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentSoldCount = productSnap.data().soldCount || 0;
        await updateDoc(productRef, {
          soldCount: currentSoldCount + item.quantity,
        });
      }
    }

    console.log('✅ Order created:', docRef.id, orderNumber);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      return {
        id: orderSnap.id,
        ...orderSnap.data(),
      } as Order;
    }

    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error('Failed to fetch order');
  }
}

/**
 * Get customer orders
 */
export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('Error getting customer orders:', error);
    throw new Error('Failed to fetch customer orders');
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData: any = {
      orderStatus: status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'delivered') {
      updateData.deliveredAt = serverTimestamp();
    }

    await updateDoc(orderRef, updateData);
    console.log('✅ Order status updated:', orderId, '→', status);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentReference?: string
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData: any = {
      paymentStatus,
      updatedAt: serverTimestamp(),
    };

    if (paymentReference) {
      updateData.paymentReference = paymentReference;
    }

    // If payment confirmed, update order status
    if (paymentStatus === 'completed') {
      updateData.orderStatus = 'processing';
    }

    await updateDoc(orderRef, updateData);
    console.log('✅ Payment status updated:', orderId, '→', paymentStatus);
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }

    const order = orderSnap.data() as Order;

    // Restore product stock
    for (const item of order.items) {
      await updateProductStock(item.productId, item.quantity);
    }

    await updateDoc(orderRef, {
      orderStatus: 'cancelled',
      cancellationReason: reason,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Order cancelled:', orderId);
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw new Error('Failed to cancel order');
  }
}

/**
 * Update tracking number
 */
export async function updateTrackingNumber(
  orderId: string,
  trackingNumber: string,
  estimatedDelivery?: Date
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData: any = {
      trackingNumber,
      updatedAt: serverTimestamp(),
    };

    if (estimatedDelivery) {
      updateData.estimatedDelivery = estimatedDelivery;
    }

    await updateDoc(orderRef, updateData);
    console.log('✅ Tracking number updated:', orderId, trackingNumber);
  } catch (error) {
    console.error('Error updating tracking number:', error);
    throw new Error('Failed to update tracking number');
  }
}

/**
 * Get all orders (Admin only)
 */
export async function getAllOrders(limitCount: number = 50): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw new Error('Failed to fetch orders');
  }
}
