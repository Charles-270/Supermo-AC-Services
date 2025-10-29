# Design Document

## Overview

The Book Service Flow Redesign transforms the CoolAir booking experience into a modern, multi-step wizard that guides customers through service selection, scheduling, and confirmation. The design emphasizes clarity, accessibility, and responsive behavior across all devices while maintaining consistency with the existing CoolAir design system.

The flow consists of four distinct steps:
1. **Service Selection**: Browse and select from a catalog of AC services
2. **Date & Time Selection**: Choose appointment date and time from available slots
3. **Customer Details**: Provide contact and location information
4. **Confirmation**: Review booking details and receive confirmation

## Architecture

### Component Hierarchy

```
CustomerDashboard
├── CustomerSidebar (updated with Book Service link)
├── BookServiceFlow (/dashboard/book route)
│   ├── BookingStepper
│   ├── Step1_ServiceCatalog
│   │   ├── SearchBar
│   │   └── ServiceGrid
│   │       └── ServiceCard (×4)
│   ├── Step2_DateTimePicker
│   │   ├── Calendar
│   │   ├── TimeSlotList
│   │   └── NavigationButtons
│   ├── Step3_CustomerDetails
│   │   ├── SelectionSummary
│   │   ├── CustomerDetailsForm
│   │   └── NavigationButtons
│   └── Step4_Confirmation
│       ├── SuccessHeader
│       ├── BookingSummary
│       ├── QRCode
│       └── ActionButtons
└── MyBookingsPage (redesigned)
    ├── BookingsList
    │   └── BookingRow (with View Details & Cancel actions)
    └── BookingDetailsDialog (redesigned)
```

### State Management

**BookingDraft State Object:**
```typescript
interface BookingDraft {
  service?: {
    id: 'install' | 'maint' | 'repair' | 'inspect';
    name: string;
    priceFrom: number;
    imageUrl: string;
    description: string;
  };
  date?: string; // YYYY-MM-DD format
  timeSlot?: {
    start: string; // ISO string
    end: string;   // ISO string
  };
  customer?: {
    name: string;
    phone: string;
    countryCode: string;
    email?: string;
    address: string;
    notes?: string;
  };
}
```

**Booking State Object:**
```typescript
interface Booking extends BookingDraft {
  id: string;
  bookingNumber: string; // Format: VRM#####P
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  technician?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    assignedAt: string; // ISO timestamp
  };
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```

### Routing Structure

- `/dashboard/book` - Main booking flow (all 4 steps)
- `/customer/bookings` - My Bookings page (list view)
- Query parameter `?step=1|2|3|4` - Controls active step in booking flow

### Data Flow

1. **Service Selection**: User clicks service → Save to BookingDraft → Navigate to Step 2
2. **Date/Time Selection**: User selects date/time → Save to BookingDraft → Navigate to Step 3
3. **Details Entry**: User fills form → Validate → Save to BookingDraft → Navigate to Step 4
4. **Confirmation**: Submit BookingDraft to API → Create Booking record → Display confirmation
5. **Navigation**: Back button preserves BookingDraft, forward validates before advancing

## Components and Interfaces

### 1. BookingStepper Component

**Purpose**: Visual progress indicator showing current step and completion status

**Props:**
```typescript
interface BookingStepperProps {
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: number[];
  isMobile: boolean;
}
```

**Design Specifications:**
- Desktop: Full step labels ("Service", "Select Date", "Details", "Done")
- Mobile: Compact format with "Step X of 4"
- Progress line: 2px height, connects all nodes
- Active node: Filled circle with accent color (teal/cyan)
- Completed node: Checkmark icon in filled circle
- Inactive node: Empty circle with muted color
- Sticky positioning on mobile (top: 0, z-index: 10)

**Accessibility:**
- aria-label="Booking progress: Step {X} of 4"
- aria-current="step" on active step
- Role="progressbar" with aria-valuenow, aria-valuemin, aria-valuemax

### 2. ServiceCatalog Component (Step 1)

**Purpose**: Display searchable grid of available AC services

**Props:**
```typescript
interface ServiceCatalogProps {
  onServiceSelect: (service: Service) => void;
}
```

**Layout:**
- Search bar: Full width, rounded-2xl, with search icon
- Grid: 1 col (mobile), 2 cols (tablet), 2×2 (desktop ≥1024px)
- Gap: 24px between cards
- Max container width: 1200px

**ServiceCard Design:**
- Image: 16:9 aspect ratio, rounded-t-2xl, object-cover
- Content padding: 24px
- Title: 24px font-size, font-weight 600
- Description: 15px font-size, text-neutral-600, 2 lines max with ellipsis
- Price: "From GHC{amount}" in cyan-600, font-weight 600
- Button: Full width, rounded-xl, bg-cyan-500, hover:bg-cyan-600
- Shadow: soft shadow (0 4px 6px rgba(0,0,0,0.1))
- Hover: lift effect (translateY(-4px), shadow-lg)

