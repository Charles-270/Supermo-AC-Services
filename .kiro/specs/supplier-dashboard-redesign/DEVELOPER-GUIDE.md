# Supplier Dashboard - Developer Guide

**Version:** 2.0.0  
**Last Updated:** October 27, 2025

---

## Quick Start

### Running Locally

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Navigate to supplier dashboard
# Login as a supplier user, then go to /dashboard/supplier
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test SupplierDashboard

# Run with coverage
npm test -- --coverage
```

---

## Architecture Overview

### File Structure

```
src/pages/dashboards/
├── SupplierOverview.tsx      # Main dashboard with stats and orders
├── SupplierProducts.tsx      # Product catalog management
├── SupplierSettings.tsx      # Business and notification settings
├── SupplierDashboard.tsx     # [DEPRECATED] Old monolithic version
└── __tests__/
    └── SupplierDashboard.queue.test.tsx

src/components/layout/
├── SupplierLayout.tsx        # Main layout wrapper
└── SupplierSidebar.tsx       # Navigation sidebar

src/services/
├── supplierService.ts        # Supplier-specific API calls
├── productService.ts         # Product/order API calls
└── storageService.ts         # Image upload/delete

src/types/
└── product.ts                # TypeScript interfaces
```

### Component Hierarchy

```
App.tsx
└── ProtectedRoute (requiredRole="supplier")
    └── SupplierLayout
        ├── SupplierSidebar
        └── Page Content
            ├── SupplierOverview
            ├── SupplierProducts
            └── SupplierSettings
