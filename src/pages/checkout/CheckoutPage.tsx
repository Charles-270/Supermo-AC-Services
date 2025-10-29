/**
 * Checkout Page - Redesigned
 * Multi-step checkout flow with modern UI
 * Matches Book Service flow design system
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { AddressForm } from '@/components/checkout/AddressForm';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { OrderReview } from '@/components/checkout/OrderReview';
import { OrderSuccess } from '@/components/checkout/OrderSuccess';
import { Menu } from 'lucide-react';

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

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [step, setStep] = useState<CheckoutStep>(2); // Start at delivery (cart is step 1, but we came from cart page)
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]); // Cart is already completed

  // Form state
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

  // Calculate totals
  const subtotal = getCartTotal();
  const tax = subtotal * 0.125;
  const delivery = 50;
  const total = subtotal + tax + delivery;

  const handleAddressNext = () => {
    setCompletedSteps([1, 2]);
    setStep(3);
  };

  const handlePaymentNext = () => {
    setCompletedSteps([1, 2, 3]);
    setStep(4);
  };

  const handlePlaceOrder = async () => {
    // TODO: Integrate with existing order creation logic
    // For now, simulate order placement
    const mockOrderNumber = `ORD-${Date.now()}`;
    setOrderNumber(mockOrderNumber);
    setCompletedSteps([1, 2, 3, 4]);
    setStep(5);
    clearCart();
  };

  const handleBack = () => {
    if (step > 2) {
      setStep((step - 1) as CheckoutStep);
    } else {
      navigate('/cart');
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

          {/* Step Content */}
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
                subtotal={subtotal}
                tax={tax}
                delivery={delivery}
                total={total}
                onBack={handleBack}
                onPlaceOrder={handlePlaceOrder}
              />
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <OrderSuccess
                orderNumber={orderNumber}
                total={total}
                onViewOrder={() => navigate('/orders')}
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
