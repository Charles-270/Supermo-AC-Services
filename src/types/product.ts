/**
 * Product Types
 * E-commerce data models for AC units, spare parts, and accessories
 */

import type { Timestamp } from 'firebase/firestore';

export type ProductCategory =
  | 'split-ac'
  | 'central-ac'
  | 'spare-parts'
  | 'accessories';

export type ProductCondition = 'new' | 'refurbished';

export type ProductStatus = 'active' | 'low-stock' | 'out-of-stock' | 'discontinued';

export interface ProductSpecification {
  brand?: string;
  model?: string;
  capacity?: string; // e.g., "1.5HP", "2.0HP"
  powerConsumption?: string; // e.g., "1200W"
  coolingCapacity?: string; // e.g., "12,000 BTU"
  energyRating?: string; // e.g., "A++", "5-star"
  warranty?: string; // e.g., "2 years"
  dimensions?: string; // e.g., "800x300x550mm"
  weight?: string; // e.g., "25kg"
  color?: string;
  material?: string;
  compatibility?: string[]; // For spare parts - compatible AC models
  [key: string]: string | string[] | undefined; // Allow additional specs
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number; // In GHS
  compareAtPrice?: number; // Original price for discounts
  images: string[]; // URLs from Firebase Storage
  specifications: ProductSpecification;
  stockQuantity: number;
  stockStatus: ProductStatus;
  condition: ProductCondition;
  supplierId: string;
  supplierName: string;
  tags: string[]; // For search optimization
  featured: boolean; // Show on homepage
  rating?: number; // Average rating (0-5)
  reviewCount?: number;
  soldCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWarranty?: string; // Extended warranty option
  installationRequired?: boolean; // For AC units
}

export type OrderStatus =
  | 'pending-payment'
  | 'payment-confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'mtn-mobile-money'
  | 'vodafone-cash'
  | 'airteltigo-money'
  | 'card'
  | 'bank-transfer';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  landmark?: string;
  deliveryInstructions?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  installationRequired?: boolean;
  warranty?: string;
  subtotal: number; // price * quantity
  supplierId?: string;
  supplierName?: string;
}

export type SupplierAssignmentStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'fulfilled'
  | 'reassigned';

export interface SupplierAssignmentItem {
  productId: string;
  quantity: number;
  catalogItemId?: string;
}

export interface SupplierAssignment {
  supplierId: string;
  supplierName: string;
  items: SupplierAssignmentItem[];
  status: SupplierAssignmentStatus;
  assignedAt: Timestamp;
  respondedAt?: Timestamp;
  notes?: string;
  autoAssigned?: boolean;
}

export interface FulfillmentDetails {
  technicianName?: string;
  technicianPhone?: string;
  assignedTime?: Timestamp | Date;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., "ORD-2024-0001"
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  items: OrderItem[];
  itemsTotal: number;
  subtotal?: number; // Alias for itemsTotal
  shippingFee: number;
  deliveryFee?: number; // Alias for shippingFee
  installationFee?: number;
  taxAmount?: number;
  tax?: number; // Alias for taxAmount
  totalAmount: number;

  shippingAddress: ShippingAddress;

  paymentMethod: PaymentMethod | string; // Allow string for flexibility
  paymentStatus: PaymentStatus;
  supplierIds?: string[];
  supplierAssignments?: SupplierAssignment[];
  paymentReference?: string; // Paystack reference
  paystackAuthUrl?: string;
  paymentGateway?: string;
  paidAt?: Timestamp;
  transactions?: PaymentTransaction[];

  orderStatus: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: Timestamp;
  deliveredAt?: Timestamp;

  fulfillmentDetails?: FulfillmentDetails;

  notes?: string;

  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  cancelledAt?: Timestamp;
  cancellationReason?: string;
}

export interface PaymentTransaction {
  gateway: string;
  reference: string;
  status?: string;
  channel?: string;
  currency?: string;
  amount?: number;
  paidAt?: string;
  createdAt?: string;
}


export interface SupplierShare {
  supplierId: string;
  supplierName?: string;
  totalAmount: number;
  platformCommission?: number; // 10% platform fee
  supplierPayout?: number; // 90% goes to supplier
}

/**
 * Platform Commission Structure (Ultra-Simple)
 * - Flat 10% commission for ALL suppliers
 * - No tiers, no negotiations
 * - Supplier gets 90%, platform keeps 10%
 */
export const PLATFORM_COMMISSION_RATE = 0.10; // 10% commission
export const SUPPLIER_PAYOUT_RATE = 0.90; // 90% to supplier

export interface PaymentTransaction {
  gateway: string;
  reference: string;
  status?: string;
  channel?: string;
  currency?: string;
  amount?: number;
  paidAt?: string;
  createdAt?: string;
}


export type SupplierCatalogStatus = 'active' | 'pending' | 'inactive' | 'rejected';

export interface SupplierCatalogItem {
  id: string;
  supplierId: string;
  productId?: string;
  productName: string;
  category: ProductCategory;
  price: number;
  basePrice?: number;
  stockQuantity: number;
  status: SupplierCatalogStatus;
  images?: string[];
  notes?: string;
  minimumOrderQuantity?: number;
  leadTimeDays?: number;
  deliveryRegions?: string[];
  restockDate?: Timestamp | null;
  approvalNotes?: string;
  platformFeesAppliedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Filter options for product catalog
export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  condition?: ProductCondition;
  inStock?: boolean;
  featured?: boolean;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'popular';
}

// Product form data for suppliers
export interface ProductFormData {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  specifications: ProductSpecification;
  stockQuantity: number;
  condition: ProductCondition;
  tags: string[];
  featured: boolean;
}

// Ghana regions for shipping
export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Savannah',
  'North East',
  'Oti',
  'Western North',
];

// Shipping fees by region (in GHS)
export const SHIPPING_FEES: Record<string, number> = {
  'Greater Accra': 50,
  'Ashanti': 100,
  'Western': 120,
  'Central': 80,
  'Eastern': 90,
  'Volta': 110,
  'Northern': 150,
  'Upper East': 180,
  'Upper West': 180,
  'Bono': 130,
  'Bono East': 140,
  'Ahafo': 140,
  'Savannah': 160,
  'North East': 170,
  'Oti': 120,
  'Western North': 130,
};

// Installation fees by AC category (in GHS)
export const INSTALLATION_FEES: Record<string, number> = {
  'split-ac': 300,
  'central-ac': 1500,
};

// Popular AC brands in Ghana
export const AC_BRANDS = [
  'Samsung',
  'LG',
  'Midea',
  'Hisense',
  'Nasco',
  'TCL',
  'Bruhm',
  'Changhong',
  'Gree',
  'Haier',
  'Panasonic',
  'Daikin',
  'Carrier',
];

// Product capacity options
export const AC_CAPACITIES = [
  '1.0HP',
  '1.5HP',
  '2.0HP',
  '2.5HP',
  '3.0HP',
  '4.0HP',
  '5.0HP',
];
