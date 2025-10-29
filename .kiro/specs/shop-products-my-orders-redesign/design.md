# Design Document

## Overview

This design document outlines the UI-only redesign of the Shop Products, Cart/Checkout, My Orders, and Admin Catalog sections. The redesign modernizes the visual presentation while maintaining all existing backend logic, data structures, and event handlers. The design ensures visual consistency with the recently redesigned Book Service flow and provides a responsive, accessible experience across mobile, tablet, and desktop devices.

### Design Principles

1. **UI-Only Changes**: No modifications to backend endpoints, data structures, or business logic
2. **Visual Consistency**: Match the design language of the Book Service flow redesign
3. **Responsive First**: Mobile (≤640px), Tablet (641–1024px), Desktop (≥1025px)
4. **Accessibility**: WCAG 2.1 AA compliance with semantic HTML and ARIA attributes
5. **Performance**: Minimal new dependencies, leverage existing component library

## Architecture

### Component Hierarchy

```
Dashboard Shell (CustomerSidebar + Main Content)
├── Shop Products Page
│   ├── Header (Search, Cart Icon, Mobile Nav Toggle)
│   ├── Filter Rail (Desktop Sticky / Mobile Sheet)
│   │   ├── Active Filter Chips
│   │   ├── Category Filter
│   │   ├── Brand Filter
│   │   ├── Price Range Slider
│   │   └── In Stock Toggle
│   └── Results Grid
│       ├── Toolbar (Sort, View Mode, Filter Toggle)
│       ├── Active Filter Chips Row
│       └── Product Cards Grid/List
│
├── Cart & Checkout Flow
│   ├── Cart Step
│   │   ├── Cart Line Items
│   │   └── Order Summary Card (Desktop) / Sticky Bottom (Mobile)
│   ├── Delivery/Address Step
│   │   └── Address Form Card
│   ├── Payment Step
│   │   └── Payment Method Tiles
│   ├── Review Step
│   │   ├── Progress Stepper
│   │   └── Order Summary Card
│   └── Success Step
│       └── Success Card with Order Details
│
├── My Orders Page
│   ├── Orders Table (Desktop) / Cards (Mobile)
│   └── Order Details Dialog
│       ├── Dialog Header
│       ├── Order Summary Grid
│       ├── Items List
│       ├── Totals Breakdown
│       └── Action Buttons
│
└── Admin Catalog
    ├── Product Cards (matching Shop style)
    └── Admin Controls (Edit, Hide, Inventory)
```

### Layout Strategy

#### Desktop (≥1025px)
- Persistent left sidebar (CustomerSidebar) at 256px width
- Main content area with left margin of 256px
- Two-pane layout for Shop Products: sticky filter rail (256px) + results grid
- Order summary card positioned on right side during checkout
- Table layout for My Orders with action buttons

#### Tablet (641–1024px)
- Collapsible sidebar with hamburger menu
- Single-column layout with filter toggle button
- Order summary card below cart items
- Responsive grid for product cards (2 columns)
- Card layout for My Orders

#### Mobile (≤640px)
- Hamburger menu for navigation
- Full-height filter sheet (slide-up)
- Single-column product cards
- Sticky bottom order summary bar
- Stacked card layout for orders
- Full-screen dialogs

## Components and Interfaces

### 1. Shop Products Page Components

#### ShopProductsPage (Main Container)
```typescript
interface ShopProductsPageProps {
  // No props - uses existing routing and hooks
}

// State Management (existing)
- products: Product[]
- loading: boolean
- filters: ProductFilters
- viewMode: 'grid' | 'list'
- showFilters: boolean
- isMobileNavOpen: boolean

// Hooks (existing)
- useSearchParams() for URL state
- useCart() for cart operations
- getProducts() service call
```

#### FilterRail Component
```typescript
interface FilterRailProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
  categories: CategoryOption[];
  brands: string[];
  products: Product[]; // for counts
}

// Visual Design
- Sticky positioning on desktop (top: 96px)
- Full-height sheet on mobile with slide-up animation
- Rounded-2xl card with p-6 padding
- Section spacing: mb-6 between filter groups
- Clear visual hierarchy with Label components
```

#### ActiveFilterChips Component
```typescript
interface ActiveFilterChipsProps {
  filters: ProductFilters;
  onRemoveFilter: (filterKey: string) => void;
  categories: CategoryOption[];
}

// Visual Design
- Horizontal scroll on mobile
- Badge components with X button
- gap-2 spacing between chips
- Soft background colors (bg-cyan-50 text-cyan-700)
```

