import { describe, it, expect } from 'vitest';
import {
  aggregateDailyOrders,
  finalizeDailyAggregates,
  computeTopProductsAllTime,
  isPaidStatus,
} from '@/utils/analyticsRollup';

describe('analyticsRollup utilities', () => {
  const sampleOrders = [
    {
      createdAt: new Date('2025-10-27T10:00:00Z'),
      paymentStatus: 'paid',
      totalAmount: 500,
      items: [
        { productId: 'p-1', productName: 'Split AC', quantity: 1, subtotal: 400 },
        { productId: 'p-2', productName: 'Installation Kit', quantity: 1, subtotal: 100 },
      ],
    },
    {
      createdAt: new Date('2025-10-27T18:30:00Z'),
      paymentStatus: 'completed',
      totalAmount: 250,
      items: [{ productId: 'p-2', productName: 'Installation Kit', quantity: 1, subtotal: 250 }],
    },
    {
      createdAt: new Date('2025-10-28T09:15:00Z'),
      paymentStatus: 'pending',
      totalAmount: 300,
      items: [{ productId: 'p-3', productName: 'Filter', quantity: 2, subtotal: 300 }],
    },
  ];

  it('recognises paid payment statuses', () => {
    expect(isPaidStatus('paid')).toBe(true);
    expect(isPaidStatus('completed')).toBe(true);
    expect(isPaidStatus('pending')).toBe(false);
    expect(isPaidStatus(undefined)).toBe(false);
  });

  it('aggregates daily orders while ignoring unpaid orders', () => {
    const dailyMap = aggregateDailyOrders(sampleOrders);
    const results = finalizeDailyAggregates(dailyMap, 5);

    expect(results).toHaveLength(1);
    expect(results[0].dateKey).toBe('2025-10-27');
    expect(results[0].orders).toBe(2);
    expect(results[0].revenue).toBe(750);

    const [topProduct] = results[0].topProducts;
    expect(topProduct.productId).toBe('p-2');
    expect(topProduct.units).toBe(2);
    expect(topProduct.revenue).toBe(350);
  });

  it('computes all-time top products', () => {
    const topProducts = computeTopProductsAllTime(sampleOrders, 3);

    expect(topProducts).toHaveLength(2);
    expect(topProducts[0]).toMatchObject({
      productId: 'p-2',
      units: 2,
      revenue: 350,
    });
    expect(topProducts[1]).toMatchObject({
      productId: 'p-1',
      units: 1,
      revenue: 400,
    });
  });
});
