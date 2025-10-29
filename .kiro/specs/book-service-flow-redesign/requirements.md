# Requirements Document

## Introduction

This document outlines the requirements for redesigning the Book Service flow in the CoolAir platform. The redesign transforms the current booking experience into a modern, multi-step wizard that guides customers through service selection, date/time scheduling, detail entry, and confirmation. The flow will be accessible from the customer dashboard sidebar and will provide a seamless, accessible experience across mobile and desktop devices.

## Glossary

- **BookingSystem**: The complete service booking functionality within the CoolAir platform
- **ServiceCatalog**: The grid display of available AC services (Installation, Maintenance, Repair, Inspection)
- **BookingStepper**: The 4-step progress indicator showing Service → Select Date → Details → Done
- **BookingDraft**: The temporary state object that persists customer selections across steps
- **TimeSlotPicker**: The calendar and time selection interface in Step 2
- **CustomerDetailsForm**: The form for collecting customer information in Step 3
- **BookingConfirmation**: The success screen displayed in Step 4
- **MyBookingsPage**: The customer dashboard page displaying all bookings in a list/table format
- **BookingDetailsDialog**: The modal dialog showing complete booking information
- **CustomerDashboard**: The main dashboard interface for customers with sidebar navigation

## Requirements

### Requirement 1: Service Catalog Display

**User Story:** As a customer, I want to browse available AC services with images and pricing, so that I can choose the service I need.

#### Acceptance Criteria

1. WHEN THE CustomerDashboard loads, THE BookingSystem SHALL display a "Book Service" entry in the sidebar navigation
2. WHEN the customer clicks "Book Service", THE BookingSystem SHALL navigate to the ServiceCatalog at /dashboard/book
3. THE ServiceCatalog SHALL display a search field with placeholder text "Search for a service (e.g., AC repair)"
4. THE ServiceCatalog SHALL display four service cards in a responsive grid (1 column on mobile, 2 columns on tablet, 2×2 on desktop)
5. WHERE a service card is displayed, THE ServiceCatalog SHALL show the service image, title, description, starting price in GHC, and a "Book Service" button
6. THE ServiceCatalog SHALL use the following service data:
   - AC Installation: From GHC500.00 with specified image URL
   - AC Maintenance: From GHC150.00 with specified image URL
   - AC Repair: From GHC200.00 with specified image URL
   - AC Inspection: From GHC100.00 with specified image URL
7. THE ServiceCatalog SHALL load images with lazy loading and meaningful alt text

### Requirement 2: Booking Stepper Navigation

**User Story:** As a customer, I want to see my progress through the booking process, so that I know what steps remain.

#### Acceptance Criteria

1. WHEN the customer enters the booking flow, THE BookingStepper SHALL display at the top of the content area
2. THE BookingStepper SHALL show four labeled steps: "Service", "Select Date", "Details", "Done"
3. THE BookingStepper SHALL display a progress line connecting all step nodes
4. WHEN a step is completed, THE BookingStepper SHALL display a checkmark icon on that step node
5. WHEN a step is active, THE BookingStepper SHALL highlight that step with emphasis styling
6. WHEN a step is not yet reached, THE BookingStepper SHALL display that step in a muted state
7. WHERE the viewport is mobile (≤640px), THE BookingStepper SHALL display compact labels with "Step X of 4" format
8. THE BookingStepper SHALL remain sticky at the top of the viewport on mobile devices

### Requirement 3: Step 1 - Service Selection

**User Story:** As a customer, I want to select a service from the catalog, so that I can proceed to schedule an appointment.

#### Acceptance Criteria

1. WHEN Step 1 is active, THE BookingSystem SHALL display the ServiceCatalog with search and service cards
2. WHEN the customer clicks a "Book Service" button on any service card, THE BookingSystem SHALL save the selected service to BookingDraft.service
3. WHEN a service is selected, THE BookingSystem SHALL automatically advance to Step 2
4. THE BookingSystem SHALL persist the selected service data including id, name, priceFrom, and imageUrl
5. WHEN the customer uses the search field, THE BookingSystem SHALL filter displayed services in real-time

### Requirement 4: Step 2 - Date and Time Selection

**User Story:** As a customer, I want to select a date and time for my service appointment, so that I can schedule at my convenience.

#### Acceptance Criteria

