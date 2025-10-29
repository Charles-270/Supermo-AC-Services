# Pricing Sync Enhancement Requirements

## Introduction

This feature addresses critical pricing synchronization issues between the booking system, service pricing, and revenue tracking. The system currently shows inconsistent pricing across customer bookings and technician earnings, and the admin dashboard lacks proper platform revenue tracking with the 10% commission structure.

## Glossary

- **Booking System**: The customer-facing interface for scheduling services
- **Service Package**: Predefined service offerings with set pricing
- **Agreed Price**: The price confirmed during booking that should match service package pricing
- **Platform Commission**: 10% fee retained by the platform from each completed booking
- **Revenue Tracking**: Admin dashboard system for monitoring platform earnings
- **Pricing Sync**: Ensuring consistent pricing across all system components

## Requirements

### Requirement 1

**User Story:** As a customer, I want the agreed price in my booking to match the service price shown during booking, so that there are no pricing discrepancies.

#### Acceptance Criteria

1. WHEN a customer selects a service during booking, THE Booking System SHALL display the current service package price
2. WHEN a booking is confirmed, THE Booking System SHALL set the agreed price equal to the selected service package price
3. WHEN a customer views booking details, THE Booking System SHALL show consistent pricing between booking confirmation and service selection
4. THE Booking System SHALL prevent price mismatches between service packages and agreed booking prices

### Requirement 2

**User Story:** As a technician, I want to see accurate earnings that reflect the actual service prices minus platform commission, so that I can track my income correctly.

#### Acceptance Criteria

1. WHEN a technician completes a job, THE Booking System SHALL calculate earnings as 90% of the agreed service price
2. WHEN a technician views earnings, THE Booking System SHALL display the correct amount after platform commission deduction
3. THE Booking System SHALL maintain consistent pricing between customer bookings and technician earnings calculations
4. WHEN earnings are calculated, THE Booking System SHALL use the agreed price from the original booking

### Requirement 3

**User Story:** As an admin, I want to see platform revenue that accurately reflects the 10% commission from all completed bookings, so that I can monitor business performance.

#### Acceptance Criteria

1. WHEN a booking is completed, THE Revenue Tracking SHALL record 10% of the agreed price as platform commission
2. WHEN an admin views the dashboard, THE Revenue Tracking SHALL display total platform earnings from commissions
3. THE Revenue Tracking SHALL calculate revenue based on actual completed bookings with agreed prices
4. WHEN revenue is displayed, THE Revenue Tracking SHALL show both gross booking value and platform commission separately

### Requirement 4

**User Story:** As a system administrator, I want service packages to be the single source of truth for pricing, so that all pricing calculations are consistent across the platform.

#### Acceptance Criteria

1. THE Booking System SHALL use current service package prices for all new bookings
2. WHEN service package prices are updated, THE Booking System SHALL use updated prices for new bookings only
3. THE Booking System SHALL maintain historical agreed prices for existing bookings
4. WHEN calculating any pricing, THE Booking System SHALL reference the appropriate service package or agreed price based on booking status