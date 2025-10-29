/**
 * Firebase Storage Service
 * Handles file uploads for job photos and other media
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Compress image before upload
 * Reduces file size for faster uploads on 3G/4G networks
 */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          'image/jpeg',
          0.8 // Quality: 0-1 (0.8 = 80% quality)
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

/**
 * Upload a job photo to Firebase Storage
 * @param file - Image file to upload
 * @param bookingId - ID of the booking/job
 * @param type - 'before' or 'after' photo
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise with download URL
 */
export async function uploadJobPhoto(
  file: File,
  bookingId: string,
  type: 'before' | 'after',
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Validate file size (max 10MB before compression)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Compress image
    console.log(`📸 Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    const compressedFile = await compressImage(file);
    console.log(`✅ Compressed to: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

    // Create storage reference
    const timestamp = Date.now();
    const fileName = `${timestamp}_${type}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `jobs/${bookingId}/photos/${fileName}`);

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, compressedFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
          console.log(`Upload progress: ${Math.round(progress)}%`);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Failed to upload photo'));
        },
        async () => {
          // Upload complete, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ Photo uploaded:', downloadURL);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

/**
 * Delete a photo from Firebase Storage
 * @param photoUrl - Full download URL of the photo
 */
export async function deleteJobPhoto(photoUrl: string): Promise<void> {
  try {
    // Extract storage path from download URL
    // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const url = new URL(photoUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)/);

    if (!pathMatch) {
      throw new Error('Invalid photo URL');
    }

    const path = decodeURIComponent(pathMatch[1]);
    const photoRef = ref(storage, path);

    await deleteObject(photoRef);
    console.log('✅ Photo deleted:', path);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw new Error('Failed to delete photo');
  }
}

/**
 * Upload multiple photos
 * @param files - Array of image files
 * @param bookingId - ID of the booking/job
 * @param type - 'before' or 'after' photos
 * @param onProgress - Optional callback for overall progress
 * @returns Promise with array of download URLs
 */
export async function uploadMultiplePhotos(
  files: File[],
  bookingId: string,
  type: 'before' | 'after',
  onProgress?: (progress: number) => void
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file, index) =>
      uploadJobPhoto(file, bookingId, type, (fileProgress) => {
        // Calculate overall progress
        if (onProgress) {
          const overallProgress = ((index * 100 + fileProgress) / files.length);
          onProgress(Math.round(overallProgress));
        }
      })
    );

    const urls = await Promise.all(uploadPromises);
    console.log(`✅ All ${files.length} photos uploaded`);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple photos:', error);
    throw new Error('Failed to upload photos');
  }
}

export async function uploadSupplierCatalogImage(
  file: File,
  supplierId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    const compressedFile = await compressImage(file);
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(
      storage,
      `supplier_catalog_requests/${supplierId}/${fileName}`
    );

    const uploadTask = uploadBytesResumable(storageRef, compressedFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Failed to upload photo'));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading supplier catalog image:', error);
    throw error;
  }
}

export async function deleteSupplierCatalogImage(photoUrl: string): Promise<void> {
  await deleteJobPhoto(photoUrl);
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(file: File): string | null {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed';
  }

  // Check file size (max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return 'File size must be less than 10MB';
  }

  return null; // Valid
}
