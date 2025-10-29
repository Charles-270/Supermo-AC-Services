# Developer Guide

## Quick Start

### Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Accessing the Redesigned Pages

1. **Shop Products**: Navigate to `/products`
2. **Cart**: Navigate to `/cart` or click cart icon from shop
3. **Checkout**: Navigate to `/checkout` from cart
4. **My Orders**: Navigate to `/orders`

## Component Architecture

### Cart Flow

```
CartPage
├── CartLineItem (for each cart item)
│   ├── Product image
│   ├── Quantity stepper
│   └── Remove button
└── OrderSummaryCard
    ├── Totals breakdown
    └── Checkout button
```

### Checkout Flow

```
CheckoutPage
├── CheckoutStepper (progress indicator)
└── Step Components
    ├── AddressForm (Step 2)
    ├── PaymentMethodSelector (Step 3)
    ├── OrderReview (Step 4)
    └── OrderSuccess (Step 5)
```

### Orders Flow

```
OrderHistoryRedesigned
├── Filter Rail
├── Orders Table/Cards
└── OrderDetailsDialog (modal)
```

## Key Hooks

### useCart()

Manages cart state with localStorage persistence.

```typescript
const {
  cart,                    // CartItem[]
  addToCart,              // (product, quantity, installation) => void
  removeFromCart,         // (productId) => void
  updateQuantity,         // (productId, quantity) => void
  clearCart,              // () => void
  getCartTotal,           // () => number
  getCartItemsCount,      // () => number
  isInCart,               // (productId) => boolean
} = useCart();
```

### useAuth()

Provides user authentication state.

```typescript
const {
  user,                   // Firebase User | null
  profile,                // UserProfile | null
  loading,                // boolean
} = useAuth();
```

## Data Flow

### Adding to Cart

```
ProductCard
  → addToCart(product)
    → useCart updates state
      → localStorage persists
        → Cart icon badge updates
```

### Checkout Process

```
CartPage
  → CheckoutPage (Step 2: Address)
    → Validate address
      → Step 3: Payment
        → Select payment method
          → Step 4: Review
            → Place order
              → Step 5: Success
                → Clear cart
```

### Viewing Orders

```
OrderHistoryRedesigned
  → Fetch orders from backend
    → Display in table/cards
      → Click "View Details"
        → OrderDetailsDialog opens
          → Show full order info
```

## Styling Guidelines

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### Common Classes

```typescript
// Cards
"rounded-2xl border shadow-sm bg-white p-4 md:p-5"

// Buttons
"rounded-xl h-10 md:h-11"

// Inputs
"h-12 rounded-xl"

// Primary Button
"rounded-xl bg-teal-600 hover:bg-teal-700"

// Secondary Button
"rounded-xl border border-neutral-300 hover:bg-neutral-50"
```

### Color Palette

```typescript
// Primary
teal-600, cyan-500

// Neutral
neutral-50 to neutral-900

// Status
green-500 (success)
red-500 (error)
amber-500 (warning)
blue-500 (info)
```

## Form Validation

### Pattern

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (field: string, value: string): string | null => {
  // Return error message or null
};

const handleBlur = (field: string, value: string) => {
  const error = validateField(field, value);
  if (error) {
    setErrors(prev => ({ ...prev, [field]: error }));
  }
};

const handleSubmit = () => {
  const newErrors: Record<string, string> = {};
  // Validate all fields
  setErrors(newErrors);
  
  if (Object.keys(newErrors).length === 0) {
    // Proceed
  }
};
```

### Error Display

```tsx
<Input
  className={cn(
    'h-12 rounded-xl',
    errors.field && 'border-red-500'
  )}
  aria-describedby={errors.field ? 'field-error' : undefined}
/>
{errors.field && (
  <p className="text-sm text-red-600" id="field-error">
    {errors.field}
  </p>
)}
```

## Accessibility

### Focus Management

```typescript
// Auto-focus first input
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);
```

### Keyboard Navigation

```typescript
// Dialog focus trap
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent>
    {/* Content automatically traps focus */}
  </DialogContent>
</Dialog>
```

### Screen Reader Announcements

```tsx
<div className="sr-only" aria-live="polite" aria-atomic="true">
  {message}
</div>
```

## State Management

### Local State

Use `useState` for component-specific UI state:
- Form inputs
- Dialog open/close
- Loading states
- Error messages

### Context State

Use existing contexts:
- `useCart()` for cart state
- `useAuth()` for user state

### URL State

Use `useSearchParams()` for filters and pagination:

```typescript
const [searchParams, setSearchParams] = useSearchParams();

