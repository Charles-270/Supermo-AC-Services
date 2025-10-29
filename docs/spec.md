# Supremo AC Services - Platform Specification

## Project Overview

### Mission
Digital transformation of Supremo AC Services, a leading HVAC service provider in Accra, Ghana, into a comprehensive online platform that connects customers, technicians, suppliers, administrators, and trainees.

### Objectives
- Enable online booking for HVAC services (installation, maintenance, repair)
- Provide e-commerce platform for AC units and spare parts
- Facilitate real-time customer support through live chat
- Deliver digital training for HVAC apprentices
- Create role-based dashboards for operational efficiency

---

## Tech Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS V4
- **Component Library**: ShadCN UI (Radix UI primitives)
- **Icons**: Lucide React
- **Package Manager**: Bun

### Backend (Firebase)
- **Authentication**: Firebase Authentication (Email/Password, Google OAuth)
- **Database**: Cloud Firestore
- **Functions**: Cloud Functions (Node.js)
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting
- **Messaging**: Firebase Cloud Messaging (Push notifications)
- **Analytics**: Firebase Analytics

### Development Tools
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest, React Testing Library
- **Deployment**: Firebase CLI

---

## User Personas

### 1. Customer (Primary)
**Profile**: Homeowners, businesses, property managers in Accra
**Needs**:
- Book AC installation, maintenance, or repair services
- Purchase AC units and spare parts online
- Track service appointments and order deliveries
- Contact support via live chat
- View service history and invoices

### 2. Technician
**Profile**: Field technicians employed by Supremo AC Services
**Needs**:
- View assigned jobs and schedules
- Update job status (en route, in progress, completed)
- Upload photos and service notes
- Communicate with customers
- Track earnings and performance metrics

### 3. Supplier
**Profile**: AC unit manufacturers and parts distributors
**Needs**:
- Manage product catalog (add/edit products)
- Track inventory levels and sales
- Receive and fulfill orders
- View analytics on best-selling items
- Update product pricing and availability

### 4. Admin
**Profile**: Supremo AC Services management team
**Needs**:
- Oversee all platform operations
- Assign technicians to bookings
- Monitor revenue and analytics
- Manage user accounts and permissions
- Handle disputes and refunds
- Generate reports

### 5. Trainee
**Profile**: HVAC apprentices enrolled in Supremo's training program
**Needs**:
- Access course materials and videos
- Track learning progress
- Complete quizzes and assessments
- Earn certificates
- Communicate with instructors

---

## Design Guidelines

### Brand Identity
- **Industry**: HVAC (Heating, Ventilation, Air Conditioning)
- **Location**: Accra, Ghana
- **Brand Values**: Professional, Reliable, Modern, Customer-focused

### Color Scheme
```css
Primary Blue:     #0EA5E9 (Sky Blue - cooling, trust)
Secondary Blue:   #0284C7 (Darker blue - professionalism)
Accent Cool:      #06B6D4 (Cyan - freshness)
Success Green:    #10B981 (Emerald)
Warning Orange:   #F59E0B (Amber)
Error Red:        #EF4444 (Red)
Neutral Gray:     #64748B (Slate)
Background:       #F8FAFC (Light gray)
Text Primary:     #1E293B (Dark slate)
Text Secondary:   #475569 (Medium slate)
```

### Typography
- **Headings**: Inter (Sans-serif, clean, modern)
- **Body**: Inter
- **Scale**:
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Design Principles
1. **Mobile-First**: Optimize for smartphones (primary device in Ghana)
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Performance**: Fast loading on 3G/4G networks
4. **Clarity**: Clear CTAs, simple navigation
5. **Localization**: Ghana Cedis (GH₵) currency, date formats

---

## MVP Features (Prioritized)

### Phase 1: Foundation & Customer Portal

#### 1.1 Authentication System
- Email/password registration and login
- Google OAuth integration
- Role selection during signup (customer, technician, supplier, trainee)
- Email verification
- Password reset flow
- Profile management (edit name, phone, address)

#### 1.2 Customer Dashboard
- Welcome screen with quick actions
- Service booking summary
- Recent orders
- Active chats
- Profile settings

