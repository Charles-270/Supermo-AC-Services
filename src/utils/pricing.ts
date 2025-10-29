/**
 * Pricing utilities for platform fees.
 * Centralises how supplier-linked product pricing is calculated.
 */

import type { Product } from '@/types/product';

export const PLATFORM_SERVICE_FEE_RATE = 0.02;
export const PLATFORM_MAINTENANCE_FEE_RATE = 0.01;
export const PLATFORM_TOTAL_FEE_RATE =
  PLATFORM_SERVICE_FEE_RATE + PLATFORM_MAINTENANCE_FEE_RATE;

const EPSILON = 0.01;

const roundCurrency = (value: number): number =>
  Number.isFinite(value) ? parseFloat(value.toFixed(2)) : 0;

const hasSupplierLink = (product: Product): boolean => {
  const supplierId = typeof product.supplierId === 'string' ? product.supplierId.trim() : '';
  const hasSupplierTag =
    Array.isArray(product.tags) && product.tags.some((tag) => tag === 'supplier');

  return Boolean(supplierId) || hasSupplierTag;
};

export interface PricingBreakdown {
  basePrice: number;
  serviceFee: number;
  maintenanceFee: number;
  totalPrice: number;
  isSupplierProduct: boolean;
}

export interface ProductNormalizationResult {
  normalized: Product;
  pricing: PricingBreakdown;
  updates?: Partial<Pick<Product, 'price' | 'compareAtPrice'>>;
}

export const resolveProductPricing = (product: Product): PricingBreakdown => {
  const storedPrice = roundCurrency(product.price ?? 0);
  const hasCompareValue =
    typeof product.compareAtPrice === 'number' && product.compareAtPrice > 0;
  const storedCompare = hasCompareValue ? roundCurrency(product.compareAtPrice!) : null;
  const supplierProduct = hasSupplierLink(product);

  // Supplier products fall back to the stored price when no base was recorded.
  const basePrice = supplierProduct
    ? roundCurrency(storedCompare ?? storedPrice)
    : roundCurrency(storedCompare ?? storedPrice);

  const totalPrice = supplierProduct
    ? roundCurrency(basePrice * (1 + PLATFORM_TOTAL_FEE_RATE))
    : storedPrice;

  const serviceFee = supplierProduct
    ? roundCurrency(basePrice * PLATFORM_SERVICE_FEE_RATE)
    : 0;

  const maintenanceFee = supplierProduct
    ? roundCurrency(basePrice * PLATFORM_MAINTENANCE_FEE_RATE)
    : 0;

  return {
    basePrice,
    serviceFee,
    maintenanceFee,
    totalPrice,
    isSupplierProduct: supplierProduct,
  };
};

export const normalizeProductPricing = (
  product: Product
): ProductNormalizationResult => {
  const pricing = resolveProductPricing(product);
  const updates: Partial<Pick<Product, 'price' | 'compareAtPrice'>> = {};

  if (pricing.isSupplierProduct) {
    if (
      product.compareAtPrice === undefined ||
      product.compareAtPrice === null ||
      Math.abs(pricing.basePrice - product.compareAtPrice) > EPSILON
    ) {
      updates.compareAtPrice = pricing.basePrice;
    }

    if (Math.abs(pricing.totalPrice - (product.price ?? 0)) > EPSILON) {
      updates.price = pricing.totalPrice;
    }
  }

  const normalized: Product = {
    ...product,
    price: updates.price ?? product.price,
    compareAtPrice: updates.compareAtPrice ?? product.compareAtPrice,
  };

  return {
    normalized,
    pricing,
    updates: Object.keys(updates).length > 0 ? updates : undefined,
  };
};

export const currencyRound = roundCurrency;
