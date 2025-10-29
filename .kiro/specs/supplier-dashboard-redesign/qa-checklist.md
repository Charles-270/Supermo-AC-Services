# Supplier Dashboard - QA Testing Checklist

**Version:** 1.0  
**Date:** October 27, 2025  
**Tester:** _____________  
**Environment:** [ ] Dev [ ] Staging [ ] Production

---

## Pre-Test Setup

- [ ] Clear browser cache
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on multiple devices (Desktop, Tablet, Mobile)
- [ ] Login as supplier role
- [ ] Verify test data exists (products, orders, catalog items)

---

## 1. Overview Page (`/dashboard/supplier`)

### Stats Cards
- [ ] Total Products count is accurate
- [ ] Low Stock count matches products ≤ 5 units
- [ ] Pending Orders count is correct
- [ ] Total Revenue displays formatted currency

### Policy Banner
- [ ] Banner displays on first visit
- [ ] Close button (X) dismisses banner
- [ ] Banner stays dismissed after page refresh
- [ ] Banner text is readable and properly formatted

### Low Stock Alert
- [ ] Alert shows when products are below 5 units
- [ ] Count in alert matches actual low stock products
- [ ] Clicking alert navigates to `/dashboard/supplier/products?filter=low-stock`
- [ ] Close button dismisses alert
- [ ] Alert stays dismissed after refresh

### Recent Orders Table (Desktop)
- [ ] Table displays up to 5 recent orders
- [ ] Order ID, Customer, Items, Total, Status columns visible
- [ ] Status badges show correct colors (Pending=yellow, Shipped=blue, Delivered=green)
- [ ] "Mark Shipped" button appears for payment-confirmed/processing orders
- [ ] "Mark Delivered" button appears for shipped orders
- [ ] Clicking "Mark Shipped" updates order status
- [ ] Clicking "Mark Delivered" updates order status
- [ ] Loading spinner shows during status update
- [ ] Toast notification appears after successful update
- [ ] "View all orders" button navigates to `/orders`

### Recent Orders (Mobile < 640px)
- [ ] Orders display as cards (not table)
- [ ] All order info visible in card layout
- [ ] Status badge visible in card
- [ ] Action buttons are full-width
- [ ] Buttons are tappable (≥ 44px height)
- [ ] No horizontal scroll

### Accessibility
- [ ] All buttons have ARIA labels
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Screen reader announces order updates

---

## 2. Manage Products Page (`/dashboard/supplier/products`)

### Search and Filters
- [ ] Search input filters by product name
- [ ] Search input filters by category
- [ ] Category dropdown shows all categories
- [ ] Category filter works correctly
- [ ] Status dropdown shows all statuses
- [ ] Status filter works correctly
- [ ] Multiple filters work together
- [ ] Filters update results immediately

### Products Table (Desktop)
- [ ] Table shows product image/icon, name, SKU
- [ ] Category, Price, Stock, Status columns visible
- [ ] Status badges show correct colors:
  - [ ] In Stock (green) for stock > 5
  - [ ] Low Stock (yellow) for stock 1-5
  - [ ] Out of Stock (red) for stock = 0
  - [ ] Pending (amber) for pending status
- [ ] Edit button opens edit dialog
- [ ] Adjust Stock button opens stock dialog
- [ ] Duplicate button opens new product form with pre-filled data
- [ ] Delete button shows confirmation
- [ ] Delete sets product to inactive status

### Products (Mobile < 640px)
- [ ] Products display as cards
- [ ] All product info visible
- [ ] Actions in dropdown or stacked
- [ ] No horizontal scroll
- [ ] Images display correctly

### Link Store Product Dialog
- [ ] Dialog opens when clicking "Link Store Product"
- [ ] Dropdown shows available store products
- [ ] Selecting product pre-fills price and stock
- [ ] All form fields work correctly
- [ ] Validation prevents empty required fields
- [ ] "Link Product" button saves successfully
- [ ] Toast notification shows success
- [ ] Dialog closes after save
- [ ] Product appears in catalog

