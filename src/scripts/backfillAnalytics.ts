/**
 * Analytics Backfill Script
 *
 * Purpose:
 *  - Aggregates historical order data into analytics-friendly collections.
 *  - Populates:
 *      • analytics_daily (per-day revenue, orders, top products)
 *      • analytics_top_products/all-time (global top products summary)
 *
 * How to run (development):
 *  1. Ensure you are signed in as an admin in the running web app.
 *  2. Open your browser devtools console on the admin app.
 *  3. Paste the compiled script output (or run via Vite console tooling).
 *  4. Execute `backfillAnalytics()` and monitor console output.
 *
 * NOTE: This script relies on Firestore security rules granting admins write
 *       access to analytics collections.
 */

import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
} from 'firebase/firestore';
import {
  aggregateDailyOrders,
  finalizeDailyAggregates,
  computeTopProductsAllTime,
} from '@/utils/analyticsRollup';
const DAILY_COLLECTION = 'analytics_daily';
const TOP_PRODUCTS_COLLECTION = 'analytics_top_products';
const TOP_PRODUCTS_DOC_ID = 'all-time';
const BATCH_WRITE_THRESHOLD = 400;

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
};

export async function backfillAnalytics(): Promise<void> {
  console.group('%c🔄 Analytics Backfill', 'color: #2563eb; font-weight: bold; font-size: 14px');

  try {
    console.time('⏱️  Backfill duration');
    console.log('📦 Fetching orders…');

    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const orders = ordersSnapshot.docs.map((docSnap) => docSnap.data());

    if (orders.length === 0) {
      console.warn('⚠️  No orders found. Nothing to backfill.');
      console.timeEnd('⏱️  Backfill duration');
      console.groupEnd();
      return;
    }

    console.log(`✅ Loaded ${orders.length} orders`);

    console.log('📊 Aggregating daily analytics…');
    const dailyAggregated = finalizeDailyAggregates(aggregateDailyOrders(orders), 10);

    console.log('🏆 Computing all-time top products…');
    const allTimeTopProducts = computeTopProductsAllTime(orders, 25);

    let batch = writeBatch(db);
    let writesInBatch = 0;
    let dailyDocumentsWritten = 0;

    const commitBatchIfNeeded = async () => {
      if (writesInBatch === 0) {
        return;
      }
      await batch.commit();
      batch = writeBatch(db);
      writesInBatch = 0;
    };

    for (const entry of dailyAggregated) {
      const date = parseDateKey(entry.dateKey);
      const dailyDocRef = doc(db, DAILY_COLLECTION, entry.dateKey);

      batch.set(dailyDocRef, {
        dateKey: entry.dateKey,
        date: Timestamp.fromDate(date),
        revenue: entry.revenue,
        orders: entry.orders,
        topProducts: entry.topProducts,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      writesInBatch += 1;
      dailyDocumentsWritten += 1;

      if (writesInBatch >= BATCH_WRITE_THRESHOLD) {
        await commitBatchIfNeeded();
      }
    }

    const topProductsDocRef = doc(db, TOP_PRODUCTS_COLLECTION, TOP_PRODUCTS_DOC_ID);
    batch.set(topProductsDocRef, {
      generatedAt: Timestamp.now(),
      products: allTimeTopProducts,
      updatedAt: Timestamp.now(),
    });
    writesInBatch += 1;

    if (writesInBatch > 0) {
      await commitBatchIfNeeded();
    }

    console.log(`✅ Backfilled ${dailyDocumentsWritten} daily analytics documents`);
    console.log(
      `✅ Stored ${allTimeTopProducts.length} all-time top product summaries (${new Date().toISOString()})`
    );

    console.timeEnd('⏱️  Backfill duration');
    console.log('%c🎉 Analytics backfill complete!', 'color: #10b981; font-weight: bold;');
  } catch (error) {
    console.error('❌ Analytics backfill failed:', error);
  } finally {
    console.groupEnd();
  }
}

// Convenience for console execution
// @ts-expect-error -- intentionally assigning to window in browser context
if (typeof window !== 'undefined') window.backfillAnalytics = backfillAnalytics;