**Service Data:**
```typescript
const services: Service[] = [
  {
    id: 'install',
    name: 'AC Installation',
    description: 'Install new air conditioning units in your property.',
    priceFrom: 500.00,
    imageUrl: '[Installation Image URL]'
  },
  {
    id: 'maint',
    name: 'AC Maintenance',
    description: 'Regular servicing to keep your AC running efficiently.',
    priceFrom: 150.00,
    imageUrl: '[Maintenance Image URL]'
  },
  {
    id: 'repair',
    name: 'AC Repair',
    description: 'Fix issues and restore AC functionality.',
    priceFrom: 200.00,
    imageUrl: '[Repair Image URL]'
  },
  {
    id: 'inspect',
    name: 'AC Inspection',
    description: 'Professional assessment of AC system condition.',
    priceFrom: 100.00,
    imageUrl: '[Inspection Image URL]'
  }
];
```

### 3. DateTimePicker Component (Step 2)

**Purpose**: Calendar and time slot selection interface

**Props:**
```typescript
interface DateTimePickerProps {
  selectedDate?: string;
  selectedTimeSlot?: TimeSlot;
  onDateSelect: (date: string) => void;
  onTimeSlotSelect: (slot: TimeSlot) => void;
  onBack: () => void;
  onNext: () => void;
}
```

**Desktop Layout (>1024px):**
- Two-pane: Calendar (left 50%), Time slots (right 50%)
- Calendar: Month view with navigation arrows
- Time slots: Vertical list with 3-hour blocks
- Divider: 1px border between panes

**Mobile Layout (≤640px):**
- Calendar: Full width at top
- Month navigation: Swipeable with arrow buttons
- Time slots: Full width below calendar
- Smooth scroll to slots on date selection

**Calendar Design:**
- Month header: Font-size 18px, font-weight 600
- Day labels: 3-letter abbreviations (Sun, Mon, etc.)
- Date cells: 40×40px, rounded-lg
- Past dates: Disabled with opacity 0.4
- Available dates: Dot indicator (4px cyan circle) below number
- Selected date: Filled background (teal-600), white text
- Hover: Light background (neutral-100)

**Time Slot Design:**
- Each slot: Rounded-lg card, padding 16px
- Format: "10:00 am - 1:00 pm"
- Available: Border neutral-200, hover:border-cyan-400
- Selected: Background cyan-50, border cyan-500, font-weight 600
- Unavailable: Opacity 0.5, cursor not-allowed

**Navigation Buttons:**
- Back: Outline button, rounded-full, padding 12px 32px
- Set times: Filled button (teal-600), disabled when no slot selected
- Mobile: Sticky bottom bar with safe-area padding

**Accessibility:**
- Calendar: Arrow key navigation (left/right for days, up/down for weeks)
- Enter key: Select date or time slot
- Focus indicators: 2px outline on focused elements
- Screen reader: Announce selected date and available slots

### 4. CustomerDetailsForm Component (Step 3)

**Purpose**: Collect customer contact and location information

**Props:**
```typescript
interface CustomerDetailsFormProps {
  bookingDraft: BookingDraft;
  onSubmit: (customer: CustomerInfo) => void;
  onBack: () => void;
}
```

**Layout:**
- Summary banner: Light background, padding 16px, rounded-lg
- Summary text: "You selected {Service} on {Date} at {Time}. Provide your details to proceed."
- Form: Single column (mobile), two columns for phone/email (desktop)
- Field spacing: 24px vertical gap

**Form Fields:**

1. **Full Name**
   - Type: text
   - Required: Yes
   - Placeholder: "Type your name"
   - Validation: Min 2 characters
   - Auto-focus on mount

2. **Phone**
   - Type: tel
   - Required: Yes
   - Country code selector: Dropdown (default +233 for Ghana)
   - Placeholder: "Phone number"
   - Validation: 9-15 digits
   - Input mode: "tel"

3. **Email**
   - Type: email
   - Required: No
   - Placeholder: "Your email"
   - Validation: Valid email format if provided
   - Input mode: "email"

4. **Address/Location**
   - Type: text
   - Required: Yes
   - Placeholder: "Enter your address"
   - Validation: Min 10 characters

5. **Notes**
   - Type: textarea
   - Required: No
   - Placeholder: "Say something..."
   - Rows: 4
   - Max length: 500 characters

**Field Design:**
- Height: 48px (inputs), auto (textarea)
- Border: 1px neutral-300, focus:border-cyan-500
- Border radius: 12px
- Padding: 12px 16px
- Font size: 15px
- Label: 14px, font-weight 500, margin-bottom 8px
- Required indicator: Red asterisk (*)