### New Product Request Dialog
- [ ] Dialog opens when clicking "New Product"
- [ ] All form fields work correctly
- [ ] Category dropdown works
- [ ] Validation prevents empty product name
- [ ] "Submit for Approval" button saves
- [ ] Product status set to "pending"
- [ ] Toast notification shows success
- [ ] Dialog closes after save

### Edit Product Dialog
- [ ] Dialog opens with current product data
- [ ] All fields are editable
- [ ] Price and stock validation works
- [ ] "Save Changes" button updates product
- [ ] Toast notification shows success
- [ ] Dialog closes after save
- [ ] Changes reflect in table

### Adjust Stock Dialog
- [ ] Dialog opens with current stock value
- [ ] Input accepts only numbers
- [ ] Validation prevents negative numbers
- [ ] "Update Stock" button saves
- [ ] Toast notification shows success
- [ ] Dialog closes after save
- [ ] New stock value shows in table

### Duplicate Product
- [ ] Clicking duplicate opens new product form
- [ ] Form pre-filled with original product data
- [ ] Product name has "(Copy)" appended
- [ ] Can modify all fields before saving
- [ ] Saves as new product (not overwrite)

### Pagination
- [ ] Shows correct page info (e.g., "Showing 1 to 10 of 25")
- [ ] "Previous" button disabled on first page
- [ ] "Next" button disabled on last page
- [ ] Pagination works correctly
- [ ] Page resets when filters change

### Accessibility
- [ ] All icon buttons have ARIA labels
- [ ] All icon buttons have tooltips
- [ ] Tab order is logical
- [ ] ESC closes dialogs
- [ ] Focus returns to trigger after dialog close

---

## 3. Settings Page (`/dashboard/supplier/settings`)

### Business Information Section
- [ ] Form loads existing data correctly
- [ ] All input fields are editable
- [ ] Business Name validation (required)
- [ ] Email validation (format check)
- [ ] Phone validation (format check)
- [ ] Error messages show for invalid inputs
- [ ] Error messages have red border
- [ ] Errors clear when typing
- [ ] "Save Changes" button works
- [ ] Toast notification shows success
- [ ] Form validation prevents save if errors

### Payment Settings Section
- [ ] Form loads existing data
- [ ] All fields are editable
- [ ] Account number field is password-masked
- [ ] "Save Payment Info" button works
- [ ] Toast notification shows success

### Notification Preferences Section
- [ ] Section displays correctly
- [ ] Email Notifications toggle works
- [ ] SMS Notifications toggle works
- [ ] Order Updates checkbox works
- [ ] Low Stock Alerts checkbox works
- [ ] New Product Approvals checkbox works
- [ ] "Save Preferences" button works
- [ ] Toast notification shows success
- [ ] Preferences persist after refresh

### Form Validation
- [ ] Required fields show error if empty
- [ ] Email format validated
- [ ] Phone format validated
- [ ] Error messages are clear
- [ ] ARIA attributes present for errors
- [ ] Screen reader announces errors

### Responsive Layout
- [ ] Forms are single column on mobile
- [ ] All inputs are full-width on mobile
- [ ] Buttons are appropriately sized
- [ ] No horizontal scroll
- [ ] Touch targets ≥ 44px

---

## 4. Layout & Navigation

### Sidebar (Desktop)
- [ ] Sidebar shows all 3 nav items
- [ ] Active page is highlighted
- [ ] Clicking nav items navigates correctly
- [ ] Collapse button works
- [ ] Sidebar collapses to icon-only view
- [ ] Icons remain visible when collapsed
- [ ] User profile section shows at bottom
- [ ] Sign out button works

### Sidebar (Mobile)
- [ ] Hamburger menu button visible
- [ ] Clicking opens sidebar overlay
- [ ] Sidebar slides in from left
- [ ] Dark overlay appears behind sidebar
- [ ] Clicking overlay closes sidebar
- [ ] Close (X) button closes sidebar
- [ ] Navigation works from mobile sidebar
- [ ] Sign out works from mobile sidebar

### Mobile Header
- [ ] Header shows on mobile only
- [ ] "Supplier Hub" title visible
- [ ] Menu button opens sidebar
- [ ] Header is sticky at top

