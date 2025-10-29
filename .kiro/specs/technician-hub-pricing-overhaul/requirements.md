# Requirements Document

## Introduction

This specification defines the comprehensive overhaul of the Technician Hub and the platform's pricing system. The feature addresses critical functionality issues in the current Technician Dashboard, implements a unified Service Catalog pricing model, and redesigns the Technician Hub interface using the established Supplier Dashboard visual language. The system will replace the legacy SERVICE_PACKAGES model with a centralized, admin-controlled pricing structure that automatically propagates to customer bookings, technician earnings (90% split), and platform revenue (10% split).

## Glossary

- **Technician Hub**: The web and mobile interface used by technicians to manage jobs, view earnings, and receive notifications
- **Service Catalog**: The canonical, version-controlled pricing model containing Installation, Maintenance, Repair, and Inspection services
- **Admin Settings**: The administrative interface where platform administrators manage service pricing
- **Booking System**: The customer-facing appointment booking interface
- **SERVICE_PACKAGES**: Legacy pricing model (Standard/Premium/Basic) being replaced
- **priceAtBooking**: Immutable price snapshot captured when a booking is created
- **changeId**: Unique identifier for a pricing update event used for one-time notifications
- **TechnicianEarning**: Ledger entry recording a technician's 90% share of a completed job
- **PlatformRevenue**: Ledger entry recording the platform's 10% share of a completed job

## Requirements

### Requirement 1: Technician Dashboard Audit and Fixes

**User Story:** As a platform administrator, I want a comprehensive audit of the current Technician Dashboard functionality issues, so that I can understand what needs to be fixed before implementing the redesign.

#### Acceptance Criteria

1. WHEN the audit is initiated, THE System SHALL produce a written report categorizing issues as P0 (critical), P1 (high priority), or P2 (medium priority)
2. THE Audit Report SHALL identify all non-functional navigation elements, buttons, links, and menus with their expected behaviors
3. THE Audit Report SHALL document the complete jobs workflow (Assign/Accept/Start/Complete/Upload/Notes) and identify broken or missing functionality
4. THE Audit Report SHALL analyze the earnings view and identify all locations where SERVICE_PACKAGES pricing is used instead of Service Catalog pricing
5. THE Audit Report SHALL document responsive design issues including overflows, focus traps, tap targets below 44px, and WCAG AA contrast violations
6. THE Audit Report SHALL summarize UI-related console warnings and map them to specific fixes

### Requirement 2: Technician Hub Overview Screen

**User Story:** As a technician, I want a dashboard overview showing my jobs, schedule, and earnings at a glance, so that I can quickly understand my workload and financial status.

#### Acceptance Criteria

1. THE Technician Hub Overview SHALL display today's jobs in a list or kanban view with statuses: New, In Progress, Completed
2. THE Technician Hub Overview SHALL display a mini schedule showing jobs for the next 7 days
3. THE Technician Hub Overview SHALL display an earnings snapshot with three values: This week, This month, and Pending payout
4. THE Technician Hub Overview SHALL display alerts for new assignments, reschedule requests, and customer updates
5. WHEN a technician interacts with a job row, THE System SHALL provide actions: View, Start, Upload photos, Add notes, Complete
6. THE Technician Hub Overview SHALL use the Supplier Dashboard visual language including cards, soft shadows, rounded-xl corners, Inter font, and WCAG AA contrast

### Requirement 3: Jobs List and Job Details

**User Story:** As a technician, I want to view detailed information about each job and manage its status, so that I can complete my work efficiently and keep customers informed.

#### Acceptance Criteria

1. THE Job Details view SHALL display service type, scheduled date and time slot, customer name, customer phone, customer address, notes, and price from Service Catalog
2. THE Job Details view SHALL display a map link to the customer address when available
3. THE Job Status flow SHALL support transitions: Assigned → Accepted → In Progress → Completed
4. WHEN a technician completes a job, THE System SHALL present a completion form requiring work summary, photos (up to a configurable limit), optional parts used, and a toggle for "customer present"
5. WHEN a job is marked complete, THE System SHALL record earnings as price × 0.9, admin revenue as price × 0.1, and send a notification to the customer
6. THE Jobs List SHALL be responsive with mobile-first design and desktop optimization

### Requirement 4: Technician Earnings View

**User Story:** As a technician, I want to view my earnings breakdown and payment status, so that I can track my income and understand my compensation.

#### Acceptance Criteria

