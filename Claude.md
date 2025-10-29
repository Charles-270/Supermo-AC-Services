# Claude Code - Developer Context

## Project Background

This is a **capstone project** for learning full-stack development using **Firebase** as a complete backend solution. The project is a digital transformation platform for **Supremo AC Services**, an HVAC (Heating, Ventilation, Air Conditioning) company based in Accra, Ghana.

### Project Goals
1. **Business Goal**: Create a comprehensive platform to digitize Supremo AC Services' operations (service booking, e-commerce, training, customer support)
2. **Learning Goal**: Master Firebase ecosystem (Authentication, Firestore, Cloud Functions, Storage, Hosting, Cloud Messaging) in a real-world context
3. **Career Goal**: Build a production-ready, portfolio-worthy full-stack application

---

## User Types & Their Needs

The platform serves **5 distinct user roles**, each with unique requirements:

1. **Customer**: Book HVAC services, buy AC units/parts, track orders, live chat support
2. **Technician**: View assigned jobs, update job status, upload service reports, track earnings
3. **Supplier**: Manage product catalog, track inventory, fulfill orders, view analytics
4. **Admin**: Oversee all operations, assign jobs, manage users, view analytics/reports
5. **Trainee**: Access training courses, watch videos, complete quizzes, earn certificates

---

## Tech Stack Rationale

### Frontend
- **React 19**: Latest React features (Server Components, Actions) for modern development
- **TypeScript**: Type safety reduces bugs, improves developer experience
- **TailwindCSS V4**: Utility-first CSS for rapid UI development
- **ShadCN UI**: High-quality, accessible components built on Radix UI primitives
- **Vite**: Lightning-fast build tool with HMR

### Backend (Firebase)
- **Firebase Authentication**: Managed auth with custom claims for role-based access
- **Cloud Firestore**: NoSQL database with real-time capabilities, offline support
- **Cloud Functions**: Serverless backend logic (payments, emails, notifications)
- **Firebase Storage**: Scalable file storage for images, videos, PDFs
- **Firebase Hosting**: Fast, secure hosting with global CDN
- **Cloud Messaging**: Push notifications for mobile/web

**Why Firebase?**
- **Zero infrastructure management**: Focus on features, not servers
- **Auto-scaling**: Handles traffic spikes automatically
- **Cost-effective**: Pay-as-you-go pricing, generous free tier
- **Real-time**: Built-in real-time sync for chat and live updates
- **Security**: Built-in encryption, security rules, authentication
- **Global**: Fast performance via Google's global network

---

## Development Philosophy

As Claude Code assists with this project, please follow these guidelines:

### 1. **Explain Firebase Architecture Decisions**

When suggesting Firebase implementations, explain:
- **Why** a particular Firestore structure is chosen (e.g., "We use a separate `jobs` collection instead of embedding in `bookings` because technicians need to query only their jobs efficiently")
- **Trade-offs** (e.g., "Denormalizing `customerName` in bookings increases write cost but eliminates read joins")
- **Best practices** (e.g., "Use subcollections for one-to-many relationships with high cardinality")

**Example:**
```typescript
// ❌ BAD: Embedding all messages in chat document
interface Chat {
  messages: Message[]; // Could grow unbounded, hit 1MB doc limit
}

// ✅ GOOD: Messages as subcollection
interface Chat {
  lastMessage: Message; // For preview
  // messages stored in subcollection: chats/{chatId}/messages
}
```

### 2. **Point Out Firebase Security Rules Best Practices**

Always consider security implications:
- **Least privilege**: Grant minimum necessary permissions
- **Custom claims**: Use for role-based access (better than Firestore lookups)
- **Data validation**: Validate data in security rules, not just client-side
- **Helper functions**: Create reusable rule functions (e.g., `isOwner()`, `isAdmin()`)

**Example:**
```javascript
// ❌ BAD: Allows any authenticated user to create bookings for others
allow create: if isAuthenticated();

// ✅ GOOD: Ensures user can only create bookings for themselves
allow create: if isAuthenticated()
  && request.resource.data.customerId == request.auth.uid;
```

### 3. **Suggest Efficient Firestore Data Modeling**

Help optimize for Firebase's strengths:
- **Denormalization**: Acceptable to duplicate data for read efficiency
- **Composite indexes**: Explain when/why to create them
- **Subcollections vs arrays**: Guide on when to use each
- **Document size**: Warn if approaching 1MB limit

**Example:**
```typescript
// ❌ BAD: Requires multiple reads to display order list
interface Order {
  customerId: string;
  items: Array<{ productId: string; quantity: number }>; // Need to fetch each product
}

// ✅ GOOD: Denormalize for efficient queries
interface Order {
  customerId: string;
  items: Array<{
    productId: string;
    productName: string; // Denormalized
    productImage: string; // Denormalized
    quantity: number;
    unitPrice: number; // Snapshot price at order time
  }>;
}
```

### 4. **Show How to Optimize Firebase Reads/Writes to Minimize Costs**