// Read
const category = searchParams.get('category');

// Write
searchParams.set('category', 'split-ac');
setSearchParams(searchParams);
```

## Backend Integration

### Order Creation (TODO)

The CheckoutPage currently uses mock order creation. To integrate:

```typescript
// In CheckoutPage.tsx
import { createOrder } from '@/services/orderService';

const handlePlaceOrder = async () => {
  try {
    const orderData = {
      customerId: user.uid,
      customerName: addressData.fullName,
      customerEmail: addressData.email,
      customerPhone: addressData.phone,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0],
        price: resolveProductPricing(item.product).totalPrice,
        quantity: item.quantity,
        installationRequired: item.installationRequired,
        subtotal: resolveProductPricing(item.product).totalPrice * item.quantity,
      })),
      shippingAddress: {
        fullName: addressData.fullName,
        phone: addressData.phone,
        address: addressData.address,
        city: addressData.city,
        region: addressData.region,
        landmark: addressData.landmark,
      },
      paymentMethod: paymentMethod,
      subtotal,
      tax,
      deliveryFee: delivery,
      totalAmount: total,
    };

    const order = await createOrder(orderData);
    setOrderNumber(order.orderNumber);
    setStep(5);
    clearCart();
  } catch (error) {
    console.error('Order creation failed:', error);
    // Handle error
  }
};
```

### Payment Integration (TODO)

Payment methods need backend integration:

```typescript
// For Mobile Money
if (paymentMethod === 'mobile-money') {
  // Initiate mobile money payment
  const response = await initiateMobileMoneyPayment({
    amount: total,
    phoneNumber: mobileMoneyNumber,
    orderId: order.id,
  });
  // Handle payment prompt
}

// For Card
if (paymentMethod === 'card') {
  // Initiate card payment (e.g., Paystack)
  const response = await initiateCardPayment({
    amount: total,
    email: addressData.email,
    orderId: order.id,
  });
  // Redirect to payment gateway
}
```

## Testing

### Manual Testing Checklist

#### Cart
- [ ] Add product to cart
- [ ] Update quantity
- [ ] Remove item
- [ ] Verify totals
- [ ] Empty cart state

#### Checkout
- [ ] Fill address form
- [ ] Validate required fields
- [ ] Select payment method
- [ ] Review order
- [ ] Place order (mock)

#### Orders
- [ ] View orders list
- [ ] Filter orders
- [ ] Search orders
- [ ] Open order details
- [ ] Close dialog

#### Responsive
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1280px)
- [ ] Verify sticky elements
- [ ] Test mobile nav

### Debugging

#### Cart Issues

```typescript
// Check cart state
console.log('Cart:', cart);
console.log('Cart total:', getCartTotal());
console.log('Cart count:', getCartItemsCount());

// Check localStorage
console.log('Stored cart:', localStorage.getItem('supremo-cart'));
```

#### Routing Issues

```typescript
// Check current route
console.log('Current path:', window.location.pathname);

// Check navigation
navigate('/cart', { replace: true });
```

#### Form Validation

```typescript
// Log validation errors
console.log('Errors:', errors);
console.log('Form valid:', isFormValid);
```

## Common Issues

### Issue: Cart not persisting

**Solution**: Check localStorage is enabled and not full.

```typescript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage not available:', e);
}
```

### Issue: Images not loading

**Solution**: Check image URLs and CORS settings.

```typescript
<img
  src={product.images[0]}
  onError={() => setImageError(true)}
  alt={product.name}
/>
```

### Issue: Stepper not updating

**Solution**: Ensure completedSteps array is updated.

```typescript
setCompletedSteps([...completedSteps, currentStep]);
setStep(currentStep + 1);
```

## Performance Optimization

### Image Optimization

```tsx
<img
  loading="lazy"
  src={product.images[0]}
  alt={product.name}
/>
```

### Code Splitting

Already implemented via lazy loading in App.tsx:

```typescript
const CartPage = lazy(() => import('@/pages/cart/CartPage'));
```

### Memoization

```typescript
const filteredProducts = useMemo(
  () => products.filter(/* ... */),
  [products, filters]
);
```

## Deployment

### Build

```bash
npm run build
```

### Environment Variables

Ensure these are set:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# etc.
```

### Verification

After deployment, verify:
1. All routes load correctly
2. Cart persists across sessions
3. Images load properly
4. Forms validate correctly
5. Responsive layouts work

## Support

For issues or questions:
1. Check this guide
2. Review implementation-summary.md
3. Check component source code
4. Review design.md for specifications
