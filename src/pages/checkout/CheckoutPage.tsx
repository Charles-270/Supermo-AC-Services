/**
 * Checkout Page - Redesigned
 * Multi-step checkout flow with modern UI
 * Integrates Firestore order creation + Paystack payments
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { AddressForm } from '@/components/checkout/AddressForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { OrderReview } from '@/components/checkout/OrderReview';
import { OrderSuccess } from '@/components/checkout/OrderSuccess';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import {
  createOrder,
  getOrder,
} from '@/services/productService';
import type { OrderItem, PaymentMethod, ShippingAddress } from '@/types/product';
import { INSTALLATION_FEES, SHIPPING_FEES } from '@/types/product';
import {
  currencyRound,
  resolveProductPricing,
} from '@/utils/pricing';
import {
  initializePaystackPayment,
  generatePaymentReference,
  convertToPesewas,
  getPaystackChannels,
  verifyPayment,
} from '@/lib/paystack';

type CheckoutStep = 1 | 2 | 3 | 4 | 5;

interface AddressData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  landmark?: string;
}

const DEFAULT_SHIPPING_FEE = 50;

const mapPaymentMethod = (method: string): PaymentMethod | null => {
  switch (method) {
    case 'card':
      return 'card';
    case 'mobile-money':
      return 'mtn-mobile-money';
    case 'bank-transfer':
      return 'bank-transfer';
    default:
      return null;
  }
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cart, clearCart, getCartTotal } = useCart();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [step, setStep] = useState<CheckoutStep>(2); // Start at delivery (cart is step 1, but we came from cart page)
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]); // Cart is already completed

  const [addressData, setAddressData] = useState<AddressData>({
    fullName: profile?.displayName || '',
    phone: profile?.phoneNumber || '',
    email: user?.email || '',
    address: '',
    city: 'Accra',
    region: 'Greater Accra',
    landmark: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Derived totals
  const itemsTotal = getCartTotal();

  const installationFee = useMemo(() => {
    return cart.reduce((total, item) => {
      if (item.installationRequired) {
        const fee = INSTALLATION_FEES[item.product.category] || 0;
        return total + fee;
      }
      return total;
    }, 0);
  }, [cart]);

  const shippingFee = useMemo(
    () => SHIPPING_FEES[addressData.region] ?? DEFAULT_SHIPPING_FEE,
    [addressData.region]
  );

  const grandTotal = useMemo(
    () => currencyRound(itemsTotal + installationFee + shippingFee),
    [itemsTotal, installationFee, shippingFee]
  );

  const handleAddressNext = () => {
    setCompletedSteps([1, 2]);
    setStep(3);
  };

  const handlePaymentNext = () => {
    setCompletedSteps([1, 2, 3]);
    setStep(4);
  };

  const handleBack = () => {
    if (step > 2) {
      setStep((prev) => (prev - 1) as CheckoutStep);
    } else {
      navigate('/cart');
    }
  };

  const launchPaystack = (
    orderId: string,
    totalAmount: number,
    method: PaymentMethod,
    orderNumberValue: string,
  ) =>
    new Promise<void>((resolve, reject) => {
      initializePaystackPayment(
        {
          email: user?.email || addressData.email,
          amount: convertToPesewas(totalAmount),
          reference: generatePaymentReference(),
          metadata: {
            customerId: user?.uid,
            orderId,
            customerName: profile?.displayName || addressData.fullName,
            orderNumber: orderNumberValue,
          },
          channels: getPaystackChannels(method),
        },
        async (response) => {
          try {
            const verified = await verifyPayment(orderId, response.reference);
            if (!verified) {
              toast({
                title: 'Payment pending verification',
                description:
                  'We could not confirm the payment yet. We will update your order once verification completes.',
              });
            }

            setCompletedSteps([1, 2, 3, 4]);
            setStep(5);
            clearCart();
            resolve();
          } catch (error) {
            console.error('Error verifying payment:', error);
            toast({
              title: 'Verification error',
              description:
                'Payment succeeded but verification failed. Your order will update once confirmed.',
              variant: 'destructive',
            });
            reject(error);
          }
        },
        () => {
          toast({
            title: 'Payment cancelled',
            description: 'The Paystack window was closed before completing payment.',
            variant: 'destructive',
          });
          reject(new Error('Payment cancelled'));
        }
      ).catch((error) => {
        console.error('Error initializing Paystack:', error);
        toast({
          title: 'Payment initialization failed',
          description: 'Unable to start payment. Please try again.',
          variant: 'destructive',
        });
        reject(error);
      });
    });

  const handlePlaceOrder = async (): Promise<void> => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to complete your purchase.',
        variant: 'destructive',
      });
      navigate('/login');
      throw new Error('User not authenticated');
    }

    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add items to your cart before checking out.',
        variant: 'destructive',
      });
      navigate('/products');
      return;
    }

    const mappedPaymentMethod = mapPaymentMethod(paymentMethod);
    if (!mappedPaymentMethod) {
      toast({
        title: 'Select payment method',
        description: 'Choose a supported payment option to continue.',
        variant: 'destructive',
      });
      throw new Error('Payment method not selected');
    }

    try {
      const shippingAddress: ShippingAddress = {
        fullName: addressData.fullName,
        phone: addressData.phone,
        address: addressData.address,
        city: addressData.city,
        region: addressData.region,
      };
      if (addressData.landmark?.trim()) {
        shippingAddress.landmark = addressData.landmark.trim();
      }

      const orderItems: OrderItem[] = cart.map((item) => {
        const pricing = resolveProductPricing(item.product);
        return {
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images?.[0] || '',
          price: pricing.totalPrice,
          quantity: item.quantity,
          subtotal: currencyRound(pricing.totalPrice * item.quantity),
          installationRequired: item.installationRequired,
        };
      });

      const orderId = await createOrder(
        user.uid,
        profile?.displayName || addressData.fullName,
        user.email || addressData.email,
        addressData.phone,
        orderItems,
        shippingAddress,
        mappedPaymentMethod,
        shippingFee,
        installationFee
      );

      setLastOrderId(orderId);

      let orderNumberValue = '';
      try {
        const orderDoc = await getOrder(orderId);
        orderNumberValue = orderDoc?.orderNumber ?? '';
      } catch (err) {
        console.warn('Unable to fetch order number after creation:', err);
      }
      if (!orderNumberValue) {
        orderNumberValue = `ORD-${new Date().getFullYear()}-${orderId.slice(-6).toUpperCase()}`;
      }
      setOrderNumber(orderNumberValue);

      await launchPaystack(orderId, grandTotal, mappedPaymentMethod, orderNumberValue);
    } catch (error) {
      console.error('Error placing order:', error);
      if (error instanceof Error && error.message === 'Payment cancelled') {
        // Already handled by toast inside launchPaystack
        return;
      }

      toast({
        title: 'Order failed',
        description: 'We could not complete your order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Redirect if cart is empty and not on success page
  if (cart.length === 0 && step !== 5) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="relative min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <CustomerSidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileNavOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">
                    Checkout
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600">
                    Complete your purchase
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {step !== 5 && (
            <div className="mb-8">
              <CheckoutStepper
                currentStep={step === 2 ? 2 : step === 3 ? 3 : 4}
                completedSteps={completedSteps}
              />
            </div>
          )}

          <div>
            {/* Step 2: Delivery/Address */}
            {step === 2 && (
              <AddressForm
                addressData={addressData}
                onAddressChange={setAddressData}
                onBack={handleBack}
                onNext={handleAddressNext}
              />
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
                onBack={handleBack}
                onNext={handlePaymentNext}
              />
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <OrderReview
                cart={cart}
                addressData={addressData}
                paymentMethod={paymentMethod}
                itemsTotal={itemsTotal}
                installationFee={installationFee}
                shippingFee={shippingFee}
                total={grandTotal}
                onBack={handleBack}
                onPlaceOrder={handlePlaceOrder}
              />
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <OrderSuccess
                orderNumber={orderNumber}
                total={grandTotal}
                onViewOrder={() => navigate(lastOrderId ? `/orders/${lastOrderId}` : '/orders')}
                onContinueShopping={() => navigate('/products')}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <CustomerSidebar
            variant="mobile"
            className="relative z-40 h-full w-72 max-w-[80%]"
            onClose={() => setIsMobileNavOpen(false)}
            onNavigate={() => setIsMobileNavOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
