# Technician Hub Redesign — Frontend Audit

**Date:** October 27, 2025  
**Scope:** Frontend-only UI/UX redesign + minimal pricing source of truth  
**Status:** Pre-implementation audit

---

## Executive Summary

This audit identifies all frontend issues in the Technician Hub that need fixing before the redesign implementation. The platform's backend is working correctly; our focus is on UI wiring, broken controls, deprecated pricing displays, and accessibility gaps.

**Key Findings:**
- ✅ Backend APIs are functional and should NOT be modified (except 2 allowed additions)
- ❌ SERVICE_PACKAGES deprecated pricing model still displayed in 3 locations
- ❌ Multiple UI controls lack proper wiring to existing handlers
- ⚠️ Responsive design issues on mobile breakpoints
- ⚠️ Accessibility gaps in focus management and ARIA labels

---

## P0 Issues (Critical - Blocks Core Functionality)

### P0-1: SERVICE_PACKAGES Deprecated Pricing Display

**Location:** 
- `src/pages/dashboards/TechnicianDashboard.tsx` (lines 166-176)
- `src/components/booking/BookingForm.tsx` (lines 146-147, 405, 425)
- `src/types/booking.ts` (lines 196-226)

**Issue:**  
The UI still displays the old 3-tier package system (Basic/Standard/Premium) instead of the 4 real services (Installation, Maintenance, Repair, Inspection).

**Current Code:**
```typescript
// TechnicianDashboard.tsx - Lines 166-176
<span>🔍 Basic Service:</span>
<span className="font-semibold">{formatCurrency(SERVICE_PACKAGES.basic.price * TECHNICIAN_PAYOUT_RATE)}</span>
// ... similar for standard and premium
```

**Expected Behavior:**  
Display earnings for the 4 actual services using `SERVICE_BASE_PRICING`:
- Installation: GHS 500 → Tech earns GHS 450
- Maintenance: GHS 150 → Tech earns GHS 135
- Repair: GHS 200 → Tech earns GHS 180
- Inspection: GHS 100 → Tech earns GHS 90

**Fix Required:**
1. Replace SERVICE_PACKAGES references with SERVICE_BASE_PRICING
2. Update UI to show 4 services instead of 3 packages
3. Use dynamic pricing from `pricingService.getCurrentPricing()` instead of hardcoded values
4. Display `priceAtBooking` for historical bookings if available

**Affected Files:**
- `src/pages/dashboards/TechnicianDashboard.tsx`
- `src/components/booking/BookingForm.tsx`
- `src/pages/technician/EarningsHistory.tsx` (already partially correct)

---

### P0-2: Customer Booking UI Shows Wrong Pricing Model

**Location:** `src/components/booking/BookingForm.tsx`

**Issue:**  
Customer booking flow displays 3-tier packages (Basic/Standard/Premium) instead of 4 service types with current catalog prices.

**Current Flow:**
1. Step 1: Select package (basic/standard/premium)
2. Shows fixed prices from SERVICE_PACKAGES constant

**Expected Flow:**
1. Step 1: Select service type (Installation/Maintenance/Repair/Inspection)
2. Show current catalog price from Service Pricing settings
3. Lock price at booking time as `agreedPrice`
4. For existing bookings, display `priceAtBooking` if available

**Fix Required:**
1. Redesign Step 1 to show 4 service cards instead of 3 packages
2. Fetch current prices from `getCurrentPricing()` on mount
3. Display dynamic prices in service selection
4. Ensure `agreedPrice` is set correctly at booking creation

---

## P1 Issues (High Priority - Broken UI Controls)

### P1-1: Technician Dashboard Navigation Buttons

**Location:** `src/pages/dashboards/TechnicianDashboard.tsx`

**Issue:**  
All navigation buttons work correctly (verified in code review).

**Status:** ✅ No fix needed - buttons properly wired to routes

---

### P1-2: Job Status Update Workflow

**Location:** `src/pages/technician/JobDetail.tsx`

**Issue:**  
Status update buttons work correctly with proper workflow mapping.

**Current Workflow:**
```typescript
confirmed → en_route → arrived → in_progress → completed
```

**Status:** ✅ No fix needed - workflow properly implemented

**Note:** Completion redirects to `/technician/job/${jobId}/complete` which is correct.

---

### P1-3: Job Completion Form

**Location:** `src/pages/technician/JobComplete.tsx`

**Issue:**  
Form exists and wires to `completeBooking()` service correctly.

**Status:** ✅ No fix needed - completion flow works

---

### P1-4: Earnings Display Logic

**Location:** `src/pages/technician/EarningsHistory.tsx`

**Issue:**  
Earnings calculation uses hardcoded `SERVICE_BASE_PRICING` instead of dynamic pricing.

**Current Code:**
```typescript
// Line 213 - Uses hardcoded pricing
const earnings = job.finalCost! * TECHNICIAN_PAYOUT_RATE;
```

