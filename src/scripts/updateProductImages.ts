/**
 * Update Product Images Script
 * Updates existing Firestore products with new image URLs
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Map of product names to new image URLs (using reliable, CORS-friendly sources)
const IMAGE_UPDATES: Record<string, string[]> = {
  'Samsung 1.0HP Split Air Conditioner': [
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
  ],
  'LG 1.5HP Dual Inverter Split AC': [
    'https://images.unsplash.com/photo-1631545806609-47c7c0ff6449?w=800&q=80',
  ],
  'Hisense 2.0HP Split Air Conditioner': [
    'https://images.unsplash.com/photo-1592422746281-bbdb0ce2d833?w=800&q=80',
  ],
  'Midea 1.5HP Inverter Split AC': [
    'https://images.unsplash.com/photo-1608450771031-00a6c194a34f?w=800&q=80',
  ],
  'Nasco 1.0HP Split Air Conditioner': [
    'https://images.unsplash.com/photo-1635274558620-07900ce8e418?w=800&q=80',
  ],
  'Bruhm 2.5HP Split AC - Heavy Duty': [
    'https://images.unsplash.com/photo-1624197187738-67a1a3d814d4?w=800&q=80',
  ],
  'TCL 1.5HP Inverter Split AC': [
    'https://images.unsplash.com/photo-1582293426555-4d4e0e3bb5c6?w=800&q=80',
  ],
  'Gree 3.0HP Floor Standing AC': [
    'https://images.unsplash.com/photo-1620624408690-83e64373e754?w=800&q=80',
  ],
  'LG Multi-Split 4-Zone Central AC System': [
    'https://images.unsplash.com/photo-1623874228601-f4193c7b1818?w=800&q=80',
  ],
  'Daikin VRV Central AC - 5 Ton': [
    'https://images.unsplash.com/photo-1617618166889-d7d0684a1e48?w=800&q=80',
  ],
  'Universal AC Remote Control': [
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
  ],
  'AC Compressor 1.5HP - Universal': [
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
  ],
  'AC Fan Motor - Indoor Unit': [
    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80',
  ],
  'AC Capacitor - 35uF': [
    'https://images.unsplash.com/photo-1517420704952-d9f39e0b2176?w=800&q=80',
  ],
  'AC Refrigerant Gas - R410A (5kg)': [
    'https://images.unsplash.com/photo-1597524234030-b4cf4e3d3c83?w=800&q=80',
  ],
  'AC Circuit Board - Universal PCB': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  ],
  'AC Drain Pump - Condensate Removal': [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
  ],
  'AC Installation Kit - Complete Set': [
    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80',
  ],
  'AC Wall Mounting Bracket - Heavy Duty': [
    'https://images.unsplash.com/photo-1593078165530-64604ea62c36?w=800&q=80',
  ],
  'AC Filter - HEPA Air Purification': [
    'https://images.unsplash.com/photo-1607473256992-1aa97bb8c72d?w=800&q=80',
  ],
  'AC Cover - Outdoor Unit Protection': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ],
  'AC Stabilizer - Voltage Protector 2000W': [
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80',
  ],
  'AC Cleaning Kit - Professional Grade': [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
  ],
  'Smart AC Controller - WiFi Enabled': [
    'https://images.unsplash.com/photo-1558089687-b72e6019d3c2?w=800&q=80',
  ],
  'AC Copper Pipe Set - 5 Meters': [
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
  ],
  'AC Thermostat - Digital Programmable': [
    'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
  ],
};

/**
 * Update product images in Firestore
 */
export async function updateProductImages(): Promise<void> {
  console.log('🔄 Starting product image updates...');

  const productsCollection = collection(db, 'products');
  const querySnapshot = await getDocs(productsCollection);

  let successCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;

  for (const productDoc of querySnapshot.docs) {
    const product = productDoc.data();
    const newImages = IMAGE_UPDATES[product.name];

    if (newImages) {
      try {
        const productRef = doc(db, 'products', productDoc.id);
        await updateDoc(productRef, {
          images: newImages,
          updatedAt: new Date(),
        });
        successCount++;
        console.log(`✓ Updated: ${product.name}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to update: ${product.name}`, error);
      }
    } else {
      notFoundCount++;
      console.log(`⚠ No image update for: ${product.name}`);
    }
  }

  console.log(`\n✅ Update complete!`);
  console.log(`   Successfully updated: ${successCount} products`);
  console.log(`   Failed: ${errorCount} products`);
  console.log(`   No updates available: ${notFoundCount} products`);
}

// Note: This script is deprecated in favor of the automated upload page at /admin/upload-images
// The export is kept for backward compatibility but should not be used in browser context
