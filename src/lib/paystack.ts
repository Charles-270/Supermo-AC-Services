/**
 * Paystack Payment Integration
 * Ghana's leading payment gateway
 */

import type { PaymentMethod } from '@/types/product';

// Paystack public key (use environment variable in production)
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxx';

export interface PaystackPaymentData {
  email: string;
  amount: number; // In pesewas (GHS * 100)
  reference: string;
  metadata?: {
    customerId?: string;
    orderId?: string;
    customerName?: string;
    [key: string]: any;
  };
  channels?: string[]; // 'card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'
}

export interface PaystackResponse {
  status: 'success' | 'failed' | 'pending';
  reference: string;
  trans: string;
  transaction: string;
  message: string;
  trxref: string;
}

/**
 * Initialize Paystack popup payment
 */
export function initializePaystackPayment(
  paymentData: PaystackPaymentData,
  onSuccess: (response: PaystackResponse) => void,
  onClose: () => void
): void {
  // Check if Paystack script is loaded
  if (typeof window === 'undefined' || !(window as any).PaystackPop) {
    console.error('Paystack script not loaded');
    return;
  }

  console.log('Initializing Paystack payment with:', {
    key: PAYSTACK_PUBLIC_KEY,
    email: paymentData.email,
    amount: paymentData.amount,
    ref: paymentData.reference,
    currency: 'GHS',
    metadata: paymentData.metadata,
    channels: paymentData.channels || ['card', 'mobile_money', 'bank_transfer'],
  });

  const handler = (window as any).PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: paymentData.email,
    amount: paymentData.amount,
    currency: 'GHS', // Ghana Cedis
    ref: paymentData.reference,
    metadata: paymentData.metadata || {},
    channels: paymentData.channels || ['card', 'mobile_money', 'bank_transfer'],
    onClose: () => {
      console.log('Payment popup closed');
      onClose();
    },
    callback: (response: PaystackResponse) => {
      console.log('Payment successful:', response);
      onSuccess(response);
    },
  });

  handler.openIframe();
}

/**
 * Generate unique payment reference
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `SUP-${timestamp}-${random}`;
}

/**
 * Convert GHS to pesewas (Paystack requires amount in pesewas)
 */
export function convertToPesewas(amountInGHS: number): number {
  return Math.round(amountInGHS * 100);
}

/**
 * Get payment channel based on payment method
 */
export function getPaystackChannels(paymentMethod: PaymentMethod): string[] {
  switch (paymentMethod) {
    case 'mtn-mobile-money':
    case 'vodafone-cash':
    case 'airteltigo-money':
      return ['mobile_money'];
    case 'card':
      return ['card'];
    case 'bank-transfer':
      return ['bank_transfer'];
    default:
      return ['card', 'mobile_money', 'bank_transfer'];
  }
}

/**
 * Verify payment (to be called on backend via Cloud Function)
 * This is a frontend helper to trigger verification
 */
export async function verifyPayment(reference: string): Promise<boolean> {
  try {
    // In production, this should call your Cloud Function
    // which will verify with Paystack's API using the secret key
    const response = await fetch(`/api/verify-payment?reference=${reference}`);
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

/**
 * Load Paystack inline script
 */
export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
}