**Expected Behavior:**
- For completed jobs: Use `finalCost` from booking (already correct)
- For pending jobs: Show current catalog price × 0.9
- Display "Price at booking" label for historical jobs

**Fix Required:**
1. Keep using `finalCost` for completed jobs (already correct)
2. Add label indicating "Agreed price at booking time"
3. Update earnings breakdown cards to use dynamic pricing

---

## P2 Issues (Medium Priority - UX Improvements)

### P2-1: Mobile Responsive Issues

**Location:** Multiple pages

**Issues:**
1. Tables don't collapse to cards on mobile (< 640px)
2. Action buttons too small for touch targets (< 44px)
3. Horizontal scroll on narrow screens

**Affected Components:**
- `src/pages/technician/JobsList.tsx` - Table needs card view
- `src/pages/technician/EarningsHistory.tsx` - Table needs card view
- All button components need min 44×44px tap targets

**Fix Required:**
1. Add responsive table → card transformation at sm breakpoint
2. Implement overflow menu for actions on mobile
3. Ensure all interactive elements meet 44×44px minimum
4. Add safe-area insets for notched devices

---

### P2-2: Accessibility Gaps

**Location:** Multiple components

**Issues:**

1. **Missing ARIA Labels:**
   - Navigation buttons lack descriptive labels
   - Status badges need aria-label for screen readers
   - Filter buttons missing role="group"

2. **Focus Management:**
   - No visible focus rings on keyboard navigation
   - Modal dialogs don't trap focus
   - No focus restoration after dialog close

3. **Color Contrast:**
   - Some status badges fail WCAG AA (need audit)
   - Gray text on light backgrounds may be too low contrast

4. **Live Regions:**
   - Status updates don't announce to screen readers
   - Toast notifications need aria-live="polite"

**Fix Required:**
1. Add aria-label to all interactive elements
2. Implement focus trap in dialogs
3. Add visible focus rings (2px solid, high contrast)
4. Audit all color combinations for WCAG AA compliance
5. Add aria-live regions for dynamic content

---

### P2-3: Loading States

**Location:** Multiple pages

**Issue:**  
Loading spinners work but lack proper loading skeletons for better UX.

**Current:** Simple spinner in center of screen  
**Expected:** Skeleton loaders matching content structure

**Fix Required:**
1. Add skeleton loaders for job cards
2. Add skeleton loaders for earnings tables
3. Maintain spinner for initial page load

---

## Backend Additions (Only 2 Allowed)

### Backend-1: Service Catalog Pricing API ✅

**Status:** Already implemented in `src/services/pricingService.ts`

**Existing Endpoints:**
- `getCurrentPricing()` - Read current prices
- `updateServicePricing()` - Admin update prices
- `getServicePrice(serviceType)` - Get single service price

**Required UI Integration:**
1. Admin Settings page needs UI to edit prices
2. Customer booking needs to fetch current prices
3. Technician earnings needs to display current rates

---

### Backend-2: Price Change Notifications ✅

**Status:** Partially implemented in `pricingService.ts`

**Existing:**
- `updateServicePricing()` creates notifications in Firestore
- Notifications stored in `priceChangeNotifications` collection

**Missing:**
- UI to display notifications to technicians
- UI to display notifications to affected customers
- Notification bell/badge component

**Required UI:**
1. Notification bell in technician header
2. Notification list component
3. Mark as read functionality
4. Filter for price-change notifications

---

## Pricing Display Rules (Critical)

### Rule 1: Customer Booking Flow
```
When customer books:
1. Fetch current catalog price from getCurrentPricing()
2. Display as "Current price: GHS X"
3. Lock price as agreedPrice at booking creation
4. Store in booking.agreedPrice field
```

### Rule 2: Technician Job View
```
When technician views job:
1. If booking.priceAtBooking exists → display that
2. Else display booking.agreedPrice
3. Label as "Agreed price" or "Price at booking"
4. Calculate tech share: price × 0.9
```

### Rule 3: Technician Earnings History
```
For completed jobs:
1. Use booking.finalCost (actual charged amount)
2. Calculate tech share: finalCost × 0.9
3. Label as "Earnings from this job"

For pending jobs:
1. Use booking.agreedPrice
2. Calculate estimated earnings: agreedPrice × 0.9
3. Label as "Estimated earnings"
```

### Rule 4: Admin Pricing Management
```
Admin can edit:
1. Installation base price
2. Maintenance base price
3. Repair base price
4. Inspection base price

On save:
1. Update settings/servicePricing document
2. Create price change notifications
3. Trigger one-time fan-out to affected users
```

---

## Console Warnings Audit

**Method:** Review browser console during normal use

**Findings:**
- No console errors reported in existing code review
- Need to verify during implementation:
  - React key warnings in lists
  - Uncontrolled component warnings
  - Missing dependency warnings in useEffect

**Action:** Run full console audit during implementation phase

---

## Workflow Verification

### Technician Job Workflow ✅

