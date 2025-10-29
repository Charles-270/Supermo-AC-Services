/**
 * Authentication Service
 * Handles user profile updates and image uploads
 */

import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface ProfileUpdateData {
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  metadata?: {
    address?: string;
    city?: string;
    region?: string;
    dateOfBirth?: string;
    bio?: string;
    [key: string]: unknown;
  };
}

/**
 * Update user profile in Firestore
 */
export async function updateProfile(userId: string, data: ProfileUpdateData): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }
}

/**
 * Upload profile image to Firebase Storage
 */
export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  try {
    // Create a reference to the file location
    const imageRef = ref(storage, `profile-images/${userId}/${Date.now()}-${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload profile image');
  }
}

/**
 * Generate a presigned URL for profile image upload (if using a different storage service)
 */
export async function generateProfileImageUploadUrl(_userId: string, _fileName: string): Promise<string> {
  // This would be implemented if using a service like AWS S3 with presigned URLs
  // For now, we'll use the direct Firebase upload
  throw new Error('Presigned URLs not implemented for Firebase Storage');
}

/**
 * Delete old profile image from storage
 */
export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the Firebase Storage URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (pathMatch) {
      const imagePath = decodeURIComponent(pathMatch[1]);
      
      // Note: Firebase Storage doesn't have a direct delete method in the client SDK
      // This would typically be handled by a Cloud Function or server-side code
      console.log('Image deletion would be handled server-side:', imagePath);
    }
  } catch (error) {
    console.error('Error deleting profile image:', error);
    // Don't throw here as this is not critical for the user experience
  }
}