1. WHEN Step 2 is active, THE TimeSlotPicker SHALL display a calendar and available time slots
2. WHERE the viewport is desktop (>1024px), THE TimeSlotPicker SHALL display a two-pane layout with calendar on the left and time slots on the right
3. WHERE the viewport is mobile (≤640px), THE TimeSlotPicker SHALL display the calendar full-width on top and time slots below
4. THE TimeSlotPicker SHALL disable all dates in the past
5. THE TimeSlotPicker SHALL display a dot or badge indicator on dates with available time slots
6. WHEN the customer selects a date, THE TimeSlotPicker SHALL display available time slots for that date
7. WHEN the customer selects a time slot, THE TimeSlotPicker SHALL highlight the selected slot
8. THE TimeSlotPicker SHALL display "Back" and "Set times" buttons at the bottom
9. WHEN no time slot is selected, THE TimeSlotPicker SHALL disable the "Set times" button
10. WHEN the customer clicks "Set times" with a valid selection, THE BookingSystem SHALL save the date and timeSlot to BookingDraft and advance to Step 3
11. WHEN the customer clicks "Back", THE BookingSystem SHALL return to Step 1 and preserve BookingDraft state
12. THE TimeSlotPicker SHALL support keyboard navigation with arrow keys for date selection

### Requirement 5: Step 3 - Customer Details Entry

**User Story:** As a customer, I want to provide my contact and location details, so that the technician can reach me and find my location.

#### Acceptance Criteria

1. WHEN Step 3 is active, THE CustomerDetailsForm SHALL display a summary of selected service, date, and time
2. THE CustomerDetailsForm SHALL display the text "You selected {Service} on {Date} at {Time}. Provide your details to proceed."
3. THE CustomerDetailsForm SHALL display a "Full name" field marked as required
4. THE CustomerDetailsForm SHALL display a "Phone" field with country code selector marked as required
5. THE CustomerDetailsForm SHALL display an "Email" field marked as optional with email validation
6. THE CustomerDetailsForm SHALL display an "Address/Location" field marked as required
7. THE CustomerDetailsForm SHALL display a "Notes" textarea marked as optional
8. WHERE the viewport is desktop (>640px), THE CustomerDetailsForm SHALL arrange phone and email fields in a two-column layout
9. THE CustomerDetailsForm SHALL use appropriate input types (tel for phone, email for email)
10. WHEN a required field is empty, THE CustomerDetailsForm SHALL display an inline validation message
11. WHEN the email field contains invalid data, THE CustomerDetailsForm SHALL display an email validation message
12. THE CustomerDetailsForm SHALL display "Back" and "Next" buttons at the bottom
13. WHEN required fields are invalid, THE CustomerDetailsForm SHALL disable the "Next" button
14. WHEN the customer clicks "Next" with valid data, THE BookingSystem SHALL save customer details to BookingDraft.customer and advance to Step 4
15. WHEN the customer clicks "Back", THE BookingSystem SHALL return to Step 2 and preserve BookingDraft state
16. WHEN Step 3 loads, THE CustomerDetailsForm SHALL auto-focus the first input field

### Requirement 6: Step 4 - Booking Confirmation

**User Story:** As a customer, I want to see confirmation of my booking with all details, so that I have a record of my appointment.

#### Acceptance Criteria