**Current Flow (Verified Working):**
```
1. Admin assigns job → status: confirmed
2. Tech clicks "Start Journey" → status: en_route
3. Tech clicks "Mark as Arrived" → status: arrived
4. Tech clicks "Start Working" → status: in_progress
5. Tech clicks "Complete Job" → redirects to completion form
6. Tech submits completion → status: completed
```

**Status:** ✅ All handlers properly wired

---

### Customer Booking Workflow ⚠️

**Current Flow:**
```
1. Select package (WRONG - should be service type)
2. Enter details
3. Select date/time
4. Review and confirm
5. Create booking with agreedPrice
```

**Issue:** Step 1 uses deprecated packages  
**Fix:** Replace with 4 service type selection

---

## Files Requiring Changes

### High Priority (P0/P1)
1. ✅ `src/pages/dashboards/TechnicianDashboard.tsx` - Remove SERVICE_PACKAGES
2. ✅ `src/components/booking/BookingForm.tsx` - Replace packages with services
3. ✅ `src/pages/technician/EarningsHistory.tsx` - Update pricing display
4. ✅ `src/pages/admin/PlatformSettings.tsx` - Add pricing management UI

### Medium Priority (P2)
5. ⚠️ `src/pages/technician/JobsList.tsx` - Add mobile responsive cards
6. ⚠️ `src/pages/technician/JobDetail.tsx` - Add accessibility improvements
7. ⚠️ `src/components/layout/TechnicianLayout.tsx` - Add notification bell
8. ⚠️ All components - Add focus management and ARIA labels

### Low Priority (P3)
9. 📝 `src/components/technician/NotificationBell.tsx` - Create new component
10. 📝 `src/components/admin/ServicePricingEditor.tsx` - Create new component
11. 📝 Add skeleton loaders to all loading states

---

## Acceptance Criteria Checklist

### Pricing
- [ ] No SERVICE_PACKAGES visible in any UI
- [ ] Customer booking shows 4 services with current catalog prices
- [ ] Technician earnings show correct service-based pricing
- [ ] Admin can edit service prices via UI
- [ ] Price changes trigger notifications

### Functionality
- [ ] All buttons/links work (already verified ✅)
- [ ] Job workflow progresses correctly (already verified ✅)
- [ ] Completion form submits successfully (already verified ✅)
- [ ] Earnings calculations are accurate

### Responsive Design
- [ ] Tables collapse to cards on mobile (< 640px)
- [ ] All tap targets ≥ 44×44px
- [ ] No horizontal scroll on any screen size
- [ ] Safe-area insets respected on notched devices

### Accessibility
- [ ] All interactive elements have ARIA labels
- [ ] Focus rings visible on keyboard navigation
- [ ] Modals trap focus correctly
- [ ] Color contrast meets WCAG AA
- [ ] Status updates announce to screen readers
- [ ] Lighthouse accessibility score ≥ 90

### Performance
- [ ] No console errors during normal use
- [ ] No React warnings in development
- [ ] Loading states provide feedback
- [ ] Skeleton loaders for better perceived performance

---

## Implementation Priority

### Phase 1: Critical Pricing Fixes (P0)
**Estimated:** 4-6 hours
1. Remove SERVICE_PACKAGES from TechnicianDashboard
2. Update BookingForm to use 4 services
3. Integrate dynamic pricing from pricingService
4. Add Admin pricing management UI

### Phase 2: UI Wiring & Workflow (P1)
**Estimated:** 2-3 hours
1. Verify all existing handlers (already working ✅)
2. Update earnings display logic
3. Add priceAtBooking display logic

### Phase 3: Responsive & Accessibility (P2)
**Estimated:** 6-8 hours
1. Add mobile card views for tables
2. Implement focus management
3. Add ARIA labels throughout
4. Audit and fix color contrast
5. Add notification bell component

### Phase 4: Polish & Testing (P3)
**Estimated:** 3-4 hours
1. Add skeleton loaders
2. Console audit and cleanup
3. End-to-end testing
4. Lighthouse audit

**Total Estimated Time:** 15-21 hours

---

## Risk Assessment

### Low Risk ✅
- Existing backend APIs work correctly
- Job workflow handlers properly wired
- No breaking changes to data models

### Medium Risk ⚠️
- Pricing migration from packages to services
- Ensuring backward compatibility with existing bookings
- Mobile responsive implementation complexity

### High Risk ❌
- None identified (backend is stable and working)

---

## Next Steps

1. **Review this audit** with team/stakeholder
2. **Approve implementation plan** and priority order
3. **Begin Phase 1** (Critical Pricing Fixes)
4. **Test each phase** before moving to next
5. **Final QA** against acceptance criteria

---

## Notes

- Backend is working correctly - DO NOT modify except for 2 allowed additions
- Existing handlers are properly wired - focus on UI/UX improvements
- SERVICE_PACKAGES is the main blocker - must be removed first
- Responsive design and accessibility are important but not blocking
- Price change notifications need UI implementation (backend ready)

---

**Audit Completed By:** Kiro AI  
**Review Status:** Pending approval  
**Ready for Implementation:** Yes (pending approval)
