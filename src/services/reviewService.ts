/**
 * Review Service
 * Handles product and order reviews
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Review, ReviewFormData } from '@/types/review';

/**
 * Create a new review
 */
export async function createReview(
  orderId: string,
  orderNumber: string,
  userId: string,
  userName: string,
  userEmail: string,
  reviewData: ReviewFormData
): Promise<string> {
  try {
    // Upload photos if any
    const photoURLs: string[] = [];
    if (reviewData.photos && reviewData.photos.length > 0) {
      for (const photo of reviewData.photos) {
        const photoRef = ref(storage, `reviews/${orderId}/${Date.now()}_${photo.name}`);
        await uploadBytes(photoRef, photo);
        const url = await getDownloadURL(photoRef);
        photoURLs.push(url);
      }
    }

    // Create review document
    const reviewDoc = {
      orderId,
      orderNumber,
      customerId: userId,
      customerName: userName,
      customerEmail: userEmail,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      photos: photoURLs,
      helpful: 0,
      verified: true, // All order reviews are verified purchases
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'reviews'), reviewDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Get review by order ID
 */
export async function getReviewByOrderId(orderId: string): Promise<Review | null> {
  try {
    const q = query(collection(db, 'reviews'), where('orderId', '==', orderId), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Review;
  } catch (error) {
    console.error('Error getting review:', error);
    throw error;
  }
}

/**
 * Get all reviews (paginated)
 */
export async function getAllReviews(maxResults: number = 50): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw error;
  }
}

/**
 * Update helpful count
 */
export async function markReviewHelpful(reviewId: string): Promise<void> {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (reviewSnap.exists()) {
      const currentHelpful = reviewSnap.data().helpful || 0;
      await updateDoc(reviewRef, {
        helpful: currentHelpful + 1,
      });
    }
  } catch (error) {
    console.error('Error marking review helpful:', error);
    throw error;
  }
}
