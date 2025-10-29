# Implementation Plan

- [x] 1. Set up project structure and shared types



  - Create types directory with booking-related TypeScript interfaces
  - Define Service, TimeSlot, BookingDraft, and Booking types
  - Create constants file for service data with images and pricing
  - Set up session storage utility functions for BookingDraft persistence
  - _Requirements: 1.6, 11.1, 11.2, 11.4_

- [x] 2. Create BookingStepper component







  - [x] 2.1 Implement stepper UI with progress line and step nodes

    - Build responsive stepper layout (desktop full labels, mobile compact)
    - Add step nodes with checkmark icons for completed steps
    - Implement active/inactive/completed state styling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  

  - [x] 2.2 Add accessibility features

    - Implement ARIA attributes (aria-label, aria-current, role="progressbar")
    - Add keyboard navigation support
    - Ensure WCAG AA contrast compliance
    - _Requirements: 2.7, 2.8, 10.2, 10.3, 10.6_

- [x] 3. Build Step 1 - Service Catalog



  - [x] 3.1 Create ServiceCard component

    - Implement card layout with image, title, description, price
    - Add "Book Service" button with hover effects
    - Implement lazy loading for service images
    - Add responsive grid layout (1/2/4 columns)
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 9.2_
  

  - [x] 3.2 Create ServiceCatalog container component

    - Implement search bar with filtering functionality
    - Build service grid with responsive breakpoints
    - Handle service selection and navigation to Step 2
    - Save selected service to BookingDraft state
    - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Build Step 2 - Date & Time Picker



  - [x] 4.1 Create Calendar component


    - Implement month view with navigation arrows
    - Disable past dates
    - Add availability indicators (dots on available dates)
    - Implement date selection with keyboard support
    - Build responsive layout (desktop two-pane, mobile stacked)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.12, 9.8_
  

  - [x] 4.2 Create TimeSlotList component

    - Display available time slots for selected date
    - Implement slot selection with visual feedback
    - Handle unavailable slots (disabled state)
    - Add smooth scroll to slots on mobile
    - _Requirements: 4.6, 4.7, 9.9_
  
  - [x] 4.3 Implement navigation and state management


    - Add Back and "Set times" buttons
    - Disable "Set times" until slot selected
    - Save date and timeSlot to BookingDraft
    - Implement step transition to Step 3
    - Preserve state on back navigation
    - _Requirements: 4.8, 4.9, 4.10, 4.11, 11.2, 11.3_

- [-] 5. Build Step 3 - Customer Details Form

  - [x] 5.1 Create CustomerDetailsForm component



    - Display selection summary banner
    - Implement form fields (name, phone, email, address, notes)
    - Add country code selector for phone field
    - Implement responsive two-column layout for phone/email
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_
  
  - [ ] 5.2 Implement form validation
    - Add real-time validation on blur
    - Display inline error messages
    - Validate required fields (name, phone, address)
    - Validate email format if provided
    - Disable Next button until form is valid
    - _Requirements: 5.10, 5.11, 5.13_
  
  - [ ] 5.3 Add navigation and state management
    - Implement Back and Next buttons
    - Auto-focus first input on mount
    - Save customer details to BookingDraft
    - Transition to Step 4 on valid submission
    - Preserve state on back navigation
    - _Requirements: 5.12, 5.14, 5.15, 5.16, 11.2, 11.3_

