/**
 * User Service
 * Manages Firestore user profile operations
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types/user';
import { createDefaultUserProfile } from '@/types/user';

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

/**
 * Create user profile in Firestore
 */
export async function createUserProfile(
  uid: string,
  email: string,
  role: UserRole,
  displayName: string,
  additionalData?: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', uid);

    // Check if profile already exists
    const existingProfile = await getDoc(userRef);
    if (existingProfile.exists()) {
      throw new Error('User profile already exists');
    }

    // Create default profile
    const defaultProfile = createDefaultUserProfile(uid, email, role, displayName);

    // Merge with additional data
    const userProfile: UserProfile = {
      ...defaultProfile,
      ...additionalData,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Save to Firestore
    await setDoc(userRef, userProfile);

    console.log('✅ User profile created:', uid);
    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);
    console.log('✅ User profile updated:', uid);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(uid: string, newRole: UserRole): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ User role updated:', uid, '→', newRole);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

/**
 * Deactivate user account (Admin only)
 */
export async function deactivateUser(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ User deactivated:', uid);
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw new Error('Failed to deactivate user');
  }
}

/**
 * Reactivate user account (Admin only)
 */
export async function reactivateUser(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isActive: true,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ User reactivated:', uid);
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw new Error('Failed to reactivate user');
  }
}

/**
 * Update user metadata (role-specific data)
 */
export async function updateUserMetadata(
  uid: string,
  metadata: Partial<UserProfile['metadata']>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);

    // Fetch current profile to merge metadata
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User profile not found');
    }

    const currentProfile = userSnap.data() as UserProfile;
    const mergedMetadata = {
      ...currentProfile.metadata,
      ...metadata,
    };

    await updateDoc(userRef, {
      metadata: mergedMetadata,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ User metadata updated:', uid);
  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw new Error('Failed to update user metadata');
  }
}

/**
 * Mark email as verified
 */
export async function markEmailVerified(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isEmailVerified: true,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Email marked as verified:', uid);
  } catch (error) {
    console.error('Error marking email as verified:', error);
    throw new Error('Failed to mark email as verified');
  }
}

/**
 * Mark phone as verified
 */
export async function markPhoneVerified(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isPhoneVerified: true,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Phone marked as verified:', uid);
  } catch (error) {
    console.error('Error marking phone as verified:', error);
    throw new Error('Failed to mark phone as verified');
  }
}
