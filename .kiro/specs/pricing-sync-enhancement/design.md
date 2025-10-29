# Pricing Sync Enhancement Design

## Overview

This design addresses critical pricing synchronization issues in the booking system by ensuring that agreed prices reflect actual service package prices, technician earnings are calculated correctly with the 10% platform commission, and admin revenue tracking accurately shows platform earnings.

## Architecture

### Current System Analysis

The current system has several pricing inconsistencies:

1. **Booking Form**: Shows hardcoded service prices (GHC 500, 150, 200, 100) that don't match SERVICE_PACKAGES
2. **Service Packages**: Defines different prices (Basic: GHC 150, Standard: GHC 350, Premium: GHC 600)
3. **Agreed Price**: Set from SERVICE_PACKAGES but booking form shows different prices
4. **Revenue Tracking**: No admin dashboard exists to track platform's 10% commission

### Target Architecture

```
Customer Booking Flow:
BookingForm → SERVICE_PACKAGES (single source) → agreedPrice → Firestore

Technician Earnings:
agreedPrice × TECHNICIAN_PAYOUT_RATE (90%) = technicianEarnings

Platform Revenue:
agreedPrice × BOOKING_PLATFORM_COMMISSION_RATE (10%) = platformCommission
```

## Components and Interfaces

### 1. Service Pricing Synchronization

**Updated Components:**
- `BookingFormRedesigned.tsx`: Update SERVICES array to use SERVICE_PACKAGES prices
- `SERVICE_PACKAGES`: Ensure this remains the single source of truth
- `bookingService.ts`: Maintain current agreedPrice logic

**Interface Updates:**
```typescript
// Update SERVICES array in BookingFormRedesigned.tsx
const SERVICES = [
  {
    type: 'installation' as ServiceType,
    title: 'AC Installation',
    description: 'Install new air conditioning units in your property.',
    price: SERVICE_PACKAGES.premium.price, // Use package pricing
    image: '...',
  },
  // ... other services mapped to appropriate packages
];
```

### 2. Admin Revenue Dashboard

**New Components:**
- `AdminDashboard.tsx`: Main admin dashboard with revenue overview
- `AdminLayout.tsx`: Layout wrapper for admin pages
- `AdminSidebar.tsx`: Navigation for admin sections
- `RevenueService.ts`: Service for calculating platform revenue

**Revenue Calculation Logic:**
```typescript
interface PlatformRevenue {
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number; // Sum of all agreedPrice for completed bookings
  platformCommission: number; // 10% of totalRevenue
  technicianPayouts: number; // 90% of totalRevenue
  monthlyRevenue: number;
  dailyRevenue: number;
}
```

### 3. Enhanced Booking Details

**Updated Components:**
- `BookingDetailsDialog.tsx`: Show both agreed price and final cost clearly
- `CustomerDashboard.tsx`: Display consistent pricing in booking cards
- `TechnicianOverview.tsx`: Show correct earnings calculations

## Data Models

### Revenue Tracking Collection

```typescript
interface RevenueRecord {
  id: string;
  bookingId: string;
  customerId: string;
  technicianId: string;
  serviceType: ServiceType;
  servicePackage: ServicePackage;
  agreedPrice: number;
  finalCost: number;
  platformCommission: number; // 10% of finalCost
  technicianPayout: number; // 90% of finalCost
  completedAt: Timestamp;
  createdAt: Timestamp;
}
```

### Updated Booking Model

The existing Booking interface already has the necessary fields:
- `agreedPrice`: Set from SERVICE_PACKAGES at booking time
- `finalCost`: Set when job is completed (may differ from agreedPrice)
- `servicePackage`: Links to SERVICE_PACKAGES for pricing

## Error Handling

### Pricing Validation

1. **Booking Creation**: Validate that agreedPrice matches selected servicePackage price
2. **Service Package Updates**: Ensure existing bookings maintain their agreedPrice
3. **Revenue Calculations**: Handle edge cases where finalCost differs from agreedPrice

### Data Consistency

1. **Migration**: Update any existing bookings with incorrect agreedPrice values
2. **Validation**: Add checks to ensure SERVICE_PACKAGES prices are used consistently
3. **Fallbacks**: Handle cases where servicePackage is missing or invalid

## Testing Strategy

### Unit Tests

1. **Service Pricing**: Test that booking form uses SERVICE_PACKAGES prices
2. **Revenue Calculations**: Test 10% commission and 90% payout calculations
3. **Price Synchronization**: Test that agreedPrice matches servicePackage price

### Integration Tests

1. **Booking Flow**: End-to-end test from service selection to price confirmation
2. **Revenue Tracking**: Test that completed bookings generate correct revenue records
3. **Admin Dashboard**: Test that revenue calculations aggregate correctly

### Manual Testing

1. **Cross-Platform Consistency**: Verify pricing shows consistently across all user roles
2. **Revenue Accuracy**: Manually verify commission calculations
3. **Historical Data**: Ensure existing bookings display correctly

## Implementation Phases

### Phase 1: Service Pricing Sync
- Update BookingFormRedesigned.tsx to use SERVICE_PACKAGES prices
- Ensure all service selection shows consistent pricing
- Test booking creation with correct agreedPrice

### Phase 2: Admin Revenue Dashboard
- Create AdminDashboard, AdminLayout, AdminSidebar components
- Implement RevenueService for platform commission calculations
- Add revenue tracking and analytics

### Phase 3: Enhanced Display
- Update BookingDetailsDialog to show pricing clearly
- Enhance customer and technician dashboards with accurate pricing
- Add revenue insights to admin dashboard

### Phase 4: Data Migration & Validation
- Migrate any existing bookings with pricing inconsistencies
- Add validation to prevent future pricing mismatches
- Implement comprehensive error handling