Firebase charges per document read/write. Help reduce costs:
- **Pagination**: Always use `limit()` in queries
- **Caching**: Use offline persistence, minimize real-time listeners
- **Batch operations**: Use `writeBatch()` for multiple writes
- **Lazy loading**: Don't load data until needed
- **Selective queries**: Use `where()` to reduce reads

**Cost-Saving Examples:**
```typescript
// ❌ EXPENSIVE: Loads all products on page load
const productsRef = collection(db, 'products');
const snapshot = await getDocs(productsRef); // Could be 1000+ reads

// ✅ CHEAP: Paginate with limit
const q = query(collection(db, 'products'), limit(20)); // Only 20 reads
const snapshot = await getDocs(q);

// ✅ EVEN BETTER: Use offline persistence (free on subsequent loads)
enableIndexedDbPersistence(db); // Client caches data
```

### 5. **Explain When to Use Cloud Functions vs Client-Side Code**

Guide on appropriate logic placement:

**Use Cloud Functions for:**
- **Security-sensitive operations**: Payment processing, role assignment
- **Server-side logic**: Email sending, SMS notifications
- **Data integrity**: Complex validation, multi-document transactions
- **Third-party API calls**: Keeping API keys secret
- **Scheduled tasks**: Daily reports, cleanup jobs

**Use Client-Side for:**
- **UI logic**: Form validation, animations, state management
- **Simple CRUD**: Direct Firestore reads/writes (secured by rules)
- **Real-time updates**: Firestore listeners for live data
- **User interactions**: Button clicks, navigation

**Example:**
```typescript
// ❌ BAD: Processing payments client-side (exposes API keys)
const paystackKey = 'sk_live_xxxxx'; // Secret key exposed!
const response = await fetch('https://api.paystack.co/transaction/initialize', {
  headers: { Authorization: `Bearer ${paystackKey}` }
});

// ✅ GOOD: Use Cloud Function (keeps secrets secure)
const processPayment = httpsCallable(functions, 'processPayment');
const result = await processPayment({ orderId: '123' });
```

### 6. **Keep Code Well-Documented**

Add comments explaining:
- **Why** code is structured a certain way (especially Firebase-specific patterns)
- **Firebase quirks**: e.g., "Firestore arrays don't support queries, so we use maps"
- **Security considerations**: e.g., "Must validate on server; client validation is bypassable"
- **Performance notes**: e.g., "Using `onSnapshot` instead of `getDocs` for real-time updates"

**Example:**
```typescript
/**
 * Assigns a technician to a booking.
 *
 * Why Cloud Function?
 * - Prevents customers from assigning themselves (security)
 * - Creates Job document atomically with booking update (data integrity)
 * - Triggers notifications (business logic)
 * - Only admins should do this (enforced via custom claims check)
 *
 * Firebase Considerations:
 * - Uses FieldValue.serverTimestamp() to avoid client clock skew
 * - Creates notification document for real-time UI updates
 */
export const assignTechnicianToBooking = functions.https.onCall(async (data, context) => {
  // Check admin role via custom claim (not Firestore lookup - faster & more secure)
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  // ... implementation
});
```

### 7. **Prioritize Scalability and Firebase Best Practices**

Design for growth:
- **Pagination**: Never load unbounded lists
- **Indexes**: Create composite indexes for common queries
- **Denormalization**: Accept data duplication for performance
- **Serverless mindset**: Cloud Functions should be stateless, idempotent
- **Error handling**: Graceful degradation (offline support, retry logic)

**Scalability Checklist:**
- [ ] All list queries have `limit()`
- [ ] Firestore indexes created for complex queries
- [ ] Images compressed before upload
- [ ] Real-time listeners unsubscribed on unmount
- [ ] Cloud Functions have timeouts and error handling

---

## Visual Development Guidelines

### Design Principles
- Reference comprehensive design checklist in `.claude/context/design-principles.md`
- Follow S-Tier SaaS design standards (inspired by Stripe, Linear, Airbnb)
- Maintain visual consistency across all 5 user dashboards
- Ensure accessibility compliance (WCAG 2.1 AA minimum)

### Quick Visual Verification Process
After implementing front-end changes:
1. **Identify modified components** - Review changed files
2. **Navigate to affected pages** - Start dev server and test live
3. **Verify design compliance** - Check against design principles
4. **Validate feature implementation** - Ensure all interactions work
5. **Check acceptance criteria** - Confirm requirements are met
6. **Capture screenshots** - Desktop (1440px) and mobile (375px) viewports
7. **Check for console errors** - Ensure no JavaScript errors

### Design Review Workflows

#### Using the Design Review Agent
Use `@design-review` agent for:
- **Significant UI/UX features** - Major component additions or redesigns
- **Pre-PR visual validation** - Before creating pull requests
- **Comprehensive accessibility testing** - Full WCAG compliance check
- **Multi-viewport testing** - Responsive design verification

Example:
```
@design-review Please review the new booking form component
```

