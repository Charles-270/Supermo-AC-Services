/**
 * User Service
 * Manages Firestore user profile operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
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

    // Merge with additional data, filtering out undefined values
    const cleanedAdditionalData = additionalData
      ? Object.fromEntries(
          Object.entries(additionalData).filter(([_, v]) => v !== undefined)
        )
      : {};

    const userProfile: UserProfile = {
      ...defaultProfile,
      ...cleanedAdditionalData,
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

/**
 * Approve user account (Admin only)
 */
export async function approveUser(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isApproved: true,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ User approved:', uid);
  } catch (error) {
    console.error('Error approving user:', error);
    throw new Error('Failed to approve user');
  }
}

/**
 * Get all pending approval users (Admin only)
 */
export async function getPendingApprovalUsers(): Promise<any[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('isApproved', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const users: any[] = [];

    querySnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data(),
      });
    });

    return users;
  } catch (error) {
    console.error('Error getting pending approval users:', error);
    throw new Error('Failed to fetch pending approval users');
  }
}

/**
 * Get pending admin approval users (Admin only)
 * Specifically for approving admin role requests
 */
export async function getPendingAdminApprovals(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('isApproved', '==', false),
      where('role', '==', 'admin')
    );

    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data(),
      } as UserProfile);
    });

    return users;
  } catch (error) {
    console.error('Error getting pending admin approvals:', error);
    throw new Error('Failed to fetch pending admin approvals');
  }
}

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data(),
      } as UserProfile);
    });

    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw new Error('Failed to fetch all users');
  }
}

/**
 * Get users by role (Admin only)
 */
export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role));

    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data(),
      } as UserProfile);
    });

    return users;
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw new Error('Failed to fetch users by role');
  }
}

/**
 * Search users by name or email (Admin only)
 */
export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      const matchesName = userData.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEmail = userData.email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (matchesName || matchesEmail) {
        users.push({
          uid: doc.id,
          ...userData,
        });
      }
    });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users');
  }
}

/**
 * Delete user account (Admin only - WARNING: Permanent)
 */
export async function deleteUserProfile(uid: string): Promise<void> {
  try {
    // Note: This only deletes the Firestore profile
    // Firebase Authentication user must be deleted separately via Admin SDK
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isActive: false,
      isApproved: false,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ User profile deleted (soft delete):', uid);
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw new Error('Failed to delete user profile');
  }
}
