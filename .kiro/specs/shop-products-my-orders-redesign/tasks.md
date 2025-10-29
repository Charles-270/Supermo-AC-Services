# Implementation Plan

- [x] 1. Update Shop Products Page layout and structure


  - Refactor ProductCatalogRedesigned.tsx to match new design system with proper responsive breakpoints
  - Ensure CustomerSidebar integration with proper spacing (lg:ml-64)
  - Update header with search bar, cart icon with count badge, and mobile nav toggle
  - Implement proper loading states with skeleton cards
  - _Requirements: 1.1, 1.2, 1.5, 10.1_



- [x] 2. Redesign Filter Rail component
  - Create responsive filter rail that's sticky on desktop (≥1025px) and full-height sheet on mobile (≤640px)
  - Implement Active Filter Chips display with individual remove actions
  - Add "Clear all" button that appears when filters are active
  - Style category filter as button list with counts and active state highlighting
  - Implement price range slider UI (bind to existing filter logic)
  - Update brand filter dropdown styling
  - Add in-stock checkbox with proper label association
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Enhance Product Card component
  - Update ProductCard.tsx to match new visual design (rounded-2xl, shadow-sm, proper padding)
  - Implement grid mode layout with aspect-square image, badges, two-line clamps for title/description
  - Implement list mode layout with horizontal flex layout
  - Add hover states with shadow-lg and subtle scale transform

  - Update add-to-cart button styling (rounded-xl, proper height)
  - Show quantity stepper when product is already in cart
  - Ensure proper image lazy loading and error states
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Implement empty and error states for Shop Products

  - Create empty state component for no products found with Package icon and "Clear Filters" CTA
  - Create error state component for fetch failures with AlertCircle icon and "Try Again" button
  - Ensure proper loading skeleton grid matches expected product card layout
  - _Requirements: 10.1, 10.2, 10.3_


- [ ] 5. Create Cart Page with responsive layout
  - Create new CartPage.tsx component within dashboard shell
  - Implement two-column desktop layout (cart items + summary card on right)
  - Implement mobile layout with stacked items and sticky bottom summary bar
  - Add empty cart state with ShoppingCart icon and "Continue Shopping" CTA
  - Wire to existing useCart hook without modifying cart logic
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Create Cart Line Item component
  - Create CartLineItem.tsx with compact card design (rounded-xl, border, p-4)
  - Implement horizontal layout with product image (80x80), info, and controls
  - Add quantity stepper with rounded-lg border and +/- buttons
  - Add remove button with red color scheme (text-red-600 hover:bg-red-50)
  - Display line total with proper formatting
  - Wire quantity updates and remove actions to existing cart handlers
  - _Requirements: 4.2_

- [ ] 7. Create Order Summary Card component
  - Create OrderSummaryCard.tsx with rounded-2xl card design
  - Implement sticky positioning for desktop (top: 96px)
  - Implement fixed bottom positioning for mobile with shadow-lg
  - Display subtotal, tax, delivery, and total with proper formatting
  - Add checkout button (w-full rounded-xl h-12 bg-teal-600)
  - Show loading state on button when processing
  - _Requirements: 4.3, 4.4_

- [ ] 8. Create Checkout Flow with stepper
  - Create CheckoutPage.tsx with multi-step flow (Cart → Address → Payment → Review → Success)
  - Implement CheckoutStepper component reusing BookingStepper pattern
  - Add step navigation (back/next buttons) with proper state management
  - Ensure stepper is compact on mobile with progress dots
  - Wire to existing checkout logic without modifying backend calls
  - _Requirements: 4.1, 5.3_

- [ ] 9. Create Address/Delivery step component
  - Create AddressForm.tsx with card container (rounded-2xl border p-6 md:p-8)
  - Implement form fields with h-12 rounded-xl styling
  - Add saved addresses selector with radio tiles if backend provides saved addresses
  - Implement form validation with red-500 borders and error text
  - Add proper labels and aria-describedby for accessibility
  - _Requirements: 4.5, 8.1, 8.2_

- [ ] 10. Create Payment step component
  - Create PaymentMethodSelector.tsx with card-style radio tiles
  - Style payment method tiles (rounded-xl border-2, selected: border-teal-600 bg-teal-50)
  - Implement accordion pattern for additional fields within selected tile
  - Add payment method icons with flex layout
  - Wire to existing payment handler without modifying logic
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 11. Create Review & Confirm step component
  - Create OrderReview.tsx with stepper at top showing all steps
  - Display comprehensive order summary card with all details
  - Show items list with thumbnails, quantities, and pricing
  - Display totals breakdown (subtotal, tax, delivery, grand total)
  - Add "Place Order" button wired to existing order creation handler
  - _Requirements: 5.3, 5.4, 5.5_

- [ ] 12. Create Order Success component
  - Create OrderSuccess.tsx with centered layout (max-w-2xl)
  - Add CheckCircle icon (h-20 w-20 text-green-500)
  - Display order number prominently (text-3xl font-bold)
  - Show order summary in rounded-2xl card
  - Add "View Order" and "Continue Shopping" buttons with proper routing
  - _Requirements: 5.4, 5.5_

- [ ] 13. Create My Orders Page
  - Create MyOrdersPage.tsx within dashboard shell
  - Implement state management for orders list and selected order
  - Add loading state with skeleton rows/cards
  - Add empty state for no orders with Package icon and "Start Shopping" CTA
  - Wire to existing orders service/hook
  - _Requirements: 6.1, 6.2, 10.5_

