/**
 * Clear Product Images Script
 * Removes all image URLs from existing Firestore products
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

/**
 * Clear all images from Firestore products
 */
export async function clearAllProductImages(): Promise<void> {
  console.log('🗑️  Clearing all product images...');

  const productsCollection = collection(db, 'products');
  const querySnapshot = await getDocs(productsCollection);

  let successCount = 0;
  let errorCount = 0;

  for (const productDoc of querySnapshot.docs) {
    const product = productDoc.data();

    try {
      const productRef = doc(db, 'products', productDoc.id);
      await updateDoc(productRef, {
        images: [],
        updatedAt: new Date(),
      });
      successCount++;
      console.log(`✓ Cleared images for: ${product.name}`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to clear: ${product.name}`, error);
    }
  }

  console.log(`\n✅ Image cleanup complete!`);
  console.log(`   Successfully cleared: ${successCount} products`);
  console.log(`   Failed: ${errorCount} products`);
}