#### ProductCard Component (Enhanced)
```typescript
interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

// Visual Design - Grid Mode
- rounded-2xl border shadow-sm bg-white
- aspect-square image container with rounded-t-2xl
- Badges positioned absolute top-3 left-3
- Content padding: p-4 md:p-5
- Two-line clamp for title and description
- Rating with Star icon and count
- Price: text-2xl font-bold text-cyan-600
- Add to Cart button: rounded-xl h-10 md:h-11
- Hover state: shadow-lg transform scale-[1.02]

// Visual Design - List Mode
- Horizontal layout with flex gap-4
- Image: w-48 h-48 flex-shrink-0
- Content: flex-1 with justify-between
- Same typography and color scheme
```

#### ProductGrid Component
```typescript
interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  loading: boolean;
}

// Layout
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- List: space-y-4
- Skeleton cards during loading
- Empty state with friendly message and "Clear Filters" CTA
```

### 2. Cart & Checkout Flow Components

#### CartPage Component
```typescript
interface CartPageProps {
  // Uses existing cart hook
}

// State
- cart: CartItem[] (from useCart)
- loading: boolean
- error: string | null

// Layout
- Desktop: Two-column (cart items + summary card)
- Mobile: Stacked with sticky bottom summary
```

#### CartLineItem Component
```typescript
interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

// Visual Design
- Compact card: rounded-xl border p-4
- Horizontal layout: image (80x80) + info + controls
- Quantity stepper: rounded-lg border with +/- buttons
- Remove icon button: text-red-600 hover:bg-red-50
- Line total: font-semibold text-lg
```

#### OrderSummaryCard Component
```typescript
interface OrderSummaryCardProps {
  subtotal: number;
  tax: number;
  delivery: number;
  total: number;
  onCheckout: () => void;
  loading?: boolean;
}

// Visual Design
- rounded-2xl border shadow-sm bg-white p-6
- Sticky positioning on desktop (top: 96px)
- Fixed bottom on mobile with shadow-lg
- Breakdown rows: flex justify-between text-sm
- Total row: border-t pt-4 text-xl font-bold
- Checkout button: w-full rounded-xl h-12 bg-teal-600
```

#### CheckoutStepper Component
```typescript
interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: number[];
}

// Visual Design (reuse BookingStepper pattern)
- Desktop: Horizontal with connecting lines
- Mobile: Compact with progress dots
- Active step: bg-teal-600 text-white
- Completed: Check icon, teal-600 border
- Inactive: border-neutral-300 text-neutral-400
```

#### AddressForm Component
```typescript
interface AddressFormProps {
  address: AddressData;
  onAddressChange: (address: AddressData) => void;
  savedAddresses?: Address[];
  onSelectSavedAddress?: (address: Address) => void;
}

// Visual Design
- Card container: rounded-2xl border p-6 md:p-8
- Form fields: h-12 rounded-xl
- Saved addresses: radio tiles with rounded-lg border
- Validation: red-500 border and text for errors
```

#### PaymentMethodTile Component
```typescript
interface PaymentMethodTileProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
  children?: ReactNode; // for additional fields
}

// Visual Design
- Radio tile: rounded-xl border-2 p-4 cursor-pointer
- Selected: border-teal-600 bg-teal-50
- Unselected: border-neutral-300 hover:border-neutral-400
- Icon + label layout with flex items-center gap-3
- Accordion for additional fields with smooth transition
```

#### OrderSuccessCard Component
```typescript
interface OrderSuccessCardProps {
  orderNumber: string;
  orderDate: string;
  items: CartItem[];
  total: number;
  onViewOrder: () => void;
  onContinueShopping: () => void;
}

// Visual Design
- Centered layout with max-w-2xl
- CheckCircle icon: h-20 w-20 text-green-500
- Order number: text-3xl font-bold
- Summary card: rounded-2xl border p-6
- Action buttons: flex gap-4, rounded-xl
```

### 3. My Orders Page Components

#### MyOrdersPage Component
```typescript
interface MyOrdersPageProps {
  // Uses existing orders hook/service
}

// State
- orders: Order[]
- loading: boolean
- selectedOrder: Order | null
- dialogOpen: boolean
```