```

---

## Key Components

### 1. SupplierOverview

**Purpose:** Main dashboard showing stats, alerts, and recent orders

**State:**
```typescript
const [loading, setLoading] = useState(true);
const [orders, setOrders] = useState<Order[]>([]);
const [catalog, setCatalog] = useState<SupplierCatalogItem[]>([]);
const [stats, setStats] = useState<SupplierStats>({...});
const [policyBannerDismissed, setPolicyBannerDismissed] = useState(false);
const [lowStockBannerDismissed, setLowStockBannerDismissed] = useState(false);
```

**Key Functions:**
- `loadDashboardData()`: Fetches stats, orders, and catalog
- `handleUpdateOrderStatus()`: Updates order status (shipped/delivered)
- `getOrderStatusBadge()`: Returns styled badge component

**API Calls:**
- `getSupplierWithStats(supplierId)`
- `getSupplierOrders(supplierId, limit)`
- `getSupplierCatalog(supplierId)`
- `updateOrderStatus(orderId, status)`
- `updateTrackingNumber(orderId, tracking)`
- `updateSupplierAssignmentStatus(orderId, supplierId, status)`

### 2. SupplierProducts

**Purpose:** Product catalog management with filtering and CRUD operations

**State:**
```typescript
const [catalog, setCatalog] = useState<SupplierCatalogItem[]>([]);
const [storeProducts, setStoreProducts] = useState<Product[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [categoryFilter, setCategoryFilter] = useState<string>('all');
const [statusFilter, setStatusFilter] = useState<string>('all');
const [currentPage, setCurrentPage] = useState(1);
```

**Key Functions:**
- `loadCatalog()`: Fetches catalog and store products
- `handleEdit()`: Opens edit dialog
- `handleDelete()`: Soft deletes (sets inactive)
- `handleDuplicate()`: Duplicates product with pre-filled form
- `handleAdjustStock()`: Quick stock adjustment
- `handleLinkProduct()`: Links store product to catalog
- `handleNewProduct()`: Submits new product for approval

**API Calls:**
- `getSupplierCatalog(supplierId)`
- `getStoreProductsForSupplier(limit)`
- `addSupplierCatalogItem(supplierId, data)`
- `updateSupplierCatalogItem(itemId, data)`

### 3. SupplierSettings

**Purpose:** Business profile, payment, and notification settings

**State:**
```typescript
const [businessForm, setBusinessForm] = useState<BusinessFormData>({...});
const [paymentForm, setPaymentForm] = useState<PaymentFormData>({...});
const [notificationForm, setNotificationForm] = useState<NotificationFormData>({...});
const [errors, setErrors] = useState<Record<string, string>>({});
```

**Key Functions:**
- `loadProfile()`: Fetches supplier profile
- `validateBusinessForm()`: Validates form inputs
- `handleBusinessSave()`: Saves business information
- `handlePaymentSave()`: Saves payment settings
- `handleNotificationSave()`: Saves notification preferences

**API Calls:**
- `getSupplierProfile(supplierId)`
- `updateSupplierProfile(supplierId, updates)`

---

## Data Flow

### Loading Data

```
Component Mount
    ↓
useEffect with supplierId dependency
    ↓
loadData() function
    ↓
Promise.all([multiple API calls])
    ↓
setState with results
    ↓
Component renders with data
```

### Updating Data

```
User Action (button click)
    ↓
Event Handler
    ↓
Validation (if applicable)
    ↓
API Call with loading state
    ↓
Success: Update local state + Toast
    ↓
Error: Show error toast
    ↓
Finally: Clear loading state
```

---

## API Integration

### Service Layer

All API calls go through service files in `src/services/`:

```typescript
// Example: Updating a catalog item
import { updateSupplierCatalogItem } from '@/services/supplierService';

const handleSave = async () => {
  try {
    setSaving(true);
    await updateSupplierCatalogItem(itemId, {
      price: parseFloat(price),
      stockQuantity: parseInt(stock),
      // ... other fields
    });
    toast({ title: 'Success', description: 'Item updated' });
  } catch (error) {
    toast({ title: 'Error', description: 'Update failed', variant: 'destructive' });
  } finally {
    setSaving(false);
  }
};
```

### Error Handling

All API calls should:
1. Wrap in try/catch
2. Show loading state
3. Display toast on success/error
4. Clear loading state in finally block

```typescript
try {
  setLoading(true);
  const data = await apiCall();
  setData(data);
  toast({ title: 'Success' });
} catch (error) {
  console.error('Error:', error);
  toast({ title: 'Error', variant: 'destructive' });
} finally {
  setLoading(false);
}
```

---

## Styling Guide

### Tailwind Classes

We use Tailwind CSS with custom design tokens:

```typescript
// Colors
'text-gray-900'      // Primary text
'text-gray-600'      // Secondary text
'text-gray-500'      // Tertiary text
'bg-blue-600'        // Primary action
'bg-gray-50'         // Light background

// Spacing
'p-4'                // Padding
'gap-4'              // Gap between flex/grid items
'space-y-4'          // Vertical spacing

// Responsive
'sm:flex-row'        // Small screens and up
'md:grid-cols-2'     // Medium screens and up
'lg:px-8'            // Large screens and up
```

### Component Patterns

```typescript
// Card with header
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Form field with error
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input
    id="field"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className={errors.field ? 'border-red-500' : ''}
    aria-invalid={!!errors.field}
    aria-describedby={errors.field ? 'field-error' : undefined}
  />
  {errors.field && (
    <p id="field-error" className="text-sm text-red-600">{errors.field}</p>
  )}
</div>

// Button with loading
<Button onClick={handleSave} disabled={saving}>
  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Save
</Button>
```

---

## Responsive Design

### Breakpoints

```typescript
// Tailwind breakpoints
sm: '640px'   // Mobile landscape, small tablets
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large desktops
```

### Mobile-First Approach

```typescript
// Default: Mobile styles
<div className="flex flex-col gap-2">
  
// Medium screens and up: Desktop styles
<div className="flex flex-col gap-2 md:flex-row md:gap-4">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Show on mobile, hide on desktop
<div className="block md:hidden">
```

### Responsive Tables

```typescript
// Desktop: Table
<div className="hidden md:block">
  <Table>...</Table>
</div>

// Mobile: Cards
<div className="md:hidden space-y-4">
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

---

## Accessibility

### ARIA Labels

```typescript
// Icon buttons
<Button aria-label="Edit product">
  <Edit className="h-4 w-4" />
</Button>

// Form inputs
<Input
  id="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>

// Error messages
<p id="email-error" role="alert">
  {errors.email}
</p>
```

### Keyboard Navigation

```typescript
// Dialog with ESC handler
<Dialog open={open} onOpenChange={setOpen}>
  {/* ESC automatically closes */}
</Dialog>

// Custom keyboard handler
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeDialog();
  }
};
```

### Focus Management

```typescript
// Auto-focus first input
<Input autoFocus />

// Focus trap in dialogs (handled by Dialog component)
<Dialog>...</Dialog>

// Return focus after dialog close
const buttonRef = useRef<HTMLButtonElement>(null);
const handleClose = () => {
  setOpen(false);
  buttonRef.current?.focus();
};
```

---

## State Management

### Local State

Use `useState` for component-specific state:

```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState<Data[]>([]);
const [error, setError] = useState<string | null>(null);
```

### Form State

Use controlled components:

```typescript
const [form, setForm] = useState({
  name: '',
  email: '',
  phone: '',
});

const handleChange = (field: string, value: string) => {
  setForm(prev => ({ ...prev, [field]: value }));
};
```

### Derived State

Use `useMemo` for computed values:

```typescript
const filteredProducts = useMemo(() => {
  return products.filter(p => 
    p.name.includes(searchQuery) &&
    (categoryFilter === 'all' || p.category === categoryFilter)
  );
}, [products, searchQuery, categoryFilter]);
```

---

## Common Patterns

### Loading States

```typescript
const [loading, setLoading] = useState(true);

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

### Empty States

```typescript
{items.length === 0 ? (
  <div className="text-center py-12">
    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
    <p className="text-gray-500">No items found</p>
  </div>
) : (
  <div>{/* Render items */}</div>
)}
```

### Toast Notifications

```typescript
import { toast } from '@/components/ui/use-toast';

// Success
toast({
  title: 'Success',
  description: 'Operation completed successfully',
});

// Error
toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive',
});
```

---

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SupplierProducts } from '../SupplierProducts';

describe('SupplierProducts', () => {
  it('filters products by search query', async () => {
    render(<SupplierProducts />);
    
    const searchInput = screen.getByPlaceholderText('Search for products...');
    fireEvent.change(searchInput, { target: { value: 'AC Unit' } });
    
    await waitFor(() => {
      expect(screen.getByText('AC Unit')).toBeInTheDocument();
      expect(screen.queryByText('Other Product')).not.toBeInTheDocument();
    });
  });
});
```