- [ ] 14. Create Orders Table component for desktop
  - Create OrdersTable.tsx with rounded-xl border styling
  - Implement table columns: Order #, Date, Items (count/preview), Total, Status pill, Actions
  - Style header with bg-neutral-50 and font-semibold
  - Add hover states on rows (hover:bg-neutral-50)
  - Implement status pills with color coding (pending: yellow, processing: blue, completed: green, cancelled: red)
  - Add "View details" button in actions column
  - _Requirements: 6.1_

- [ ] 15. Create Order Card component for mobile
  - Create OrderCard.tsx with rounded-xl card design
  - Implement vertical stack layout with gap-3
  - Display order #, date, items preview with thumbnails, status pill, and total
  - Add full-width "View Details" button (rounded-lg)
  - Ensure proper touch targets (min 44x44px)
  - _Requirements: 6.2_

- [ ] 16. Create Order Details Dialog component
  - Create OrderDetailsDialog.tsx with modal overlay (bg-black/50)
  - Implement dialog content with max-w-3xl and rounded-2xl
  - Create header with Order # + Status pill on left, Close button (X icon) on right
  - Add summary grid (2x2 on desktop, stack on mobile) with customer, delivery, payment, date info
  - Display items list with thumbnails, names, quantities, prices, and line totals
  - Show totals breakdown with border-t separator
  - Add footer with "Download Receipt" (outline) and "Reorder" (primary) buttons if supported
  - Include fulfillment/technician section if data exists
  - Implement focus trap and proper keyboard navigation
  - _Requirements: 6.3, 6.4, 6.5, 8.3, 8.4_

- [ ] 17. Update Admin Catalog to match Shop Products visual style
  - Update AdminProductCard.tsx to mirror public ProductCard design
  - Maintain same image ratio, typography scale, badges, and price layout
  - Add admin-only controls (edit, hide, inventory) as subtle footer controls or kebab menu
  - Style edit button (text-blue-600 hover:bg-blue-50)
  - Add inventory badges (low stock: orange, out of stock: red) positioned absolute top-3 right-3
  - Ensure all existing admin functionality remains unchanged
  - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [ ] 18. Update Admin Filter Bar to match Shop Products filters
  - Update AdminFilterBar.tsx to use same visual styling as public FilterRail
  - Implement chips and slider components matching public shop design
  - Add admin-specific filters (visibility status, stock status, featured toggle)
  - Maintain all existing admin filter logic
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 19. Implement accessibility features across all components
  - Add semantic HTML headings (h1, h2, h3) to all major sections
  - Implement aria-labels and aria-describedby for all form inputs
  - Add focus trapping to filter drawer and all dialogs
  - Ensure all interactive elements are keyboard-reachable with visible focus states (ring-2 ring-teal-500)
  - Add aria-current attributes for active view modes and sort selections
  - Implement screen reader announcements with aria-live for dynamic content
  - Add proper role attributes (dialog, complementary, status, etc.)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 20. Apply consistent visual design system across all components
  - Update typography to use Inter/system font with proper size scales (text-2xl md:text-3xl for headings, text-sm md:text-base for body)
  - Apply card styling (rounded-2xl border shadow-sm bg-white p-4 md:p-5) consistently
  - Style all buttons with proper variants (primary: solid, secondary: outline, icon: subtle) and dimensions (rounded-xl h-10 md:h-11)
  - Apply chip/badge styling with soft backgrounds and medium weight labels
  - Implement consistent spacing (gap-4 md:gap-6, my-6 md:my-8)
  - Ensure all hover states use shadow-lg and subtle transforms
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 21. Write integration tests for Shop Products flow
  - Test search → filter → view product → add to cart flow
  - Verify URL state synchronization with filters
  - Test cart count updates when adding products
  - Verify filter chip removal updates results
  - Test "Clear all" filters functionality
  - _Requirements: 1.5, 3.1, 3.2, 3.3_

- [ ]* 22. Write integration tests for Checkout flow
  - Test cart → address → payment → review → success flow
  - Verify step navigation (back/next) works correctly
  - Test form validation at each step
  - Verify order creation with existing backend
  - Test error handling during checkout
  - _Requirements: 4.5, 5.5_

- [ ]* 23. Write integration tests for Orders flow
  - Test viewing orders list
  - Verify opening order details dialog
  - Test download receipt functionality if available
  - Test reorder functionality if available
  - Verify dialog close and focus restoration
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 24. Perform responsive testing across breakpoints
  - Test mobile layouts (375px, 414px)
  - Test tablet layouts (768px, 1024px)
  - Test desktop layouts (1280px, 1920px)
  - Verify touch targets are minimum 44x44px on mobile
  - Test filter sheet slide-up animation on mobile
  - Verify sticky positioning works correctly on desktop
  - _Requirements: 1.2, 1.3, 4.3, 4.4_

- [ ]* 25. Perform accessibility audit
  - Run axe DevTools on all pages
  - Test keyboard navigation through all interactive elements
  - Verify screen reader announcements with NVDA/JAWS
  - Test focus management in dialogs and sheets
  - Verify color contrast ratios meet WCAG 2.1 AA
  - Test with keyboard only (no mouse)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
