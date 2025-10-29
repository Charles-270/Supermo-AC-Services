# Requirements Document

## Introduction

This specification defines the UI-only redesign of the Shop Products, Cart/Checkout, My Orders, and Admin Catalog sections within the customer dashboard. The redesign focuses on modernizing the visual presentation, improving responsive behavior across devices, and ensuring visual consistency with the recently redesigned Book Service flow. All existing backend endpoints, business logic, data structures, and event handlers remain unchanged.

## Glossary

- **Shop Products Page**: The customer-facing product catalog interface where users browse, search, filter, and add items to cart
- **Filter Rail**: The left sidebar panel containing category, price, rating, and other filter controls
- **Product Card**: A visual component displaying product image, title, description, price, rating, and add-to-cart action
- **Cart Flow**: The multi-step checkout process including cart review, delivery/address, payment, and order confirmation
- **My Orders Page**: The customer interface displaying order history with list view and detail dialog
- **Order Details Dialog**: A modal overlay showing comprehensive information about a specific order
- **Admin Catalog**: The supplier/admin interface for managing product listings
- **Dashboard Shell**: The persistent layout container with left sidebar navigation that wraps all customer dashboard pages
- **Active Filter Chips**: Visual indicators showing currently applied filters with remove capability
- **Responsive Breakpoints**: Mobile (≤640px), Tablet (641–1024px), Desktop (≥1025px)

## Requirements

### Requirement 1

**User Story:** As a customer browsing products, I want a modern, responsive shop interface that works seamlessly on mobile, tablet, and desktop devices, so that I can easily find and purchase products regardless of my device.

#### Acceptance Criteria

1. WHEN the Shop Products Page renders, THE System SHALL display the page within the Dashboard Shell with the left sidebar visible
2. WHILE viewing on desktop (≥1025px), THE System SHALL display a two-pane layout with a sticky left Filter Rail and a right Results Grid
3. WHILE viewing on mobile (≤640px), THE System SHALL display a single-column layout with a Filters button that opens a full-height filter sheet
4. WHEN a user applies any filter, THE System SHALL display Active Filter Chips beneath the search bar with individual remove actions
5. THE System SHALL maintain all existing route paths, query parameters, and event handlers without modification

### Requirement 2

**User Story:** As a customer searching for products, I want to see product information in visually appealing cards with clear imagery, pricing, and ratings, so that I can quickly evaluate products and make purchase decisions.

#### Acceptance Criteria

1. THE System SHALL render each product as a Product Card with rounded-xl styling, shadow, and white background
2. WHEN displaying a Product Card, THE System SHALL include product image, badge(s), title (two-line clamp), description (two-line clamp), rating with count, price with compare/strike-through if available, and add-to-cart action
3. WHILE hovering over a Product Card on desktop, THE System SHALL display a hover state with enhanced shadow
4. WHEN a product is already in the cart, THE System SHALL display a quantity stepper instead of the add-to-cart button
5. THE System SHALL bind all Product Card data to existing backend data structures without modification

### Requirement 3

**User Story:** As a customer filtering products, I want intuitive filter controls with clear visual feedback, so that I can narrow down product results to find exactly what I need.

#### Acceptance Criteria

1. THE System SHALL display filter options including category checklist, rating selector, price range slider, and any existing backend-provided facets
2. WHEN any filter is applied, THE System SHALL display an Active Filter Chip for each active filter beneath the search bar
3. WHEN a user clicks an Active Filter Chip remove icon, THE System SHALL remove that specific filter and update results
4. WHEN any filters are active, THE System SHALL display a "Clear all" button that removes all filters simultaneously
5. THE System SHALL mirror the filter set used in the Admin Catalog for visual consistency

### Requirement 4

**User Story:** As a customer proceeding through checkout, I want a modern, step-by-step cart and payment flow that clearly shows my progress and order details, so that I can complete my purchase with confidence.

#### Acceptance Criteria

1. THE System SHALL display the Cart Flow as a multi-step process including Cart, Delivery/Address, Payment, Review/Confirm, and Success steps
2. WHEN viewing the Cart step, THE System SHALL display line items as compact cards with image, title, options, unit price, quantity stepper, line total, and remove icon
3. WHILE viewing on desktop, THE System SHALL display the order summary card on the right side with subtotal, tax, delivery, grand total, and checkout button
4. WHILE viewing on mobile, THE System SHALL display the order summary as a sticky bottom element with the same information
5. THE System SHALL maintain all existing checkout logic, validation, and event handlers without modification

### Requirement 5