- [ ] 6. Build Step 4 - Booking Confirmation
  - [ ] 6.1 Create BookingConfirmation component
    - Display success header with checkmark icon
    - Show booking summary (service, date/time, customer, location)
    - Generate unique booking number (VRM#####P format)
    - Implement QR code generation with booking ID
    - Display payment note banner
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [ ] 6.2 Implement action buttons and API integration
    - Add "Back to My Bookings" and "Create another booking" buttons
    - Submit booking to API/Firebase with status "pending"
    - Handle navigation to My Bookings page
    - Reset BookingDraft for new booking
    - Clear session storage on successful submission
    - _Requirements: 6.9, 6.10, 6.11, 6.12, 6.13, 11.5, 11.6_

- [ ] 7. Create main BookServiceFlow container
  - [ ] 7.1 Implement step routing and state management
    - Set up route at /dashboard/book
    - Implement step state management (currentStep, completedSteps)
    - Handle step transitions with validation
    - Manage BookingDraft state across all steps
    - Implement session storage persistence
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 7.2 Add loading and error states
    - Implement loading indicators for API calls
    - Add error handling with toast notifications
    - Display empty states where appropriate
    - Handle network errors gracefully
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 8. Update CustomerSidebar navigation


  - Add "Book Service" entry in sidebar
  - Link to /dashboard/book route
  - Update navigation items array
  - Ensure proper active state highlighting
  - _Requirements: 1.1, 1.2_

- [x] 9. Redesign My Bookings page


  - [x] 9.1 Update CustomerDashboard/MyBookingsPage layout

    - Remove "Book Service" and "Confirmed" buttons
    - Implement list/table view for bookings
    - Display service type, date, time, status, technician
    - Add "View details" button for each booking
    - Add "Cancel" button for pending bookings
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 9.2 Implement cancel booking functionality

    - Handle cancel button click
    - Update booking status to "cancelled" via API
    - Show confirmation dialog before cancelling
    - Display success/error toast
    - _Requirements: 7.6, 7.7_

- [x] 10. Redesign BookingDetailsDialog component



  - [x] 10.1 Update dialog layout and styling

    - Implement responsive layout (centered modal desktop, full-screen mobile)
    - Mirror Step 4 confirmation design
    - Add status pill with color coding
    - Display all booking details (service, date, customer, location, booking number)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 10.2 Add technician section and actions

    - Conditionally display technician section when assigned
    - Show technician name, phone, avatar, assignedAt
    - Add Close button
    - Add "Cancel booking" button for pending status
    - Remove Sign out button if present
    - Implement cancel booking action
    - _Requirements: 8.7, 8.8, 8.9, 8.10, 8.11, 8.12_

- [ ] 11. Implement responsive design features
  - Add mobile-specific layouts for all steps
  - Implement sticky bottom action bar on mobile
  - Add swipe gestures for calendar month navigation
  - Ensure all tap targets are ≥44×44px
  - Test on common mobile devices and viewports
  - Verify above-the-fold rendering on 1280×800 desktop
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

- [ ] 12. Implement accessibility features
  - Add ARIA labels and roles to all interactive elements
  - Implement keyboard navigation for all steps
  - Add focus management on step transitions
  - Implement aria-live announcements for step changes
  - Add focus trap in dialogs
  - Ensure WCAG AA contrast ratios
  - Test with keyboard-only navigation
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.9_

- [ ] 13. Set up API integration and data persistence
  - [ ] 13.1 Create booking service API functions
    - Implement GET /api/services endpoint
    - Implement GET /api/availability endpoint
    - Implement POST /api/bookings endpoint
    - Implement GET /api/bookings endpoint
    - Implement PATCH /api/bookings/:id endpoint
    - Implement DELETE /api/bookings/:id endpoint
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ] 13.2 Integrate with Firebase/backend
    - Connect booking submission to Firebase
    - Implement real-time booking updates
    - Add error handling and retry logic
    - Implement optimistic updates for cancellation
    - _Requirements: 6.13, 7.7, 8.12, 12.2, 12.4_

- [ ] 14. Add performance optimizations
  - Implement lazy loading for service images
  - Add code splitting for step components
  - Optimize bundle size
  - Add loading skeletons for better perceived performance
  - Test and achieve Lighthouse mobile score ≥85
  - _Requirements: 1.7, 12.1, 12.2, 12.6, 12.7_

- [ ]* 15. Write tests
  - [ ]* 15.1 Write unit tests for components
    - Test BookingStepper rendering and state
    - Test ServiceCard display and interactions
    - Test DateTimePicker selection logic
    - Test CustomerDetailsForm validation
    - Test BookingConfirmation display
    - _Requirements: All component requirements_
  
  - [ ]* 15.2 Write integration tests
    - Test complete booking flow (all 4 steps)
    - Test back navigation with state preservation
    - Test validation across steps
    - Test API integration with mocks
    - Test responsive behavior
    - _Requirements: 11.2, 11.3_
  
  - [ ]* 15.3 Write E2E tests
    - Test happy path booking flow
    - Test error recovery scenarios
    - Test cancel booking functionality
    - Test keyboard navigation
    - Test mobile flow
    - _Requirements: All functional requirements_
  
  - [ ]* 15.4 Perform accessibility testing
    - Test with screen readers (NVDA/JAWS)
    - Verify keyboard navigation
    - Check color contrast compliance
    - Validate ARIA attributes
    - Test focus management
    - Run Lighthouse accessibility audit (target ≥90)
    - _Requirements: 10.1-10.9, 12.8_