1. THE Earnings View SHALL display summary cards showing: This month, Last month, Lifetime, and Pending payout totals
2. THE Earnings View SHALL display a breakdown table with columns: Date, Booking ID, Service, Price, Tech share (90%), Status (pending/paid), and Actions
3. THE Earnings View SHALL provide filters for date range, payment status, and service type
4. THE Earnings View SHALL derive all earnings data from Service Catalog prices and SHALL NOT display or reference SERVICE_PACKAGES
5. THE Earnings View SHALL provide a download receipt action for each completed job
6. THE Earnings View SHALL be responsive with tables converting to cards on mobile devices

### Requirement 5: Technician Notifications

**User Story:** As a technician, I want to receive notifications about job assignments, schedule changes, and pricing updates, so that I stay informed about important events.

#### Acceptance Criteria

1. THE Technician Hub SHALL display a bell icon with a notification count indicator
2. WHEN a technician clicks the bell icon, THE System SHALL display a list of notifications including new assignments, schedule changes, and price policy updates
3. WHEN a price change occurs, THE System SHALL send a one-time notification to each active technician with message "Service pricing updated: see details" and a link to the Pricing page
4. THE System SHALL track delivered notifications by changeId and userId to ensure each notification is delivered exactly once per user
5. THE Notification list SHALL be accessible via keyboard navigation and screen readers

### Requirement 6: Customer Booking Interface Updates

**User Story:** As a customer, I want to see current service prices from the Service Catalog when booking, so that I understand the cost before confirming my appointment.

#### Acceptance Criteria

1. THE Book Appointment page SHALL display services from the Service Catalog: Installation, Maintenance, Repair, and Inspection
2. THE Book Appointment page SHALL display current prices from the active Service Catalog entries
3. WHEN a booking is created, THE System SHALL capture priceAtBooking as a snapshot from the current Service Catalog price
4. THE Booking details view SHALL display the service type, scheduled time, agreed price (priceAtBooking), and status
5. THE Book Appointment page SHALL NOT display or reference SERVICE_PACKAGES

### Requirement 7: Service Catalog Data Model

**User Story:** As a platform administrator, I want a canonical, version-controlled pricing model, so that all platform components use consistent pricing and historical prices are preserved.

#### Acceptance Criteria

1. THE Service Catalog SHALL store entries with fields: code (installation/maintenance/repair/inspection), name, basePrice, currency (GHS), effectiveFrom, effectiveTo, isActive, updatedBy, updatedAt, and changeId
2. THE System SHALL enforce that only one active Service Catalog entry exists per service code at any time
3. WHEN a Service Catalog entry is updated, THE System SHALL create a new version with a new effectiveFrom date and set effectiveTo on the previous version
4. THE System SHALL generate a unique changeId (UUID) for each pricing update operation
5. THE System SHALL provide a read model that returns the current active price as the latest active record per service code
6. THE System SHALL backfill existing bookings with priceAtBooking values if missing

### Requirement 8: Booking Price Snapshot

**User Story:** As a customer, I want my booking price to remain fixed at the time of booking, so that future price changes do not affect my confirmed appointment.

#### Acceptance Criteria

1. THE Booking model SHALL include fields: serviceCode, priceAtBooking, and currency
2. WHEN a booking is created, THE System SHALL capture priceAtBooking from the current active Service Catalog entry for the selected serviceCode
3. THE System SHALL NOT recalculate priceAtBooking when Service Catalog prices change after booking creation
4. THE Booking details view SHALL display priceAtBooking as the agreed price

### Requirement 9: Earnings and Revenue Ledger

**User Story:** As a platform administrator, I want automatic calculation and recording of technician earnings and platform revenue when jobs complete, so that financial tracking is accurate and transparent.

#### Acceptance Criteria

1. WHEN a job is marked complete, THE System SHALL calculate techShare as priceAtBooking × 0.90 and platformRev as priceAtBooking × 0.10
2. WHEN a job is marked complete, THE System SHALL create a TechnicianEarning entry with fields: bookingId, technicianId, serviceCode, priceAtBooking, techShare, rate (0.90), status (pending/paid), createdAt, updatedAt
3. WHEN a job is marked complete, THE System SHALL create a PlatformRevenue entry with fields: bookingId, serviceCode, priceAtBooking, platformShare, rate (0.10), createdAt
4. THE System SHALL NOT recalculate historical TechnicianEarning or PlatformRevenue entries when Service Catalog prices change
5. THE System SHALL only apply new Service Catalog prices to future bookings created after the price change

