# Pricing Sync Enhancement Implementation Plan

- [x] 1. Fix service pricing synchronization in booking form

  - [x] 1.1 Update BookingFormRedesigned.tsx service prices


    - Modify SERVICES array to use SERVICE_PACKAGES prices instead of hardcoded values
    - Map installation service to premium package (GHC 600)
    - Map maintenance service to basic package (GHC 150) 
    - Map repair service to standard package (GHC 350)
    - Map inspection service to basic package (GHC 150)
    - _Requirements: 1.1, 1.2, 4.1, 4.2_



  - [ ] 1.2 Validate booking creation uses correct pricing
    - Test that agreedPrice in bookingService.ts matches SERVICE_PACKAGES prices

    - Verify booking confirmation shows consistent pricing



    - Ensure service selection and final price match throughout booking flow
    - _Requirements: 1.1, 1.3, 4.3_

- [x] 2. Create admin revenue dashboard infrastructure


  - [ ] 2.1 Build AdminLayout and AdminSidebar components
    - Create AdminLayout.tsx with responsive sidebar layout
    - Build AdminSidebar.tsx with navigation for Dashboard, Revenue, Users, Settings
    - Implement responsive design matching existing dashboard patterns
    - Add admin role-based access control


    - _Requirements: 3.1, 3.2_

  - [ ] 2.2 Create RevenueService for platform commission calculations
    - Write revenueService.ts with functions to calculate platform revenue
    - Implement getPlatformRevenue() to aggregate 10% commission from completed bookings
    - Add getRevenueByDateRange() for time-based revenue analysis
    - Create calculateCommissionBreakdown() for detailed revenue insights
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ] 2.3 Build AdminDashboard with revenue overview
    - Create AdminDashboard.tsx with revenue metrics cards
    - Display total platform commission (10% of completed bookings)
    - Show technician payouts (90% of completed bookings)
    - Add monthly and daily revenue trends
    - Include booking completion statistics
    - _Requirements: 3.1, 3.2, 3.4_

- [ ] 3. Enhance pricing display across user interfaces
  - [ ] 3.1 Update BookingDetailsDialog pricing display
    - Ensure agreed price and final cost are clearly differentiated
    - Show platform commission and technician payout when relevant
    - Display pricing breakdown for completed bookings
    - Add clear labels for original vs final pricing
    - _Requirements: 1.3, 2.3_

  - [ ] 3.2 Fix CustomerDashboard booking card pricing
    - Update booking cards to show agreed price from SERVICE_PACKAGES

    - Ensure pricing consistency between booking creation and dashboard display


    - Add price comparison when final cost differs from agreed price
    - Display service package information with pricing
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.3 Update technician earnings calculations


    - Verify TechnicianOverview.tsx shows correct 90% earnings
    - Update JobComplete.tsx to use agreed price for final calculations
    - Ensure EarningsHistory.tsx displays accurate commission-adjusted earnings
    - Fix any discrepancies in technician payout calculations


    - _Requirements: 2.1, 2.2, 2.4_



- [ ] 4. Add admin routing and authentication
  - [ ] 4.1 Update App.tsx with admin routes
    - Add admin dashboard routes with role-based protection
    - Implement admin layout wrapper for admin pages


    - Add navigation between admin sections
    - Ensure proper authentication checks for admin access
    - _Requirements: 3.1, 3.2_

  - [ ] 4.2 Create admin authentication flow
    - Update AuthDialog.tsx to handle admin login
    - Add admin role verification in auth service
    - Implement admin-specific navigation and permissions
    - Add admin portal access from landing page
    - _Requirements: 3.1, 3.2_

- [ ] 5. Implement revenue tracking and analytics
  - [ ] 5.1 Add revenue calculation to booking completion
    - Update completeBooking() in bookingService.ts to track revenue
    - Calculate and store platform commission (10%) when booking completes
    - Record technician payout (90%) for earnings tracking
    - Ensure revenue data is stored for admin analytics
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ] 5.2 Build revenue analytics components
    - Create RevenueChart.tsx for visual revenue trends
    - Add CommissionBreakdown.tsx for detailed commission analysis
    - Implement date range filtering for revenue reports
    - Add export functionality for revenue data
    - _Requirements: 3.2, 3.4_

- [ ] 6. Data validation and error handling
  - [ ] 6.1 Add pricing validation to booking system
    - Validate that agreedPrice matches selected servicePackage price
    - Add error handling for pricing mismatches during booking creation
    - Implement fallback pricing when servicePackage is invalid
    - Add logging for pricing inconsistencies
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 6.2 Implement revenue calculation error handling
    - Add error handling for missing or invalid booking data in revenue calculations
    - Handle edge cases where finalCost differs significantly from agreedPrice
    - Implement data validation for commission calculations
    - Add retry mechanisms for failed revenue tracking operations
    - _Requirements: 3.3, 3.4_

- [ ] 7. Testing and validation
  - [ ] 7.1 Test end-to-end pricing consistency
    - Verify pricing shows consistently from booking form to completion
    - Test that agreed prices match SERVICE_PACKAGES throughout the flow
    - Validate technician earnings calculations are accurate
    - Ensure admin revenue tracking reflects actual completed bookings
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [ ] 7.2 Validate admin dashboard functionality
    - Test admin authentication and role-based access
    - Verify revenue calculations aggregate correctly
    - Test date range filtering and analytics features
    - Ensure admin dashboard loads and displays data accurately
    - _Requirements: 3.1, 3.2, 3.4_