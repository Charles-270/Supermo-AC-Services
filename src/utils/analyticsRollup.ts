/**
 * Analytics Rollup Utilities
 * Pure functions for aggregating order data into analytics-friendly summaries.
 */

import type { Timestamp } from 'firebase/firestore';
import type { OrderItem } from '@/types/product';
import { resolveDate } from '@/lib/utils';

export type DateLike = Date | string | number | Timestamp | { toDate: () => Date } | null | undefined;

export interface OrderAnalyticsItem {
  productId?: string;
  productName?: string;
  quantity?: number;
  subtotal?: number;
}

export interface OrderAnalyticsRecord {
  createdAt?: DateLike;
  totalAmount?: number;
  paymentStatus?: string;
  items?: OrderAnalyticsItem[] | OrderItem[];
}

export interface DailyProductAggregate {
  productId: string;
  productName: string;
  units: number;
  revenue: number;
}

interface DailyAggregateInternal {
  revenue: number;
  orders: number;
  products: Map<string, DailyProductAggregate>;
}

export interface DailyAggregate {
  dateKey: string;
  revenue: number;
  orders: number;
  topProducts: DailyProductAggregate[];
}

export const PAID_PAYMENT_STATUSES = new Set(['paid', 'completed']);

export const isPaidStatus = (status: unknown): boolean =>
  typeof status === 'string' && PAID_PAYMENT_STATUSES.has(status);

export const toDateKey = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ensureProductAggregate = (
  productMap: Map<string, DailyProductAggregate>,
  item: OrderAnalyticsItem
): DailyProductAggregate | null => {
  const productId = item.productId;
  if (!productId) {
    return null;
  }

  if (!productMap.has(productId)) {
    productMap.set(productId, {
      productId,
      productName: item.productName || 'Unknown Product',
      units: 0,
      revenue: 0,
    });
  }

  return productMap.get(productId) ?? null;
};

export const aggregateDailyOrders = (
  orders: OrderAnalyticsRecord[]
): Map<string, DailyAggregateInternal> => {
  const dailyMap = new Map<string, DailyAggregateInternal>();

  for (const order of orders) {
    if (!isPaidStatus(order.paymentStatus)) {
      continue;
    }

    const createdAt = resolveDate(order.createdAt);
    if (!createdAt) {
      continue;
    }

    const dateKey = toDateKey(createdAt);
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        revenue: 0,
        orders: 0,
        products: new Map(),
      });
    }

    const aggregate = dailyMap.get(dateKey)!;
    aggregate.orders += 1;
    aggregate.revenue += Number(order.totalAmount ?? 0) || 0;

    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const productAggregate = ensureProductAggregate(aggregate.products, item);
        if (!productAggregate) {
          continue;
        }

        const quantity = Number(item.quantity ?? 0) || 0;
        const revenue = Number(item.subtotal ?? productAggregate.revenue) || 0;
        productAggregate.units += quantity;
        productAggregate.revenue += revenue;
      }
    }
  }

  return dailyMap;
};

export const finalizeDailyAggregates = (
  dailyMap: Map<string, DailyAggregateInternal>,
  topProductsLimit: number = 5
): DailyAggregate[] => {
  const entries: DailyAggregate[] = [];

  dailyMap.forEach((value, dateKey) => {
    const topProducts = Array.from(value.products.values())
      .sort((a, b) => {
        if (b.units === a.units) {
          return b.revenue - a.revenue;
        }
        return b.units - a.units;
      })
      .slice(0, topProductsLimit);

    entries.push({
      dateKey,
      revenue: Number(value.revenue),
      orders: value.orders,
      topProducts,
    });
  });

  entries.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return entries;
};

export const computeTopProductsAllTime = (
  orders: OrderAnalyticsRecord[],
  limit: number = 10
): DailyProductAggregate[] => {
  const productMap = new Map<string, DailyProductAggregate>();

  for (const order of orders) {
    if (!isPaidStatus(order.paymentStatus) || !Array.isArray(order.items)) {
      continue;
    }

    for (const item of order.items) {
      const aggregate = ensureProductAggregate(productMap, item);
      if (!aggregate) {
        continue;
      }

      const quantity = Number(item.quantity ?? 0) || 0;
      const revenue = Number(item.subtotal ?? 0) || 0;
      aggregate.units += quantity;
      aggregate.revenue += revenue;
    }
  }

  return Array.from(productMap.values())
    .sort((a, b) => {
      if (b.units === a.units) {
        return b.revenue - a.revenue;
      }
      return b.units - a.units;
    })
    .slice(0, limit);
};

export const upsertDailyMap = (
  baseMap: Map<string, DailyAggregateInternal>,
  additional: Map<string, DailyAggregateInternal>
): Map<string, DailyAggregateInternal> => {
  additional.forEach((value, key) => {
    if (!baseMap.has(key)) {
      baseMap.set(key, {
        revenue: value.revenue,
        orders: value.orders,
        products: new Map(value.products),
      });
      return;
    }

    const existing = baseMap.get(key)!;
    existing.revenue += value.revenue;
    existing.orders += value.orders;

    value.products.forEach((productValue, productId) => {
      if (!existing.products.has(productId)) {
        existing.products.set(productId, { ...productValue });
        return;
      }

      const current = existing.products.get(productId)!;
      current.units += productValue.units;
      current.revenue += productValue.revenue;
    });
  });

  return baseMap;
};

export const __testables = {
  isPaidStatus,
  toDateKey,
  aggregateDailyOrders,
  finalizeDailyAggregates,
  computeTopProductsAllTime,
  ensureProductAggregate, // exposed for unit tests
};