**Validation:**
- Real-time validation on blur
- Inline error messages below fields
- Error state: Red border, red text
- Success state: Green border (optional)
- Disable Next button until all required fields valid

**Navigation Buttons:**
- Same design as Step 2
- Next button disabled state: Opacity 0.5, cursor not-allowed

### 5. BookingConfirmation Component (Step 4)

**Purpose**: Display booking success and complete details

**Props:**
```typescript
interface BookingConfirmationProps {
  booking: Booking;
  onBackToBookings: () => void;
  onCreateAnother: () => void;
}
```

**Layout:**
- Success header: Large heading with green checkmark icon
- Summary grid: 2 columns on desktop, 1 column on mobile
- QR code: 200×200px, centered
- Payment note: Light background banner
- Action buttons: Full width on mobile, inline on desktop

**Success Header:**
- Heading: "Booking confirmed!" with green checkmark icon (32px)
- Font size: 32px (desktop), 24px (mobile)
- Font weight: 700
- Color: neutral-900
- Margin bottom: 32px

**Summary Sections:**

1. **Service Information**
   - Label: "Service"
   - Value: Service name
   - Icon: Service-specific icon

2. **Date & Time**
   - Label: "Date & Time"
   - Value: "10:00 am, 27 March 24" format
   - Icon: Calendar icon

3. **Customer Information**
   - Label: "Customer"
   - Value: Name and phone
   - Icon: User icon

4. **Location**
   - Label: "Location"
   - Value: Full address
   - Icon: Map pin icon

5. **Booking Number**
   - Label: "Booking Number"
   - Value: Generated code (e.g., VRM11249P)
   - Copy button: Click to copy
   - Icon: Hash icon

**QR Code:**
- Size: 200×200px
- Content: Booking ID
- Download link: "Download QR Code" in green
- Margin: 24px top/bottom

**Payment Note:**
- Background: neutral-50
- Border: 1px neutral-200
- Padding: 16px
- Text: "All payments are made outside the website, payment is made when you arrive at the location"
- Font size: 14px
- Color: neutral-600

**Action Buttons:**
- Primary: "Back to My Bookings" (teal-600, full width on mobile)
- Secondary: "Create another booking" (outline, full width on mobile)
- Desktop: Inline with gap-4

### 6. BookingDetailsDialog Component (Redesigned)

**Purpose**: Display complete booking information in a modal

**Props:**
```typescript
interface BookingDetailsDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void;
}
```

**Layout:**
- Desktop: Centered modal, 640-720px width, max-height 90vh
- Mobile: Full-screen sheet from bottom
- Overlay: Black with 50% opacity
- Close button: Top-right corner (X icon)

**Content Structure:**
- Mirrors Step 4 confirmation layout
- Status pill at top: Color-coded by status
  - Pending: Amber background
  - Confirmed: Blue background
  - In Progress: Purple background
  - Completed: Green background
  - Cancelled: Red background
- Same summary sections as Step 4
- Technician section (conditional)

**Technician Section (when assigned):**
- Heading: "Assigned Technician"
- Avatar: 48×48px circle (if available)
- Name: Font-weight 600
- Phone: Clickable tel: link
- Assigned date: "Assigned on {date}" in muted text

**Actions:**
- Close button: Always visible
- Cancel booking button: Only for pending status
- No Sign out button

**Animations:**
- Desktop: Fade in overlay, scale up dialog (0.95 → 1)
- Mobile: Slide up from bottom
- Duration: 200ms
- Easing: ease-out

## Data Models

### Service Model
```typescript
interface Service {
  id: 'install' | 'maint' | 'repair' | 'inspect';
  name: string;
  description: string;
  priceFrom: number;
  imageUrl: string;
}
```

### TimeSlot Model
```typescript
interface TimeSlot {
  start: string; // ISO 8601 datetime
  end: string;   // ISO 8601 datetime
  available: boolean;
}
```

### BookingDraft Model
```typescript
interface BookingDraft {
  service?: Service;
  date?: string; // YYYY-MM-DD
  timeSlot?: TimeSlot;
  customer?: {
    name: string;
    phone: string;
    countryCode: string;
    email?: string;
    address: string;
    notes?: string;
  };
}
```