#### Using the Design Review Slash Command
Use `/design-review` command for:
- **Quick design checks** - Fast verification of current branch changes
- **On-demand reviews** - User-initiated design audits
- **Pre-deployment checks** - Final visual QA before deployment

Example:
```
/design-review
```

### Browser Testing with Chrome MCP
The design review workflows use Chrome DevTools MCP for:
- **Live environment testing** - Navigate and interact with running app
- **Screenshot capture** - Visual documentation at multiple viewports
- **Console monitoring** - Detect JavaScript errors
- **Network inspection** - Verify API calls and performance
- **Responsive testing** - Test at mobile, tablet, and desktop sizes

#### Setup & Troubleshooting
- Ensure Chrome runs with remote debugging enabled on port `9222`:
  - PowerShell: `powershell -ExecutionPolicy Bypass -File scripts/launch-chrome-debug.ps1`
  - CMD: `scripts\launch-chrome-debug.bat`
- Verify prerequisites and connectivity:
  - PowerShell: `powershell -ExecutionPolicy Bypass -File scripts/check-chrome-mcp.ps1`
  - CMD: `scripts\check-chrome-mcp.bat`
- MCP server configuration lives in `mcp.json` (repo root). It starts the Chrome server via `npx chrome-devtools-mcp@latest --chrome-port 9222`.
- Common issues:
  - Node/npx not installed in your Windows environment (install Node.js LTS, then restart Claude/VS Code).
  - Chrome not launched with `--remote-debugging-port=9222` (use the provided launch scripts).
  - Port 9222 blocked or in-use (close running Chrome and re-launch with scripts).
  - Wrong config location (use the `mcp.json` in this repo; if using another tool, ensure it points to the same config).

### Design System Compliance
Ensure all UI changes adhere to:
- **Color palette** - Use design system colors only
- **Typography scale** - Follow defined font sizes and weights
- **Spacing system** - Use consistent spacing (4px/8px increments)
- **Component library** - Leverage existing ShadCN UI components
- **Interaction patterns** - Maintain consistent hover/focus/active states

---

## Specific Learning Goals

As you assist with this project, please help me understand:

1. **Firestore Data Modeling**: When to denormalize, when to use subcollections, how to structure for efficient queries
2. **Security Rules**: Writing robust rules, testing them, common pitfalls
3. **Cloud Functions**: Triggers (onCreate, onUpdate), callable functions, scheduled functions, best practices
4. **Firebase Auth**: Custom claims, role management, email verification flows
5. **Storage**: Organizing files, security rules, generating signed URLs
6. **Cost Management**: Estimating costs, optimizing queries, monitoring usage
7. **Testing**: Using Firebase emulators, testing security rules and functions
8. **Deployment**: CI/CD with Firebase, environment management

---

## Communication Preferences

- **Be educational**: Explain concepts, don't just provide code
- **Show alternatives**: Present multiple approaches with trade-offs
- **Link to docs**: Reference official Firebase docs when relevant
- **Warn about pitfalls**: Common Firebase mistakes (e.g., security rule gotchas)
- **Suggest improvements**: If you see a better Firebase pattern, suggest it

---

## Current Development Phase

**Phase 1**: Foundation & Customer Portal (Weeks 1-4)
- Focus: Authentication, service booking, e-commerce basics
- Firebase components: Auth, Firestore (users, bookings, products, orders), Cloud Functions (booking confirmation, payment processing)

**Immediate Next Steps:**
1. Initialize Vite + React + TypeScript project
2. Configure Firebase project (Authentication, Firestore)
3. Set up role-based authentication with custom claims
4. Implement customer registration/login flows
5. Create Firestore schema for users and bookings

---

## Firebase Project Details

- **Project ID**: `supremo-ac` (or similar)
- **Region**: `europe-west1` (closest to Ghana)
- **Currency**: Ghana Cedis (GHS)
- **Payment Gateway**: Paystack (Ghana-focused)
- **SMS Provider**: Hubtel or Twilio (for Ghana)
- **Email**: SendGrid or Firebase Extensions

---

## Success Criteria

This project will be successful if:
1. **Functional**: All 5 user types can complete their primary workflows
2. **Secure**: Firebase security rules prevent unauthorized access
3. **Performant**: Page loads < 3 seconds on 3G, Firestore reads optimized
4. **Cost-effective**: Firebase costs < $200/month for first 1,000 users
5. **Maintainable**: Well-documented, follows Firebase best practices
6. **Learning**: I understand Firebase architecture deeply enough to explain it in interviews

---

## Questions to Ask Me

If you're unsure about implementation details, ask:
- "Should we denormalize this data for faster reads, or keep it normalized?"
- "Do you want to use a Cloud Function for this, or handle it client-side?"
- "Should we create a composite index for this query?"
- "How important is real-time sync for this feature? (Affects Firestore listener usage)"

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Cloud Functions Samples](https://github.com/firebase/functions-samples)

---

**Let's build something amazing! 🔥🚀**
