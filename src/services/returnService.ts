/**
 * Return/Refund Service
 * Handle return requests and refund processing
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  description: string;
  requestedAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  createdAt: Timestamp;
  processedAt?: Timestamp;
  adminNotes?: string;
}

/**
 * Submit return request
 */
export async function submitReturnRequest(
  orderId: string,
  orderNumber: string,
  customerId: string,
  customerName: string,
  customerEmail: string,
  reason: string,
  description: string,
  requestedAmount: number
): Promise<string> {
  try {
    const returnDoc = {
      orderId,
      orderNumber,
      customerId,
      customerName,
      customerEmail,
      reason,
      description,
      requestedAmount,
      status: 'pending',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'returns'), returnDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting return request:', error);
    throw error;
  }
}

/**
 * Get return request by order ID
 */
export async function getReturnByOrderId(orderId: string): Promise<ReturnRequest | null> {
  try {
    const q = query(collection(db, 'returns'), where('orderId', '==', orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ReturnRequest;
  } catch (error) {
    console.error('Error getting return request:', error);
    throw error;
  }
}

/**
 * Process return request (admin)
 */
export async function processReturnRequest(
  returnId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<void> {
  try {
    const returnRef = doc(db, 'returns', returnId);
    await updateDoc(returnRef, {
      status,
      adminNotes,
      processedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error processing return:', error);
    throw error;
  }
}