### Booking Model
```typescript
interface Booking {
  id: string;
  bookingNumber: string;
  service: Service;
  date: string;
  timeSlot: TimeSlot;
  customer: {
    name: string;
    phone: string;
    countryCode: string;
    email?: string;
    address: string;
    notes?: string;
  };
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  technician?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    assignedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling

### Validation Errors
- Display inline below form fields
- Red text (error-600)
- Icon: Alert circle
- Clear on field change
- Prevent form submission

### API Errors
- Toast notification at top-right
- Error message from API or generic fallback
- Auto-dismiss after 5 seconds
- Retry button for critical operations

### Network Errors
- Full-screen error state with retry button
- Message: "Unable to connect. Please check your internet connection."
- Preserve BookingDraft in session storage

### Loading States
- Skeleton loaders for service cards
- Spinner for calendar/time slot loading
- Disabled buttons with spinner during submission
- Overlay with spinner for dialog operations

## Testing Strategy

### Unit Tests
1. **BookingStepper**: Render correct step states, accessibility attributes
2. **ServiceCard**: Display service data, handle click events
3. **DateTimePicker**: Date selection, time slot selection, validation
4. **CustomerDetailsForm**: Field validation, form submission, error display
5. **BookingConfirmation**: Display booking data, QR code generation
6. **BookingDetailsDialog**: Render booking details, technician section, cancel action

### Integration Tests
1. **Complete Flow**: Navigate through all 4 steps, submit booking
2. **Back Navigation**: Preserve state when navigating backward
3. **Validation Flow**: Test required field validation across steps
4. **API Integration**: Mock API calls, test success/error scenarios
5. **Responsive Behavior**: Test mobile/desktop layouts

### E2E Tests
1. **Happy Path**: Complete booking from service selection to confirmation
2. **Error Recovery**: Handle API errors, retry operations
3. **Cancel Booking**: Cancel from My Bookings page and details dialog
4. **Keyboard Navigation**: Complete flow using only keyboard
5. **Mobile Flow**: Complete booking on mobile viewport

### Accessibility Tests
1. **Screen Reader**: Test with NVDA/JAWS
2. **Keyboard Navigation**: Tab order, focus management
3. **Color Contrast**: Verify WCAG AA compliance
4. **ARIA Attributes**: Validate proper usage
5. **Focus Management**: Test focus on step transitions

### Performance Tests
1. **Lighthouse Scores**: Target ≥85 performance, ≥90 accessibility
2. **Image Loading**: Verify lazy loading works
3. **Bundle Size**: Monitor component bundle sizes
4. **API Response Times**: Test with slow network conditions

## Visual Design System

### Typography
- Font family: Inter
- Headings: 24-32px (desktop), 20-24px (mobile)
- Body: 15-16px
- Small text: 13-14px
- Font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Colors
- Primary: Cyan/Teal (#06b6d4, #14b8a6)
- Success: Green (#10b981)
- Error: Red (#ef4444)
- Warning: Amber (#f59e0b)
- Neutral: Gray scale (#f8fafc to #0f172a)
- Text: #1f2937 (primary), #6b7280 (secondary)

### Spacing
- Base unit: 4px
- Common values: 8px, 12px, 16px, 24px, 32px, 48px
- Container padding: 16px (mobile), 24px (tablet), 32px (desktop)

### Border Radius
- Small: 8px
- Medium: 12px
- Large: 16px
- Extra large: 24px
- Full: 9999px (pills)

### Shadows
- Small: 0 1px 3px rgba(0,0,0,0.1)
- Medium: 0 4px 6px rgba(0,0,0,0.1)
- Large: 0 10px 15px rgba(0,0,0,0.1)
- Extra large: 0 20px 25px rgba(0,0,0,0.1)

### Animations
- Duration: 150-300ms
- Easing: ease-out (default), ease-in-out (complex)
- Hover: Transform translateY(-2px to -4px)
- Focus: 2px outline with offset

### Responsive Breakpoints
- sm: ≤640px (mobile)
- md: 641-1024px (tablet)
- lg: 1025-1440px (desktop)
- xl: ≥1441px (large desktop)

## Implementation Notes

### Session Storage
- Key: `coolair_booking_draft`
- Store BookingDraft as JSON
- Clear on successful booking submission
- Restore on page load if present

### Booking Number Generation
- Format: VRM + 5 random digits + P
- Example: VRM11249P
- Ensure uniqueness by checking against existing bookings

### QR Code Generation
- Library: qrcode.react or similar
- Content: Booking ID (not full booking data)
- Size: 200×200px
- Error correction: Medium level

### Image Optimization
- Use Next.js Image component
- Lazy loading: loading="lazy"
- Responsive sizes: Define srcset
- Alt text: Descriptive for accessibility

### Form Validation
- Library: React Hook Form + Zod schema validation
- Validate on blur for better UX
- Show errors only after user interaction
- Clear errors on field change

### API Integration
- Use React Query for data fetching
- Implement retry logic (3 attempts)
- Cache service data (stale time: 5 minutes)
- Optimistic updates for booking cancellation

### Accessibility Implementation
- Use semantic HTML (nav, main, section, article)
- ARIA labels on all interactive elements
- Focus trap in dialogs
- Announce step changes with aria-live
- Skip links for keyboard users
