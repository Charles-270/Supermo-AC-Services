/**
 * Pricing Service
 * Manages dynamic service pricing that can be updated by admins
 */

import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ServiceType } from '@/types/booking';
import { SERVICE_BASE_PRICING } from '@/types/booking';

/**
 * Dynamic Service Pricing Interface
 */
export interface ServicePricing {
  installation: number;
  maintenance: number;
  repair: number;
  inspection: number;
  lastUpdated: Date;
  updatedBy: string;
}

/**
 * Price Change Notification Interface
 */
export interface PriceChangeNotification {
  id?: string;
  serviceType: ServiceType | 'all';
  oldPrice: number;
  newPrice: number;
  changePercentage: number;
  effectiveDate: Date;
  message: string;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

/**
 * Initialize service pricing document if it doesn't exist
 */
export async function initializeServicePricing(): Promise<void> {
  try {
    const pricingRef = doc(db, 'settings', 'servicePricing');
    const pricingSnap = await getDoc(pricingRef);

    if (!pricingSnap.exists()) {
      await setDoc(pricingRef, {
        installation: SERVICE_BASE_PRICING.installation,
        maintenance: SERVICE_BASE_PRICING.maintenance,
        repair: SERVICE_BASE_PRICING.repair,
        inspection: SERVICE_BASE_PRICING.inspection,
        lastUpdated: serverTimestamp(),
        updatedBy: 'system',
      });
      console.log('✅ Service pricing document initialized with default values');
    }
  } catch (error) {
    console.error('Error initializing pricing:', error);
    throw new Error('Failed to initialize service pricing');
  }
}

/**
 * Get current service pricing (from Firestore or fallback to defaults)
 */
export async function getCurrentPricing(): Promise<ServicePricing> {
  try {
    const pricingRef = doc(db, 'settings', 'servicePricing');
    const pricingSnap = await getDoc(pricingRef);

    if (pricingSnap.exists()) {
      const data = pricingSnap.data();
      return {
        installation: data.installation || SERVICE_BASE_PRICING.installation,
        maintenance: data.maintenance || SERVICE_BASE_PRICING.maintenance,
        repair: data.repair || SERVICE_BASE_PRICING.repair,
        inspection: data.inspection || SERVICE_BASE_PRICING.inspection,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        updatedBy: data.updatedBy || 'system',
      };
    }

    // Initialize document if it doesn't exist
    await initializeServicePricing();

    // Return default pricing
    return {
      installation: SERVICE_BASE_PRICING.installation,
      maintenance: SERVICE_BASE_PRICING.maintenance,
      repair: SERVICE_BASE_PRICING.repair,
      inspection: SERVICE_BASE_PRICING.inspection,
      lastUpdated: new Date(),
      updatedBy: 'system',
    };
  } catch (error) {
    console.error('Error getting current pricing:', error);
    // Fallback to default pricing
    return {
      installation: SERVICE_BASE_PRICING.installation,
      maintenance: SERVICE_BASE_PRICING.maintenance,
      repair: SERVICE_BASE_PRICING.repair,
      inspection: SERVICE_BASE_PRICING.inspection,
      lastUpdated: new Date(),
      updatedBy: 'system',
    };
  }
}

/**
 * Update service pricing (Admin only)
 */
export async function updateServicePricing(
  newPricing: Omit<ServicePricing, 'lastUpdated' | 'updatedBy'>,
  adminId: string,
  adminName: string
): Promise<void> {
  try {
    // Get current pricing for comparison
    const currentPricing = await getCurrentPricing();

    // Update pricing in Firestore
    const pricingRef = doc(db, 'settings', 'servicePricing');
    await setDoc(pricingRef, {
      ...newPricing,
      lastUpdated: serverTimestamp(),
      updatedBy: adminId,
    });

    // Create notifications for price changes
    const notifications: {
      serviceType: ServiceType;
      oldPrice: number;
      newPrice: number;
      changePercentage: number;
      message: string;
      createdBy: string;
      isActive: boolean;
    }[] = [];

    // Check each service type for changes
    const serviceTypes: ServiceType[] = ['installation', 'maintenance', 'repair', 'inspection'];

    for (const serviceType of serviceTypes) {
      const oldPrice = currentPricing[serviceType];
      const newPrice = newPricing[serviceType];

      if (oldPrice !== newPrice) {
        const changePercentage = ((newPrice - oldPrice) / oldPrice) * 100;
        const isIncrease = newPrice > oldPrice;

        notifications.push({
          serviceType,
          oldPrice,
          newPrice,
          changePercentage,
          message: `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} service price ${isIncrease ? 'increased' : 'decreased'} from GHC ${oldPrice} to GHC ${newPrice} (${Math.abs(changePercentage).toFixed(1)}% ${isIncrease ? 'increase' : 'decrease'})`,
          createdBy: adminName,
          isActive: true,
        });
      }
    }

    // Save notifications to Firestore
    if (notifications.length > 0) {
      const notificationsRef = collection(db, 'priceChangeNotifications');

      for (const notification of notifications) {
        await addDoc(notificationsRef, {
          serviceType: notification.serviceType,
          oldPrice: notification.oldPrice,
          newPrice: notification.newPrice,
          changePercentage: notification.changePercentage,
          message: notification.message,
          createdBy: notification.createdBy,
          isActive: notification.isActive,
          createdAt: serverTimestamp(),
          effectiveDate: serverTimestamp(),
        });
      }

      console.log(`✅ Created ${notifications.length} price change notifications`);
    }

    console.log('✅ Service pricing updated successfully');
  } catch (error) {
    console.error('Error updating service pricing:', error);
    throw new Error('Failed to update service pricing');
  }
}

/**
 * Get price for a specific service type
 */
export async function getServicePrice(serviceType: ServiceType): Promise<number> {
  try {
    const pricing = await getCurrentPricing();
    return pricing[serviceType];
  } catch (error) {
    console.error('Error getting service price:', error);
    return SERVICE_BASE_PRICING[serviceType];
  }
}

/**
 * Get all active price change notifications
 */
export async function getActivePriceNotifications(): Promise<PriceChangeNotification[]> {
  try {
    // For now, return empty array - in a real implementation, 
    // you would query the priceChangeNotifications collection
    // and filter for active notifications
    return [];
  } catch (error) {
    console.error('Error getting price notifications:', error);
    return [];
  }
}

/**
 * Calculate pricing impact for customers and technicians
 */
export function calculatePricingImpact(
  oldPricing: ServicePricing,
  newPricing: ServicePricing
): {
  serviceType: ServiceType;
  oldPrice: number;
  newPrice: number;
  changeAmount: number;
  changePercentage: number;
  customerImpact: string;
  technicianImpact: string;
}[] {
  const serviceTypes: ServiceType[] = ['installation', 'maintenance', 'repair', 'inspection'];

  return serviceTypes
    .map(serviceType => {
      const oldPrice = oldPricing[serviceType];
      const newPrice = newPricing[serviceType];
      const changeAmount = newPrice - oldPrice;
      const changePercentage = (changeAmount / oldPrice) * 100;

      if (changeAmount === 0) return null;

      const technicianChangeAmount = changeAmount * 0.9; // 90% to technician

      return {
        serviceType,
        oldPrice,
        newPrice,
        changeAmount,
        changePercentage,
        customerImpact: `${changeAmount > 0 ? '+' : ''}GHC ${Math.abs(changeAmount).toFixed(2)} (${changePercentage > 0 ? '+' : ''}${changePercentage.toFixed(1)}%)`,
        technicianImpact: `${technicianChangeAmount > 0 ? '+' : ''}GHC ${Math.abs(technicianChangeAmount).toFixed(2)} per job`,
      };
    })
    .filter(Boolean) as any[];
}