**User Story:** As a customer completing a purchase, I want clear payment method selection and a comprehensive order review before finalizing, so that I can verify all details before committing to the purchase.

#### Acceptance Criteria

1. WHEN viewing the Payment step, THE System SHALL display payment methods as card-style radio tiles
2. IF a payment method requires additional fields, THEN THE System SHALL reveal those fields within the selected tile using an accordion pattern
3. WHEN viewing the Review step, THE System SHALL display a compact stepper across the top showing all steps and current progress
4. WHEN the order is successfully placed, THE System SHALL display a Success screen with order number, summary, "View Order" button, and "Continue Shopping" button
5. THE System SHALL wire all payment and review actions to existing backend handlers without modification

### Requirement 6

**User Story:** As a customer viewing my order history, I want to see my orders in a clear list format and access detailed information through a dialog, so that I can track my purchases and review order details.

#### Acceptance Criteria

1. WHEN viewing the My Orders Page, THE System SHALL display orders in a table/list format with columns for Order #, Date, Items (count/preview), Total, Status pill, and Actions
2. WHILE viewing on mobile (≤640px), THE System SHALL stack orders as cards containing the same information with a primary "View details" button
3. WHEN a user clicks "View details" on an order, THE System SHALL open an Order Details Dialog as a modal overlay
4. THE Order Details Dialog SHALL display header with Order # and status pill, summary grid with customer/delivery/payment/date information, items list with thumbnails and pricing, totals breakdown, and action buttons for download receipt and reorder if supported
5. IF fulfillment or technician data exists for service orders, THEN THE System SHALL display a section with name, phone, and assigned time

### Requirement 7

**User Story:** As an admin managing the product catalog, I want the admin catalog interface to visually match the customer-facing shop, so that there is consistency across the platform and I can preview how products will appear to customers.

#### Acceptance Criteria

1. THE System SHALL update the Admin Catalog product cards to mirror the public Shop Product Card style including image ratio, typography scale, badges, and price layout
2. WHEN displaying admin-only controls (edit, hide, inventory), THE System SHALL render them as subtle controls in the card footer or kebab menu
3. THE System SHALL apply the same visual styling for sorting and filtering in Admin Catalog as used in Shop Products including chips and slider components
4. THE System SHALL maintain all existing admin catalog logic and functionality without modification
5. THE System SHALL ensure visual parity between Admin Catalog and Shop Products while preserving admin-specific affordances

### Requirement 8

**User Story:** As a user with accessibility needs, I want all interactive elements properly labeled and keyboard-navigable, so that I can use the shop and checkout features with assistive technologies.

#### Acceptance Criteria

1. THE System SHALL provide semantic HTML headings (h1, h2, h3) for all major sections and subsections
2. THE System SHALL include aria-labels and aria-describedby attributes for all form inputs with associated error messages
3. WHEN a filter drawer or dialog is opened, THE System SHALL implement focus trapping to contain keyboard navigation within the modal
4. THE System SHALL ensure all interactive elements (buttons, links, form controls) are keyboard-reachable with visible focus states
5. THE System SHALL use aria-current attributes to indicate active view modes and sort selections

### Requirement 9

**User Story:** As a user on any device, I want consistent visual design language across all shop and order interfaces, so that the experience feels cohesive and professional.

#### Acceptance Criteria

1. THE System SHALL apply Inter or system font family with headings sized text-2xl md:text-3xl and body text sized text-sm md:text-base
2. THE System SHALL style all cards with rounded-2xl borders, shadow-sm, white background, and padding p-4 md:p-5
3. THE System SHALL style primary buttons as solid, secondary buttons as outline, and icon buttons as subtle, all with rounded-xl and height h-10 md:h-11
4. THE System SHALL use soft background colors for chips and badges with medium weight labels
5. THE System SHALL apply consistent spacing with gap-4 md:gap-6 between elements and my-6 md:my-8 for section margins

### Requirement 10

**User Story:** As a user browsing products or viewing orders, I want appropriate loading, empty, and error states, so that I understand the system status and receive helpful feedback.

#### Acceptance Criteria

1. WHEN product data is loading, THE System SHALL display skeleton cards in a grid layout matching the expected result layout
2. WHEN no products match the current filters, THE System SHALL display a friendly empty state message with suggestions to adjust filters
3. WHEN an error occurs during data fetching, THE System SHALL display an error message bound to existing error flags
4. WHEN the cart is empty, THE System SHALL display an empty cart message with a call-to-action to continue shopping
5. WHEN the order history is empty, THE System SHALL display a message indicating no orders have been placed with a link to shop products