#### OrdersTable Component (Desktop)
```typescript
interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
}

// Visual Design
- Table with rounded-xl border
- Header: bg-neutral-50 font-semibold
- Rows: hover:bg-neutral-50 transition
- Status pill: Badge component with color coding
  - Pending: bg-yellow-100 text-yellow-800
  - Processing: bg-blue-100 text-blue-800
  - Completed: bg-green-100 text-green-800
  - Cancelled: bg-red-100 text-red-800
```

#### OrderCard Component (Mobile)
```typescript
interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
}

// Visual Design
- Card: rounded-xl border p-4 shadow-sm
- Vertical stack with gap-3
- Order # and date at top
- Items preview with thumbnails
- Status pill and total at bottom
- View Details button: w-full rounded-lg
```

#### OrderDetailsDialog Component
```typescript
interface OrderDetailsDialogProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onDownloadReceipt?: () => void;
  onReorder?: () => void;
}

// Visual Design
- Dialog overlay: bg-black/50
- Dialog content: max-w-3xl rounded-2xl
- Header: flex justify-between items-center p-6 border-b
  - Order # + Status pill
  - Close button (X icon)
- Content: p-6 space-y-6
  - Summary grid: 2x2 on desktop, stack on mobile
  - Items list: space-y-3 with thumbnails
  - Totals: border-t pt-4
- Footer: flex gap-3 p-6 border-t
  - Download Receipt: outline button
  - Reorder: primary button
```

### 4. Admin Catalog Components

#### AdminProductCard Component
```typescript
interface AdminProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onToggleVisibility: (productId: string) => void;
  onUpdateInventory: (productId: string) => void;
}

// Visual Design
- Same base style as public ProductCard
- Admin controls in footer or kebab menu
- Edit button: text-blue-600 hover:bg-blue-50
- Hide/Show toggle: text-neutral-600
- Inventory badge: absolute top-3 right-3
  - Low stock: bg-orange-100 text-orange-800
  - Out of stock: bg-red-100 text-red-800
```

#### AdminFilterBar Component
```typescript
interface AdminFilterBarProps {
  filters: AdminProductFilters;
  onFilterChange: (filters: AdminProductFilters) => void;
}

// Visual Design
- Same visual style as public FilterRail
- Additional admin-specific filters:
  - Visibility status (active/hidden)
  - Stock status (in-stock/low/out)
  - Featured toggle
```

## Data Models

### Existing Data Structures (No Changes)

```typescript
// Product (existing)
interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  images: string[];
  specifications: ProductSpecifications;
  pricing: ProductPricing;
  stockStatus: 'active' | 'low-stock' | 'out-of-stock';
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  condition?: 'new' | 'refurbished';
}

// CartItem (existing)
interface CartItem {
  product: Product;
  quantity: number;
  installationRequired: boolean;
}

// ProductFilters (existing)
interface ProductFilters {
  category?: ProductCategory;
  searchQuery?: string;
  brand?: string;
  sortBy?: 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  inStock?: boolean;
  priceRange?: { min: number; max: number };
}

// Order (existing - assumed structure)
interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  delivery: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  deliveryAddress: Address;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentDetails?: FulfillmentDetails;
}

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

interface FulfillmentDetails {
  technicianName?: string;
  technicianPhone?: string;
  assignedTime?: Date;
  notes?: string;
}
```

## Error Handling

### Loading States

1. **Product Loading**
   - Skeleton cards in grid layout
   - Shimmer animation effect
   - Maintains layout structure

2. **Cart Loading**
   - Spinner overlay on cart items
   - Disabled checkout button
   - Loading text on button

3. **Order Loading**
   - Skeleton rows in table
   - Skeleton cards on mobile
   - Centered spinner for dialog

### Empty States

1. **No Products Found**
   ```tsx
   <div className="rounded-2xl border p-12 text-center">
     <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
     <h3 className="text-xl font-semibold mb-2">No products found</h3>
     <p className="text-neutral-600 mb-4">
       Try adjusting your filters or search query
     </p>
     <Button onClick={clearFilters}>Clear Filters</Button>
   </div>
   ```

2. **Empty Cart**
   ```tsx
   <div className="rounded-2xl border p-12 text-center">
     <ShoppingCart className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
     <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
     <p className="text-neutral-600 mb-4">
       Add some products to get started
     </p>
     <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
   </div>
   ```

