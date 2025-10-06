/**
 * Platform Settings Service
 * Manages platform configuration stored in Firestore
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  DocumentReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlatformSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

const SETTINGS_DOC_ID = 'platform_config';

/**
 * Get platform settings
 * If settings don't exist, creates them with defaults
 */
export async function getSettings(): Promise<PlatformSettings> {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return settingsSnap.data() as PlatformSettings;
    } else {
      // Initialize with default settings
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        updatedAt: serverTimestamp(),
      });
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw new Error('Failed to fetch platform settings');
  }
}

/**
 * Update platform settings
 * @param settings - Partial settings to update
 * @param updatedBy - UID of admin making the update
 */
export async function updateSettings(
  settings: Partial<PlatformSettings>,
  updatedBy: string
): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);

    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
      updatedBy,
    });

    console.log('✅ Platform settings updated successfully');
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update platform settings');
  }
}

/**
 * Update general settings
 */
export async function updateGeneralSettings(
  generalSettings: Partial<PlatformSettings['general']>,
  updatedBy: string
): Promise<void> {
  const currentSettings = await getSettings();
  await updateSettings(
    {
      general: {
        ...currentSettings.general,
        ...generalSettings,
      },
    },
    updatedBy
  );
}

/**
 * Update service settings
 */
export async function updateServiceSettings(
  serviceSettings: Partial<PlatformSettings['service']>,
  updatedBy: string
): Promise<void> {
  const currentSettings = await getSettings();
  await updateSettings(
    {
      service: {
        ...currentSettings.service,
        ...serviceSettings,
      },
    },
    updatedBy
  );
}

/**
 * Update payment settings
 */
export async function updatePaymentSettings(
  paymentSettings: Partial<PlatformSettings['payment']>,
  updatedBy: string
): Promise<void> {
  const currentSettings = await getSettings();
  await updateSettings(
    {
      payment: {
        ...currentSettings.payment,
        ...paymentSettings,
      },
    },
    updatedBy
  );
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  notificationSettings: Partial<PlatformSettings['notifications']>,
  updatedBy: string
): Promise<void> {
  const currentSettings = await getSettings();
  await updateSettings(
    {
      notifications: {
        ...currentSettings.notifications,
        ...notificationSettings,
      },
    },
    updatedBy
  );
}

/**
 * Update system settings
 */
export async function updateSystemSettings(
  systemSettings: Partial<PlatformSettings['system']>,
  updatedBy: string
): Promise<void> {
  const currentSettings = await getSettings();
  await updateSettings(
    {
      system: {
        ...currentSettings.system,
        ...systemSettings,
      },
    },
    updatedBy
  );
}

/**
 * Subscribe to real-time settings updates
 * @param callback - Function to call when settings change
 * @returns Unsubscribe function
 */
export function subscribeToSettings(
  callback: (settings: PlatformSettings) => void
): () => void {
  const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);

  const unsubscribe = onSnapshot(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as PlatformSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      console.error('Error subscribing to settings:', error);
      callback(DEFAULT_SETTINGS);
    }
  );

  return unsubscribe;
}

/**
 * Reset settings to defaults (admin only, use with caution!)
 */
export async function resetToDefaults(updatedBy: string): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);

    await setDoc(settingsRef, {
      ...DEFAULT_SETTINGS,
      updatedAt: serverTimestamp(),
      updatedBy,
    });

    console.log('✅ Platform settings reset to defaults');
  } catch (error) {
    console.error('Error resetting settings:', error);
    throw new Error('Failed to reset settings to defaults');
  }
}

/**
 * Enable/disable maintenance mode
 */
export async function setMaintenanceMode(
  enabled: boolean,
  message: string = DEFAULT_SETTINGS.system.maintenanceMessage,
  updatedBy: string
): Promise<void> {
  await updateSystemSettings(
    {
      maintenanceMode: enabled,
      maintenanceMessage: message,
    },
    updatedBy
  );
}

/**
 * Toggle a feature on/off
 */
export async function toggleFeature(
  feature: keyof PlatformSettings['system']['features'],
  enabled: boolean,
  updatedBy: string
): Promise<void> {
  const currentSettings = await getSettings();
  await updateSystemSettings(
    {
      features: {
        ...currentSettings.system.features,
        [feature]: enabled,
      },
    },
    updatedBy
  );
}
