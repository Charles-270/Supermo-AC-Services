/**
 * Paystack Payment Integration
 * Ghana's leading payment gateway
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
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
    [key: string]: string | number | boolean | undefined;
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
 * Automatically loads Paystack script if not already loaded (on-demand)
 */
export async function initializePaystackPayment(
  paymentData: PaystackPaymentData,
  onSuccess: (response: PaystackResponse) => void,
  onClose: () => void
): Promise<void> {
  try {
    // Load Paystack script on-demand if not already loaded
    if (typeof window === 'undefined' || !(window as unknown as { PaystackPop?: unknown }).PaystackPop) {
      console.log('📦 Loading Paystack script on-demand...');
      await loadPaystackScript();
      console.log('✅ Paystack script loaded successfully');
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

  const PaystackPop = (window as unknown as {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata: Record<string, string | number | boolean | undefined>;
        channels: string[];
        onClose: () => void;
        callback: (response: PaystackResponse) => void;
      }) => { openIframe: () => void };
    };
  }).PaystackPop;

  const handler = PaystackPop.setup({
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
  } catch (error) {
    console.error('Error initializing Paystack payment:', error);
    alert('Failed to initialize payment. Please try again.');
    onClose();
  }
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
 * Verify payment via Cloud Function
 */
export async function verifyPayment(orderId: string, reference: string): Promise<boolean> {
  try {
    const verifyPaystackPayment = httpsCallable(functions, 'verifyPaystackPayment');
    const result = await verifyPaystackPayment({ orderId, reference });
    return Boolean((result.data as { success?: boolean })?.success);
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
    if (typeof window !== 'undefined' && (window as unknown as { PaystackPop?: unknown }).PaystackPop) {
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