1. WHEN Step 4 is active, THE BookingConfirmation SHALL display "Booking confirmed!" heading with a success icon
2. THE BookingConfirmation SHALL display the selected service name
3. THE BookingConfirmation SHALL display the selected date and time
4. THE BookingConfirmation SHALL display the customer name and contact information
5. THE BookingConfirmation SHALL display the service location address
6. THE BookingConfirmation SHALL generate and display a unique booking number (format: VRM#####P)
7. THE BookingConfirmation SHALL display a QR code containing the booking ID
8. THE BookingConfirmation SHALL display the note "All payments are made outside the website, payment is made when you arrive at the location"
9. THE BookingConfirmation SHALL display a "Back to My Bookings" primary button
10. THE BookingConfirmation SHALL display a "Create another booking" secondary button
11. WHEN the customer clicks "Back to My Bookings", THE BookingSystem SHALL navigate to the MyBookingsPage
12. WHEN the customer clicks "Create another booking", THE BookingSystem SHALL reset BookingDraft and return to Step 1
13. WHEN Step 4 loads, THE BookingSystem SHALL persist the booking to the database with status "pending"

### Requirement 7: My Bookings Page Redesign

**User Story:** As a customer, I want to view all my bookings in a clean list, so that I can track my service appointments.

#### Acceptance Criteria

1. THE MyBookingsPage SHALL display bookings in a list or table format
2. THE MyBookingsPage SHALL NOT display "Book Service" or "Confirmed" buttons
3. WHERE a booking is displayed, THE MyBookingsPage SHALL show service type, date, time, status, and assigned technician (if any)
4. THE MyBookingsPage SHALL display a "View details" button for each booking
5. WHERE a booking has status "pending", THE MyBookingsPage SHALL display a "Cancel" button
6. WHEN the customer clicks "View details", THE BookingSystem SHALL open the BookingDetailsDialog
7. WHEN the customer clicks "Cancel" on a pending booking, THE BookingSystem SHALL update the booking status to "cancelled"

### Requirement 8: Booking Details Dialog Redesign

**User Story:** As a customer, I want to view complete details of a booking in a dialog, so that I can review all information without leaving the page.

#### Acceptance Criteria

1. WHEN the BookingDetailsDialog opens, THE BookingSystem SHALL display the dialog centered on desktop (640-720px width)
2. WHERE the viewport is mobile (≤640px), THE BookingDetailsDialog SHALL display as a full-screen sheet
3. THE BookingDetailsDialog SHALL mirror the Step 4 confirmation layout and styling
4. THE BookingDetailsDialog SHALL display a status pill showing "Pending", "Confirmed", "Completed", or "Cancelled"
5. THE BookingDetailsDialog SHALL display service name, date, time, customer details, and location
6. THE BookingDetailsDialog SHALL display the booking number
7. WHERE a technician is assigned, THE BookingDetailsDialog SHALL display a "Technician" section with name, phone, and assignedAt timestamp
8. WHERE a technician has an avatar, THE BookingDetailsDialog SHALL display the technician avatar image
9. THE BookingDetailsDialog SHALL display a "Close" button
10. WHERE the booking status is "pending", THE BookingDetailsDialog SHALL display a "Cancel booking" button
11. THE BookingDetailsDialog SHALL NOT display a "Sign out" button
12. WHEN the customer clicks "Cancel booking", THE BookingSystem SHALL update the booking status to "cancelled" and close the dialog

### Requirement 9: Responsive Design and Mobile Support

**User Story:** As a customer using a mobile device, I want the booking flow to work smoothly on my phone, so that I can book services on the go.

#### Acceptance Criteria

1. THE BookingSystem SHALL use responsive breakpoints: sm ≤640px, md 641-1024px, lg 1025-1440px, xl ≥1441px
2. THE BookingSystem SHALL use container max widths: sm 100%, md 720px, lg 1080px, xl 1200px
3. WHERE the viewport is mobile, THE BookingStepper SHALL display compact with icons and "Step X of 4" labels
4. WHERE the viewport is mobile, THE BookingSystem SHALL display a sticky bottom action bar for navigation buttons
5. THE BookingSystem SHALL ensure all tap targets are at least 44×44 pixels
6. THE BookingSystem SHALL fit each step above the fold on 1280×800 desktop and common mobile devices
7. THE BookingSystem SHALL allow sticky header/footer for navigation without requiring page scrolling
8. WHERE the viewport is mobile, THE TimeSlotPicker SHALL support swipe gestures for month navigation
9. WHEN a date is selected on mobile, THE TimeSlotPicker SHALL smooth scroll to the time slots section

### Requirement 10: Accessibility and Keyboard Navigation

**User Story:** As a customer using keyboard navigation, I want to complete the booking flow without a mouse, so that I can access the service regardless of my input method.

#### Acceptance Criteria

1. THE BookingSystem SHALL support full keyboard navigation through all steps
2. THE BookingSystem SHALL provide visible focus indicators on all interactive elements
3. THE BookingSystem SHALL announce step changes via aria-live="polite" regions
4. THE TimeSlotPicker SHALL support arrow key navigation for date selection
5. THE TimeSlotPicker SHALL support Enter key to select dates and time slots
6. THE BookingSystem SHALL maintain WCAG AA contrast ratios for all text and interactive elements
7. THE BookingSystem SHALL provide meaningful labels for all form inputs
8. THE BookingSystem SHALL achieve Lighthouse accessibility score ≥90
9. WHEN a step transition occurs, THE BookingSystem SHALL manage focus to the first interactive element

### Requirement 11: Data Persistence and State Management

**User Story:** As a customer, I want my selections to be preserved when I navigate back, so that I don't have to re-enter information.

#### Acceptance Criteria

1. THE BookingSystem SHALL maintain a single BookingDraft state object throughout the flow
2. WHEN the customer navigates backward, THE BookingSystem SHALL preserve all previously entered data in BookingDraft
3. WHEN the customer navigates forward, THE BookingSystem SHALL validate and save data to BookingDraft before advancing
4. THE BookingSystem SHALL persist BookingDraft to session storage to survive page refreshes
5. WHEN Step 4 completes successfully, THE BookingSystem SHALL clear BookingDraft from session storage
6. WHEN the customer creates another booking, THE BookingSystem SHALL reset BookingDraft to an empty state

### Requirement 12: Performance and Loading States

**User Story:** As a customer, I want the booking flow to load quickly and show feedback during operations, so that I know the system is working.

#### Acceptance Criteria

1. THE BookingSystem SHALL achieve Lighthouse mobile performance score ≥85
2. THE BookingSystem SHALL display loading indicators during API calls
3. THE BookingSystem SHALL display empty states when no data is available
4. THE BookingSystem SHALL display error messages when operations fail
5. THE BookingSystem SHALL show toast notifications for success and error events
6. THE BookingSystem SHALL load service images with lazy loading
7. WHEN submitting the booking in Step 4, THE BookingSystem SHALL display a loading state on the submit action
