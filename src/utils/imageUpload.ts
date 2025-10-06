/**
 * Firebase Storage Image Upload Utility
 * Handles product image uploads with optimization
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

/**
 * Upload product image to Firebase Storage
 */
export async function uploadProductImage(
  file: File,
  productName: string
): Promise<UploadResult> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG, WebP, or AVIF images.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  // Create sanitized product name for folder
  const sanitizedName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Generate unique filename with timestamp
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const fileName = `${sanitizedName}-${timestamp}.${extension}`;

  // Create storage path
  const storagePath = `products/${sanitizedName}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        productName,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: storagePath,
      fileName,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image to Firebase Storage');
  }
}

/**
 * Upload multiple product images
 */
export async function uploadMultipleImages(
  files: File[],
  productNames: string[],
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<UploadResult[]> {
  if (files.length !== productNames.length) {
    throw new Error('Number of files must match number of product names');
  }

  const results: UploadResult[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const productName = productNames[i];

    try {
      const result = await uploadProductImage(file, productName);
      results.push(result);

      // Report progress
      if (onProgress) {
        const progress = Math.round(((i + 1) / total) * 100);
        onProgress(progress, i + 1, total);
      }
    } catch (error) {
      console.error(`Failed to upload image for ${productName}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Compress image before upload (optional, for future enhancement)
 */
export async function compressImage(file: File, maxWidth: number = 1200): Promise<File> {
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

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          0.85 // 85% quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