### Requirement 10: Admin Service Pricing Interface

**User Story:** As a platform administrator, I want to edit service prices through an admin interface, so that I can adjust pricing as business needs change.

#### Acceptance Criteria

1. THE Admin Settings SHALL include a "Service Pricing" section displaying one row per service: Installation, Maintenance, Repair, Inspection
2. THE Service Pricing interface SHALL provide editable price input fields with currency GHS
3. WHEN an administrator saves price changes, THE System SHALL create new Service Catalog versions for each changed service code
4. WHEN an administrator saves price changes, THE System SHALL generate a single changeId for all changes in that save operation
5. THE Service Pricing interface SHALL display an audit trail showing last updated date, updated by user, and timestamp
6. THE Service Pricing interface SHALL be accessible only to users with administrator role

### Requirement 11: Price Change Notifications

**User Story:** As a customer with a pending booking, I want to be notified when service prices change, so that I understand the pricing policy while knowing my booking price remains unchanged.

#### Acceptance Criteria

1. WHEN an administrator saves new Service Catalog prices, THE System SHALL emit notifications with the generated changeId
2. THE System SHALL send notifications to all active technicians with message "Service pricing updated: see details" and a link to the Pricing page
3. THE System SHALL send notifications to all customers with pending or future bookings with message "Heads up—service prices changed on {date}. Your existing booking remains at {priceAtBooking}."
4. THE System SHALL store a PriceChangeNotification entry with fields: changeId, userId, deliveredAt
5. THE System SHALL ensure each user receives exactly one notification per changeId by checking for existing PriceChangeNotification entries before sending

### Requirement 12: API Endpoints

**User Story:** As a frontend developer, I want well-defined API endpoints for catalog, bookings, earnings, and admin pricing, so that I can build the user interfaces efficiently.

#### Acceptance Criteria

1. THE System SHALL provide GET /api/catalog/services endpoint returning current active services and prices
2. THE System SHALL provide GET /api/bookings/:id endpoint returning booking details including serviceCode and priceAtBooking
3. THE System SHALL provide GET /api/technicians/:id/earnings endpoint with query parameters: from, to, status, service, returning earnings list and totals
4. THE System SHALL provide GET /api/admin/pricing endpoint returning latest active Service Catalog records
5. THE System SHALL provide POST /api/admin/pricing endpoint accepting { items: [{ code, basePrice }] } and returning { changeId }
6. WHEN a booking is created, THE System SHALL set priceAtBooking from Service Catalog by serviceCode
7. WHEN a booking is completed, THE System SHALL create TechnicianEarning and PlatformRevenue entries
8. WHEN admin pricing is updated via POST /api/admin/pricing, THE System SHALL enqueue one-time notifications by changeId

### Requirement 13: Responsive Design and Accessibility

**User Story:** As a technician using a mobile device, I want the Technician Hub to work seamlessly on my phone, so that I can manage jobs while in the field.

#### Acceptance Criteria

1. THE Technician Hub SHALL implement responsive breakpoints: sm ≤ 640px, md 641-1024px, lg 1025-1440px, xl ≥ 1441px
2. WHEN viewed on small screens (sm), THE System SHALL convert tables to card layouts
3. WHEN viewed on small screens (sm), THE System SHALL provide action overflow menus for job actions
4. WHEN viewed on small screens (sm), THE System SHALL display a sticky bottom action bar where helpful
5. THE Technician Hub SHALL support keyboard navigation with logical tab order, ESC to close modals, and arrow keys in menus
6. THE Technician Hub SHALL use aria-live="polite" for status toast notifications
7. THE Technician Hub SHALL ensure all interactive elements have tap targets of at least 44×44 pixels
8. THE Technician Hub SHALL meet WCAG AA contrast requirements for all text and interactive elements
9. THE Technician Hub SHALL achieve a Lighthouse accessibility score of at least 90

### Requirement 14: Backward Compatibility

**User Story:** As a platform administrator, I want the new pricing system to coexist with existing functionality, so that the migration is smooth and non-disruptive.

#### Acceptance Criteria

1. THE System SHALL maintain existing API endpoints and ensure they continue to function during and after migration
2. THE System SHALL use additive fields only when extending existing data models
3. THE System SHALL NOT break existing booking, earnings, or revenue queries during migration
4. THE System SHALL provide migration notes documenting all data model changes and API updates
5. THE System SHALL provide a manual test checklist covering all critical user flows
