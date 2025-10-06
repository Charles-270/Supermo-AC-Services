/**
 * Clear All Product Images Script
 * Removes all image URLs from Firestore products
 * Does NOT delete files from Firebase Storage
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

/**
 * Clear all image URLs from Firestore products
 */
export async function clearAllImages(): Promise<void> {
  console.log('🗑️  Clearing all product images from Firestore...');

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
  console.log(`   Total products: ${querySnapshot.docs.length}`);
  console.log(`   Successfully cleared: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);
}
