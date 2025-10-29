/**
 * Remove Duplicate Products Script
 * Removes duplicate products from Firestore based on product name
 * Keeps only the oldest entry (first created) for each product
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

interface ProductData {
  id: string;
  name: string;
  createdAt: { toDate: () => Date } | Date | undefined;
}

/**
 * Remove duplicate products from Firestore
 * Keeps the oldest product for each unique name
 */
export async function removeDuplicateProducts(): Promise<void> {
  console.log('🔍 Scanning for duplicate products...');

  const productsCollection = collection(db, 'products');
  const q = query(productsCollection, orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);

  // Group products by name
  const productsByName = new Map<string, ProductData[]>();

  querySnapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const product: ProductData = {
      id: docSnap.id,
      name: data.name,
      createdAt: data.createdAt,
    };

    if (!productsByName.has(product.name)) {
      productsByName.set(product.name, []);
    }
    productsByName.get(product.name)!.push(product);
  });

  // Find and remove duplicates
  let duplicatesFound = 0;
  let duplicatesRemoved = 0;

  for (const [name, products] of productsByName.entries()) {
    if (products.length > 1) {
      duplicatesFound++;
      console.log(`\n📦 Found ${products.length} copies of: "${name}"`);

      // Keep the first (oldest) product, delete the rest
      const toKeep = products[0];
      const toDelete = products.slice(1);

      console.log(`   ✓ Keeping: ${toKeep.id} (created first)`);

      for (const duplicate of toDelete) {
        try {
          await deleteDoc(doc(db, 'products', duplicate.id));
          duplicatesRemoved++;
          console.log(`   ✗ Deleted: ${duplicate.id} (duplicate)`);
        } catch (error) {
          console.error(`   ❌ Failed to delete ${duplicate.id}:`, error);
        }
      }
    }
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Total products scanned: ${querySnapshot.docs.length}`);
  console.log(`   Unique product names: ${productsByName.size}`);
  console.log(`   Products with duplicates: ${duplicatesFound}`);
  console.log(`   Duplicates removed: ${duplicatesRemoved}`);
  console.log(`   Products remaining: ${querySnapshot.docs.length - duplicatesRemoved}`);
}