### Page Transitions
- [ ] Navigation is smooth
- [ ] No flash of unstyled content
- [ ] Loading states show appropriately
- [ ] No console errors during navigation

---

## 5. Cross-Browser Testing

### Chrome/Edge
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

### Mobile Safari (iOS)
- [ ] All features work
- [ ] Touch interactions work
- [ ] No layout issues

### Chrome Mobile (Android)
- [ ] All features work
- [ ] Touch interactions work
- [ ] No layout issues

---

## 6. Accessibility Testing

### Keyboard Navigation
- [ ] Tab key moves through all interactive elements
- [ ] Tab order is logical
- [ ] Shift+Tab moves backwards
- [ ] Enter activates buttons
- [ ] Space toggles checkboxes
- [ ] ESC closes dialogs
- [ ] No keyboard traps

### Screen Reader (NVDA/JAWS/VoiceOver)
- [ ] All buttons announced correctly
- [ ] Form labels read properly
- [ ] Error messages announced
- [ ] Status changes announced
- [ ] Toast notifications announced
- [ ] Dialogs announced when opened

### Visual
- [ ] Focus indicators visible
- [ ] Contrast ratios meet WCAG AA (4.5:1)
- [ ] Text is readable at 200% zoom
- [ ] No information conveyed by color alone

### ARIA
- [ ] All interactive elements have labels
- [ ] Form inputs have proper associations
- [ ] Error messages use aria-describedby
- [ ] Invalid inputs marked with aria-invalid
- [ ] Live regions for dynamic content

---

## 7. Performance Testing

### Load Times
- [ ] Overview page loads < 2 seconds
- [ ] Products page loads < 2 seconds
- [ ] Settings page loads < 2 seconds
- [ ] Navigation between pages is instant

### Interactions
- [ ] Filters apply immediately
- [ ] Dialogs open/close smoothly
- [ ] No lag when typing in inputs
- [ ] Buttons respond immediately

### Network
- [ ] Works on slow 3G connection
- [ ] Proper loading states on slow network
- [ ] Error handling for network failures

---

## 8. Edge Cases

### Empty States
- [ ] No products: Shows empty state message
- [ ] No orders: Shows empty state message
- [ ] No search results: Shows "no results" message
- [ ] No available store products: Shows appropriate message

### Error Handling
- [ ] API errors show toast notifications
- [ ] Network errors handled gracefully
- [ ] Invalid data doesn't crash app
- [ ] Form validation prevents bad data

### Data Limits
- [ ] Long product names don't break layout
- [ ] Many products: Pagination works
- [ ] Large numbers format correctly
- [ ] Special characters in names handled

---

## 9. Security Testing

### Input Validation
- [ ] XSS attempts are sanitized
- [ ] SQL injection attempts blocked
- [ ] File upload validation works
- [ ] Form data is validated server-side

### Authentication
- [ ] Requires supplier role
- [ ] Non-suppliers redirected
- [ ] Session timeout handled
- [ ] Sign out clears session

---

## 10. Regression Testing

### Existing Features
- [ ] All original functionality still works
- [ ] No features were removed
- [ ] API calls unchanged
- [ ] Data contracts intact

### Integration
- [ ] Works with existing order system
- [ ] Works with existing product catalog
- [ ] Works with existing user management
- [ ] No conflicts with other dashboards

---

## Issues Found

| # | Page | Issue | Severity | Status |
|---|------|-------|----------|--------|
| 1 |      |       |          |        |
| 2 |      |       |          |        |
| 3 |      |       |          |        |

**Severity Levels:**
- **Critical:** Blocks core functionality
- **High:** Major feature broken
- **Medium:** Minor feature issue
- **Low:** Cosmetic or edge case

---

## Sign-Off

- [ ] All critical issues resolved
- [ ] All high priority issues resolved
- [ ] Medium/low issues documented for future
- [ ] Ready for production deployment

**Tester Signature:** _____________  
**Date:** _____________  
**Approved By:** _____________  
**Date:** _____________

---

## Notes

_Add any additional observations, suggestions, or concerns here:_