### Integration Tests

```typescript
it('updates product stock successfully', async () => {
  render(<SupplierProducts />);
  
  // Open adjust stock dialog
  const adjustButton = screen.getByLabelText('Adjust stock for Product 1');
  fireEvent.click(adjustButton);
  
  // Enter new stock value
  const stockInput = screen.getByLabelText('New Stock Quantity');
  fireEvent.change(stockInput, { target: { value: '50' } });
  
  // Save
  const saveButton = screen.getByText('Update Stock');
  fireEvent.click(saveButton);
  
  // Verify API call
  await waitFor(() => {
    expect(mockUpdateCatalogItem).toHaveBeenCalledWith(
      'product-1',
      expect.objectContaining({ stockQuantity: 50 })
    );
  });
  
  // Verify toast
  expect(screen.getByText('Stock updated')).toBeInTheDocument();
});
```

---

## Debugging

### Common Issues

**Issue:** Component not re-rendering after state update
```typescript
// ❌ Wrong: Mutating state
items.push(newItem);
setItems(items);

// ✅ Correct: Creating new array
setItems([...items, newItem]);
```

**Issue:** Infinite loop in useEffect
```typescript
// ❌ Wrong: Missing dependency
useEffect(() => {
  loadData();
}, []); // loadData not in deps

// ✅ Correct: Include all dependencies
useEffect(() => {
  loadData();
}, [loadData]);
```

**Issue:** Form not updating
```typescript
// ❌ Wrong: Not using controlled component
<Input defaultValue={value} />

// ✅ Correct: Controlled component
<Input value={value} onChange={(e) => setValue(e.target.value)} />
```

### Debug Tools

```typescript
// Console logging
console.log('State:', { loading, data, error });

// React DevTools
// Install browser extension to inspect component tree

// Network tab
// Check API calls in browser DevTools
```

---

## Performance Optimization

### Memoization

```typescript
// Memoize expensive computations
const filteredData = useMemo(() => {
  return data.filter(/* expensive filter */);
}, [data, filterCriteria]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Lazy Loading

```typescript
// Already implemented in App.tsx
const SupplierProducts = lazy(() => 
  import('@/pages/dashboards/SupplierProducts')
);
```

### Avoid Unnecessary Re-renders

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Split large components into smaller ones
// Only the changed part re-renders
```

---

## Deployment

### Build

```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

### Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.production.com
VITE_FIREBASE_API_KEY=your-key
```

### Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Accessibility audit passed

---

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Type Errors

```bash
# Regenerate types
npm run type-check
```

### Runtime Errors

1. Check browser console
2. Check network tab for failed API calls
3. Check React DevTools for component state
4. Add console.logs to trace execution

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Support

For questions or issues:
- 📧 Email: dev-team@supremoac.com
- 💬 Slack: #supplier-dashboard
- 📚 Wiki: /wiki/supplier-dashboard
- 🐛 Issues: /issues

---

**Last Updated:** October 27, 2025  
**Maintainer:** Development Team  
**Version:** 2.0.0