3. **No Orders**
   ```tsx
   <div className="rounded-2xl border p-12 text-center">
     <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
     <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
     <p className="text-neutral-600 mb-4">
       Your order history will appear here
     </p>
     <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
   </div>
   ```

### Error States

1. **Product Fetch Error**
   ```tsx
   <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
     <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
     <h3 className="text-lg font-semibold text-red-900 mb-2">
       Failed to load products
     </h3>
     <p className="text-red-700 mb-4">{error.message}</p>
     <Button variant="outline" onClick={retry}>Try Again</Button>
   </div>
   ```

2. **Checkout Error**
   ```tsx
   <div className="rounded-lg bg-red-50 border border-red-200 p-4">
     <div className="flex gap-3">
       <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
       <div>
         <h4 className="font-medium text-red-900">Payment failed</h4>
         <p className="text-sm text-red-700 mt-1">{error.message}</p>
       </div>
     </div>
   </div>
   ```

3. **Form Validation Errors**
   - Red border on invalid fields (border-red-500)
   - Error text below field (text-sm text-red-600)
   - aria-describedby linking field to error message

## Testing Strategy

### Component Testing

1. **Visual Regression Testing**
   - Snapshot tests for all card components
   - Responsive breakpoint screenshots
   - Light/dark mode variations (if applicable)

2. **Interaction Testing**
   - Filter application and removal
   - Add to cart functionality
   - Quantity stepper operations
   - Dialog open/close
   - Form validation

3. **Accessibility Testing**
   - Keyboard navigation through filters
   - Screen reader announcements
   - Focus management in dialogs
   - ARIA attribute validation

### Integration Testing

1. **Shop Products Flow**
   - Search → Filter → View Product → Add to Cart
   - URL state synchronization
   - Cart count updates

2. **Checkout Flow**
   - Cart → Address → Payment → Review → Success
   - Step navigation (back/next)
   - Form validation at each step
   - Order creation

3. **Orders Flow**
   - View orders list
   - Open order details dialog
   - Download receipt (if available)
   - Reorder functionality

### Responsive Testing

1. **Breakpoint Testing**
   - Mobile (375px, 414px)
   - Tablet (768px, 1024px)
   - Desktop (1280px, 1920px)

2. **Touch Target Testing**
   - Minimum 44x44px for mobile buttons
   - Adequate spacing between interactive elements
   - Swipe gestures for mobile sheets

3. **Performance Testing**
   - Image lazy loading
   - Skeleton loading states
   - Smooth animations (60fps)

## Visual Design System

### Typography

```css
/* Headings */
.heading-xl { @apply text-2xl md:text-3xl font-bold; }
.heading-lg { @apply text-xl md:text-2xl font-semibold; }
.heading-md { @apply text-lg md:text-xl font-semibold; }
.heading-sm { @apply text-base md:text-lg font-medium; }

/* Body */
.body-lg { @apply text-base md:text-lg; }
.body-md { @apply text-sm md:text-base; }
.body-sm { @apply text-xs md:text-sm; }

/* Labels */
.label { @apply text-sm font-medium; }
.label-sm { @apply text-xs font-medium; }
```

### Colors

```css
/* Primary (Teal/Cyan) */
--primary-50: #f0fdfa;
--primary-100: #ccfbf1;
--primary-500: #14b8a6;
--primary-600: #0d9488;
--primary-700: #0f766e;

/* Neutral */
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-900: #171717;

/* Status Colors */
--success-500: #22c55e;
--warning-500: #f59e0b;
--error-500: #ef4444;
--info-500: #3b82f6;
```

### Spacing

```css
/* Component Spacing */
--space-card-padding: 1rem; /* 16px */
--space-card-padding-md: 1.25rem; /* 20px */
--space-section: 1.5rem; /* 24px */
--space-section-md: 2rem; /* 32px */

/* Grid Gaps */
--gap-grid: 1.5rem; /* 24px */
--gap-list: 1rem; /* 16px */
--gap-inline: 0.5rem; /* 8px */
```

### Shadows

```css
/* Card Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

/* Hover States */
.card-hover {
  @apply transition-all duration-200 hover:shadow-lg hover:scale-[1.02];
}
```

### Border Radius

```css
--radius-sm: 0.5rem; /* 8px */
--radius-md: 0.75rem; /* 12px */
--radius-lg: 1rem; /* 16px */
--radius-xl: 1.5rem; /* 24px */
--radius-2xl: 2rem; /* 32px */
--radius-full: 9999px;
```