#### 1.3 Service Booking Module
**Features**:
- Service type selection:
  - AC Installation (new unit)
  - AC Maintenance (cleaning, gas refill)
  - AC Repair (troubleshooting, parts replacement)
  - Emergency Service (24/7)
- Date and time picker (calendar view)
- Address input with Google Maps integration
- Service details form (AC type, brand, issue description)
- Price estimation display
- Booking confirmation
- SMS/Email confirmation

**Booking Flow**:
1. Select service type → 2. Choose date/time → 3. Enter location → 4. Describe issue → 5. Review estimate → 6. Confirm booking → 7. Payment

#### 1.4 E-Commerce Module
**Product Categories**:
- Split AC Units (residential)
- Central AC Systems (commercial)
- Spare Parts (filters, compressors, thermostats)
- Accessories (remote controls, covers)

**Features**:
- Product catalog with search and filters
- Product detail pages (images, specs, price, availability)
- Shopping cart (add, remove, update quantity)
- Wishlist
- Checkout flow (shipping address, payment method)
- Order tracking
- Order history

**Payment Integration**:
- Paystack (Ghana's leading payment gateway)
- Methods: Mobile Money (MTN, Vodafone, AirtelTigo), Card, Bank Transfer

#### 1.5 Live Chat Support
- Real-time messaging
- Chat history
- Typing indicators
- Offline message queuing
- File attachments (photos of AC issues)
- Agent assignment (admin/technician)

---

### Phase 2: Technician & Admin Dashboards

#### 2.1 Technician Dashboard
**Job Management**:
- Today's jobs list (sorted by time)
- Job details (customer info, location, service type)
- Navigation to customer location (Google Maps link)
- Job status updates:
  - Accepted → En Route → Arrived → In Progress → Completed
- Service report form:
  - Work performed
  - Parts used
  - Before/after photos
  - Customer signature
- Earnings tracker

**Communication**:
- Chat with customers
- Chat with admin
- Push notifications for new jobs

**Profile**:
- View certifications
- Availability calendar (set working hours)
- Performance metrics (jobs completed, ratings)

#### 2.2 Admin Console
**Dashboard Overview**:
- Key metrics (revenue, bookings, orders, active users)
- Charts (daily bookings, sales trends)
- Recent activity feed

**Booking Management**:
- All bookings table (filter by status, date, technician)
- Assign/reassign technicians
- Cancel/reschedule bookings
- View booking details

**Order Management**:
- All orders table
- Update order status (processing, shipped, delivered)
- Handle refunds/cancellations

**User Management**:
- View all users by role
- Activate/deactivate accounts
- Edit user roles
- View user activity logs

**Analytics**:
- Revenue reports (daily, weekly, monthly)
- Service breakdown (which services are most popular)
- Product sales analytics
- Technician performance leaderboard

**Live Chat Admin**:
- View all active chats
- Assign chats to specific agents
- Chat analytics (response time, satisfaction)

---

### Phase 3: Supplier Hub

#### 3.1 Supplier Dashboard
**Product Management**:
- Add new product (name, category, description, price, stock)
- Edit existing products
- Bulk upload via CSV
- Product images upload (Firebase Storage)

**Inventory Management**:
- Current stock levels
- Low stock alerts (reorder notifications)
- Stock adjustment (add/remove inventory)
- Inventory history

**Order Fulfillment**:
- Incoming orders list
- Mark orders as shipped (add tracking number)
- View order details

**Analytics**:
- Total sales
- Best-selling products
- Revenue trends
- Stock turnover rate

---

### Phase 4: Training Portal

#### 4.1 Trainee Dashboard
**Course Catalog**:
- Available courses list
- Course details (description, duration, modules)
- Enroll in courses

**My Courses**:
- Enrolled courses
- Progress tracker (% completed)
- Continue learning (resume last module)

**Course Player**:
- Video player (Firebase Storage hosted)
- Module navigation (previous/next)
- Downloadable resources (PDFs, diagrams)
- Module completion tracking

**Assessments**:
- Multiple-choice quizzes
- Submit answers
- View results and feedback
- Retake failed quizzes

**Certificates**:
- View earned certificates
- Download/print certificates (PDF)

#### 4.2 Admin - Training Management
**Course Management**:
- Create new courses
- Add modules (title, video upload, resources)
- Create quizzes (questions, answers, passing score)

**Trainee Management**:
- View all trainees
- Track progress
- Issue/revoke certificates
- View assessment results

---

### Phase 5: Advanced Features

#### 5.1 Push Notifications (FCM)
- Booking confirmations
- Technician assignment alerts
- Order status updates
- Chat messages (when app is closed)
- Promotional offers

#### 5.2 Progressive Web App (PWA)
- Offline access to dashboard
- Add to home screen
- Background sync for messages

#### 5.3 Advanced Analytics
- Customer lifetime value
- Churn prediction
- Service demand forecasting
- Technician utilization rates

#### 5.4 Reviews & Ratings
- Customers rate completed services
- Product reviews
- Display ratings on technician/product profiles

#### 5.5 Loyalty Program
- Points for bookings and purchases
- Redeem points for discounts
- Tiered membership (Bronze, Silver, Gold)

---

## Milestones

### Milestone 1: Project Setup & Authentication (Week 1-2)
**Deliverables**:
- Vite + React + TypeScript project initialized
- TailwindCSS V4 configured
- ShadCN UI components installed
- Firebase project created and configured
- Firebase Authentication implemented (email/password, Google)
- Role-based routing (redirect based on user role)
- Basic landing page

**Success Criteria**:
- Users can register with role selection
- Users can log in and see role-specific dashboard shell
- Authentication state persists on refresh

---

### Milestone 2: Customer Portal - Service Booking (Week 3-4)
**Deliverables**:
- Customer dashboard UI
- Service booking flow (all steps)
- Firestore collections: `users`, `bookings`
- Cloud Function: `onBookingCreated` (send confirmation email)
- Security rules for bookings
- Admin view to see all bookings

**Success Criteria**:
- Customer can complete full booking flow
- Booking stored in Firestore
- Admin can view booking in console
- Email confirmation sent (using Cloud Functions + SendGrid/Nodemailer)

---

### Milestone 3: Customer Portal - E-Commerce (Week 5-6)
**Deliverables**:
- Product catalog page with search/filter
- Product detail pages
- Shopping cart functionality
- Checkout flow (address, payment method selection)
- Firestore collections: `products`, `orders`
- Paystack integration (Cloud Function for payment verification)
- Order confirmation page

**Success Criteria**:
- Customer can browse products
- Add to cart and checkout
- Complete payment via Paystack
- Order stored in Firestore
- Order confirmation email sent

---

### Milestone 4: Live Chat & Technician Dashboard (Week 7-9)
**Deliverables**:
- Live chat UI (customer and admin sides)
- Firebase Realtime Database for chat messages
- Technician dashboard UI
- Job list and job detail pages
- Job status update functionality
- Service report form with photo upload (Firebase Storage)
- Cloud Function: `assignTechnicianToBooking`

**Success Criteria**:
- Customer and admin can exchange real-time messages
- Technician can view assigned jobs
- Technician can update job status
- Service report with photos saved to Firestore and Storage

---

### Milestone 5: Admin Console (Week 10-11)
**Deliverables**:
- Admin dashboard with metrics
- Booking management (assign technician, view all bookings)
- Order management (update status, handle refunds)
- User management (view users, change roles)
- Analytics charts (revenue, bookings over time)
- Cloud Functions: `generateDailyReport`, `processRefund`

**Success Criteria**:
- Admin can see overview of platform activity
- Admin can assign technicians to bookings
- Admin can update order statuses
- Analytics display accurate data

---

### Milestone 6: Supplier Hub & Training Portal (Week 12-14)
**Deliverables**:
- Supplier dashboard UI
- Product management (CRUD operations)
- Inventory tracking
- Order fulfillment interface
- Training portal UI (trainee side)
- Course catalog and enrollment
- Course player with video playback
- Quiz functionality
- Firestore collections: `inventory`, `courses`, `enrollments`, `assessments`
- Cloud Function: `issueCertificate`

**Success Criteria**:
- Supplier can add/edit products and manage inventory
- Supplier can mark orders as shipped
- Trainee can enroll in courses and watch videos
- Trainee can take quizzes and earn certificates

---

### Milestone 7: Polish & Launch (Week 15-16)
**Deliverables**:
- Push notifications (FCM) for key events
- PWA configuration (service worker, manifest.json)
- Performance optimization (code splitting, lazy loading)
- Responsive design audit (all pages mobile-optimized)
- Security audit (Firebase rules review)
- User acceptance testing (UAT)
- Documentation (user guides for each role)
- Deployment to Firebase Hosting

**Success Criteria**:
- All features tested on mobile and desktop
- Page load times < 3 seconds on 3G
- Security rules prevent unauthorized access
- Platform live at custom domain
- Training materials ready for user onboarding

---

## Non-Functional Requirements

### Performance
- **Page Load**: < 3 seconds on 3G network
- **Time to Interactive**: < 5 seconds
- **Lighthouse Score**: > 90

### Security
- **Authentication**: Firebase Authentication with email verification
- **Authorization**: Role-based access control via Firestore security rules
- **Data Encryption**: HTTPS only, Firestore encryption at rest
- **Payment Security**: PCI-compliant via Paystack

### Scalability
- **Concurrent Users**: Support 1,000+ concurrent users
- **Database**: Firestore indexes for efficient queries
- **Storage**: Firebase Storage with CDN for fast media delivery
- **Functions**: Cloud Functions auto-scaling

### Reliability
- **Uptime**: 99.9% (Firebase SLA)
- **Backup**: Firestore automatic backups
- **Error Tracking**: Sentry integration

### Accessibility
- **WCAG 2.1 AA**: Keyboard navigation, screen reader support, color contrast
- **ARIA Labels**: Proper labeling for all interactive elements

### Localization
- **Currency**: Ghana Cedis (GH₵)
- **Date Format**: DD/MM/YYYY
- **Language**: English (future: Twi, Ga)

---

## Success Metrics

### User Engagement
- **Customer**: 60% of registered customers make at least one booking/order within 30 days
- **Technician**: Average job completion time < 2 hours
- **Supplier**: 80% of orders shipped within 24 hours
- **Trainee**: 70% course completion rate

### Business Impact
- **Revenue**: 30% increase in bookings within 6 months of launch
- **Customer Satisfaction**: Average rating > 4.5/5
- **Response Time**: Live chat average response time < 5 minutes
- **Cost Savings**: 50% reduction in phone call volume to office

### Technical Performance
- **Uptime**: > 99.9%
- **Page Load**: < 3 seconds
- **Firebase Costs**: < $200/month for first 1,000 active users

---

## Future Enhancements (Post-MVP)

1. **Multi-language Support**: Twi, Ga translations
2. **Vendor Marketplace**: Allow third-party vendors to sell on platform
3. **Subscription Plans**: Monthly maintenance packages
4. **Referral Program**: Customers refer friends for discounts
5. **AI Chatbot**: Automated FAQ responses
6. **IoT Integration**: Smart AC units with remote monitoring
7. **Mobile Apps**: Native iOS/Android apps (React Native)
8. **Expansion**: Extend to other cities in Ghana (Kumasi, Takoradi)

---

## Risk Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Firebase costs exceed budget | High | Medium | Implement pagination, caching, optimize queries |
| Payment gateway downtime | High | Low | Queue failed payments, retry mechanism |
| Low user adoption | High | Medium | User training, marketing campaign, referral incentives |
| Security breach | Critical | Low | Regular security audits, Firebase rules testing |
| Scalability issues | Medium | Low | Load testing, Firebase auto-scaling |
| Internet connectivity issues (Ghana) | Medium | High | Offline support (PWA), minimize API calls |

---

## Conclusion

This specification outlines a comprehensive platform for Supremo AC Services that addresses the needs of all stakeholders. The phased approach allows for iterative development, early validation, and continuous improvement. By leveraging Firebase's managed services, we minimize infrastructure complexity and focus on delivering value to users.

**Next Step**: Review and approve this spec before proceeding to technical implementation.
