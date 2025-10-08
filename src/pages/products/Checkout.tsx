/**
 * Checkout Page
 * Complete order with shipping address and payment
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Smartphone, Building2, Loader2, Lock } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { createOrder } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import {
  GHANA_REGIONS,
  SHIPPING_FEES,
  INSTALLATION_FEES,
  type PaymentMethod,
  type ShippingAddress,
  type OrderItem,
} from '@/types/product';
import {
  initializePaystackPayment,
  generatePaymentReference,
  convertToPesewas,
  getPaystackChannels,
  loadPaystackScript,
  verifyPayment,
} from '@/lib/paystack';
import { toast } from '@/components/ui/use-toast';

export function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('Greater Accra');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  useEffect(() => {
    // Load Paystack script
    loadPaystackScript()
      .then(() => setPaystackLoaded(true))
      .catch((error) => console.error('Failed to load Paystack:', error));
  }, []);

  useEffect(() => {
    // Redirect if cart is empty
    if (cart.length === 0) {
      navigate('/products');
    }
  }, [cart, navigate]);

  const itemsTotal = getCartTotal();

  const installationFees = cart.reduce((total, item) => {
    if (item.installationRequired) {
      const fee = INSTALLATION_FEES[item.product.category] || 0;
      return total + fee;
    }
    return total;
  }, 0);

  const shippingFee = SHIPPING_FEES[region] || 50;
  const grandTotal = itemsTotal + installationFees + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to complete your purchase.',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // Validate form
    if (!fullName || !phone || !address || !city || !region) {
      toast({
        title: 'Missing information',
        description: 'Please complete all required shipping details.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare shipping address (exclude undefined fields for Firestore)
      const shippingAddress: any = {
        fullName,
        phone,
        address,
        city,
        region,
      };

      if (landmark && landmark.trim()) {
        shippingAddress.landmark = landmark;
      }

      if (deliveryInstructions && deliveryInstructions.trim()) {
        shippingAddress.deliveryInstructions = deliveryInstructions;
      }

      // Prepare order items (exclude undefined fields for Firestore)
      const orderItems: OrderItem[] = cart.map((item) => {
        const orderItem: any = {
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images?.[0] || '',
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        };

        if (item.installationRequired) {
          orderItem.installationRequired = item.installationRequired;
        }

        if (item.selectedWarranty) {
          orderItem.warranty = item.selectedWarranty;
        }

        return orderItem;
      });

      // Create order in Firestore
      const orderId = await createOrder(
        user.uid,
        profile.displayName,
        user.email || '',
        phone,
        orderItems,
        shippingAddress,
        paymentMethod,
        shippingFee,
        installationFees
      );

      // Generate payment reference
      const paymentReference = generatePaymentReference();

      // Initialize Paystack payment
      if (paystackLoaded) {
        initializePaystackPayment(
          {
            email: user.email || '',
            amount: convertToPesewas(grandTotal),
            reference: paymentReference,
            metadata: {
              customerId: user.uid,
              orderId,
              customerName: profile.displayName,
              orderNumber: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
            },
            channels: getPaystackChannels(paymentMethod),
          },
          async (response) => {
            // Payment successful
            console.log('Payment successful:', response);
            try {
              const verified = await verifyPayment(orderId, response.reference);
              if (!verified) {
                toast({
                  title: 'Payment pending verification',
                  description: 'We could not confirm the payment yet. We will update your order once verification completes.',
                });
              }
            } catch (verifyError) {
              console.error('Error verifying payment:', verifyError);
              toast({
                title: 'Verification error',
                description: 'Payment succeeded but verification failed. Your order will update once confirmed.',
                variant: 'destructive',
              });
            } finally {
              clearCart();
              setLoading(false);
              navigate(`/orders/${orderId}/success?reference=${response.reference}`);
            }
          },
          () => {
            // Payment closed
            setLoading(false);
          }
        );
      } else {
        console.error('Paystack not loaded');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Order failed',
        description: 'Failed to create order. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
              <p className="text-sm text-neutral-600">Complete your order</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping and Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0244123456"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House number and street name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City/Town *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">Region *</Label>
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger id="region">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GHANA_REGIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g., Near Circle VIP Station"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Any special instructions for delivery"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-primary-500" />
                        <span>Debit/Credit Card</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                      <RadioGroupItem value="mtn-mobile-money" id="mtn" />
                      <Label htmlFor="mtn" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-warning-500" />
                        <span>MTN Mobile Money</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                      <RadioGroupItem value="vodafone-cash" id="vodafone" />
                      <Label htmlFor="vodafone" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-error-500" />
                        <span>Vodafone Cash</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                      <RadioGroupItem value="airteltigo-money" id="airteltigo" />
                      <Label htmlFor="airteltigo" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-accent-500" />
                        <span>AirtelTigo Money</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                      <RadioGroupItem value="bank-transfer" id="bank" />
                      <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5 text-neutral-600" />
                        <span>Bank Transfer</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-start gap-2 text-sm text-primary-700">
                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>Your payment information is secure. We use Paystack for safe and encrypted transactions.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-3 text-sm">
                        <div className="w-16 h-16 bg-neutral-100 rounded flex-shrink-0">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2">{item.product.name}</p>
                          <p className="text-neutral-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-200 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Items Total</span>
                      <span className="font-medium">{formatCurrency(itemsTotal)}</span>
                    </div>

                    {installationFees > 0 && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Installation</span>
                        <span className="font-medium">{formatCurrency(installationFees)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-neutral-600">Shipping ({region})</span>
                      <span className="font-medium">{formatCurrency(shippingFee)}</span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <div className="p-6 pt-0">
                  <Button type="submit" size="lg" className="w-full" disabled={loading || !paystackLoaded}>
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Pay {formatCurrency(grandTotal)}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