### Animations

```css
/* Transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Keyframes */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

## Accessibility Guidelines

### Semantic HTML

- Use `<main>`, `<nav>`, `<aside>`, `<article>`, `<section>` appropriately
- Proper heading hierarchy (h1 → h2 → h3)
- `<button>` for actions, `<a>` for navigation
- `<form>` with proper `<label>` associations

### ARIA Attributes

```tsx
// Filter Rail
<aside role="complementary" aria-label="Product filters">
  <button aria-expanded={showFilters} aria-controls="filter-panel">
    Filters
  </button>
</aside>

// Product Grid
<div role="region" aria-label="Product results" aria-live="polite">
  {products.map(product => <ProductCard key={product.id} />)}
</div>

// Dialog
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Order Details</h2>
</div>

// Status Pills
<span role="status" aria-label={`Order status: ${status}`}>
  {status}
</span>
```

### Keyboard Navigation

1. **Tab Order**
   - Logical flow through interactive elements
   - Skip links for main content
   - Focus trap in modals/dialogs

2. **Keyboard Shortcuts**
   - Escape to close dialogs/sheets
   - Enter to submit forms
   - Space to toggle checkboxes
   - Arrow keys for radio groups

3. **Focus Management**
   - Visible focus indicators (ring-2 ring-teal-500)
   - Focus restoration after dialog close
   - Auto-focus on first input in forms

### Screen Reader Support

- Descriptive button labels
- Status announcements with aria-live
- Error messages linked with aria-describedby
- Loading states announced
- Dynamic content updates announced

## Performance Considerations

### Image Optimization

```tsx
// Lazy loading
<img loading="lazy" src={product.image} alt={product.name} />

// Aspect ratio containers
<div className="aspect-square">
  <img className="w-full h-full object-cover" />
</div>

// Placeholder while loading
{imageLoading && <Skeleton className="aspect-square" />}
```

### Code Splitting

```tsx
// Lazy load dialog components
const OrderDetailsDialog = lazy(() => import('./OrderDetailsDialog'));

// Lazy load heavy components
const ProductCatalog = lazy(() => import('./ProductCatalog'));
```

### Memoization

```tsx
// Memoize expensive calculations
const filteredProducts = useMemo(
  () => applyFilters(products, filters),
  [products, filters]
);

// Memoize callbacks
const handleAddToCart = useCallback(
  (product: Product) => addToCart(product),
  [addToCart]
);
```

### Virtualization

- Consider virtual scrolling for large product lists (>100 items)
- Use `react-window` or `react-virtual` if needed
- Implement pagination as alternative

## Implementation Notes

### Reusable Patterns from Book Service Flow

1. **Stepper Component**: Reuse BookingStepper pattern for checkout flow
2. **Form Validation**: Reuse validation patterns from CustomerDetailsForm
3. **Mobile Navigation**: Reuse sidebar overlay pattern
4. **Card Styling**: Match rounded-2xl, shadow-sm, padding patterns
5. **Button Styles**: Consistent rounded-xl, height, and color scheme
6. **Responsive Utilities**: Same breakpoint strategy and mobile-first approach

### Component Library Usage

- **shadcn/ui components**: Button, Input, Label, Select, Checkbox, Badge, Card, Dialog
- **lucide-react icons**: ShoppingCart, Search, Filter, X, Check, Star, Package, etc.
- **Tailwind utilities**: Prefer utility classes over custom CSS
- **cn() utility**: For conditional class merging

### State Management

- **URL State**: Search params for filters, sort, pagination
- **Local State**: Component-specific UI state (dialogs, sheets)
- **Context**: Cart state (existing useCart hook)
- **No new global state**: Leverage existing hooks and services

### Routing

- Maintain existing routes:
  - `/shop` or `/products` - Shop Products Page
  - `/cart` - Cart Page
  - `/checkout` - Checkout Flow
  - `/orders` or `/my-orders` - My Orders Page
  - `/admin/catalog` - Admin Catalog

### Data Fetching

- Use existing service functions:
  - `getProducts(filters, limit)` - Fetch products
  - `getOrders(userId)` - Fetch user orders
  - `createOrder(orderData)` - Create new order
- No changes to API calls or payloads
- Maintain existing error handling patterns
