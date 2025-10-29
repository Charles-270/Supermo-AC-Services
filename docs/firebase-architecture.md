# Firebase Architecture - Supremo AC Services Platform

## Table of Contents
1. [Firebase Project Configuration](#firebase-project-configuration)
2. [Authentication Strategy](#authentication-strategy)
3. [Firestore Database Schema](#firestore-database-schema)
4. [Security Rules](#security-rules)
5. [Cloud Functions](#cloud-functions)
6. [Firebase Storage Structure](#firebase-storage-structure)
7. [Firebase Cloud Messaging](#firebase-cloud-messaging)
8. [State Management](#state-management)
9. [Cost Optimization](#cost-optimization)
10. [Development Workflow](#development-workflow)

---

## Firebase Project Configuration

### Project Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select features:
# - Firestore
# - Functions
# - Hosting
# - Storage
# - Emulators (for local development)
```

### Environment Configuration

**`.env.local`** (Frontend)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=supremo-ac.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=supremo-ac
VITE_FIREBASE_STORAGE_BUCKET=supremo-ac.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

**`functions/.env`** (Backend)
```env
PAYSTACK_SECRET_KEY=sk_test_xxxxx
SENDGRID_API_KEY=SG.xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+233xxxxxxxxx
```

### Firebase Configuration File

**`src/lib/firebase.ts`**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const functions = getFunctions(app, 'europe-west1'); // Closest to Ghana

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence');
  }
});
```

---

## Authentication Strategy

### User Roles
Firebase Authentication will be extended with Custom Claims for role-based access control.

**Roles**:
- `customer`
- `technician`
- `supplier`
- `admin`
- `trainee`

### Custom Claims Implementation

**Cloud Function** (`functions/src/auth.ts`):
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const setUserRole = functions.https.onCall(async (data, context) => {
  // Only allow authenticated users to set their own role during registration
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid, role } = data;

  // Validate role
  const validRoles = ['customer', 'technician', 'supplier', 'admin', 'trainee'];
  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role');
  }

  // Set custom claim
  await admin.auth().setCustomUserClaims(uid, { role });

  // Create user document in Firestore
  await admin.firestore().collection('users').doc(uid).set({
    role,
    email: context.auth.token.email,
    displayName: context.auth.token.name || '',
    photoURL: context.auth.token.picture || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, role };
});

// Trigger on user creation
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  // Send welcome email
  // Default role will be set during registration flow
  console.log('New user created:', user.uid);
});

// Update last login
export const updateLastLogin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  await admin.firestore().collection('users').doc(context.auth.uid).update({
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});
```

### Frontend Authentication Hook

**`src/hooks/useAuth.ts`**
```typescript
import { useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export type UserRole = 'customer' | 'technician' | 'supplier' | 'admin' | 'trainee';

interface AuthUser extends User {
  role?: UserRole;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const role = tokenResult.claims.role as UserRole;
        setUser({ ...firebaseUser, role });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, role: UserRole) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Set custom claim
    const setUserRole = httpsCallable(functions, 'setUserRole');
    await setUserRole({ uid: userCredential.user.uid, role });

    // Send verification email
    await sendEmailVerification(userCredential.user);

    // Force token refresh to get updated claims
    await userCredential.user.getIdToken(true);

    return userCredential.user;
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Update last login
    const updateLastLogin = httpsCallable(functions, 'updateLastLogin');
    await updateLastLogin();

    return userCredential.user;
  };

  const signInWithGoogle = async (role: UserRole) => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    // Check if user already has a role
    const tokenResult = await userCredential.user.getIdTokenResult();
    if (!tokenResult.claims.role) {
      const setUserRole = httpsCallable(functions, 'setUserRole');
      await setUserRole({ uid: userCredential.user.uid, role });
      await userCredential.user.getIdToken(true);
    }

    return userCredential.user;
  };

  const signOut = () => firebaseSignOut(auth);

  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
};
```

---

## Firestore Database Schema

### Collections Overview

```
firestore/
├── users/
├── bookings/
├── jobs/
├── products/
├── orders/
├── orderItems/
├── inventory/
├── courses/
├── enrollments/
├── assessments/
├── certificates/
├── chats/
│   └── messages/ (subcollection)
├── notifications/
└── analytics/
```

### Detailed Schema

#### 1. `users` Collection
```typescript
interface User {
  uid: string; // Document ID
  role: 'customer' | 'technician' | 'supplier' | 'admin' | 'trainee';
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  address?: {
    street: string;
    city: string;
    region: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Timestamp;
  lastLogin: Timestamp;
  emailVerified: boolean;
  isActive: boolean;
  metadata?: {
    // Customer-specific
    totalBookings?: number;
    totalOrders?: number;
    loyaltyPoints?: number;

    // Technician-specific
    certifications?: string[];
    specializations?: string[];
    availabilitySchedule?: {
      [day: string]: { start: string; end: string }; // e.g., { "monday": { "start": "08:00", "end": "18:00" } }
    };
    rating?: number;
    completedJobs?: number;

    // Supplier-specific
    companyName?: string;
    businessRegNumber?: string;

    // Trainee-specific
    enrolledCourses?: string[];
    completedCourses?: string[];
    certificatesEarned?: number;
  };
}
```

#### 2. `bookings` Collection
```typescript
interface Booking {
  id: string; // Document ID (auto-generated)
  customerId: string; // Reference to users/{uid}
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  technicianId?: string; // Reference to users/{uid} (assigned by admin)
  technicianName?: string;
  serviceType: 'installation' | 'maintenance' | 'repair' | 'emergency';
  serviceDetails: {
    acType?: string; // e.g., "Split AC", "Central AC"
    acBrand?: string;
    issueDescription: string;
    estimatedDuration?: number; // in minutes
  };
  scheduledDate: Timestamp;
  scheduledTime: string; // e.g., "10:00 AM - 12:00 PM"
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  pricing: {
    basePrice: number;
    taxAmount: number;
    totalAmount: number;
    currency: 'GHS'; // Ghana Cedis
  };
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'mobile-money' | 'card';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  cancellationReason?: string;
  notes?: string;
}
```

#### 3. `jobs` Collection
(Created when a booking is assigned to a technician)
```typescript
interface Job {
  id: string;
  bookingId: string; // Reference to bookings/{id}
  technicianId: string;
  customerId: string;
  serviceType: string;
  scheduledDate: Timestamp;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  status: 'assigned' | 'en-route' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
  timeline: {
    assignedAt: Timestamp;
    enRouteAt?: Timestamp;
    arrivedAt?: Timestamp;
    startedAt?: Timestamp;
    completedAt?: Timestamp;
  };
  serviceReport?: {
    workPerformed: string;
    partsUsed: Array<{
      partName: string;
      quantity: number;
      cost: number;
    }>;
    beforePhotos: string[]; // Firebase Storage URLs
    afterPhotos: string[];
    customerSignature?: string; // Base64 or Storage URL
    technicianNotes?: string;
  };
  customerFeedback?: {
    rating: number; // 1-5
    comment?: string;
    submittedAt: Timestamp;
  };
  earnings: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 4. `products` Collection
```typescript
interface Product {
  id: string;
  supplierId: string; // Reference to users/{uid}
  supplierName: string;
  name: string;
  description: string;
  category: 'split-ac' | 'central-ac' | 'spare-parts' | 'accessories';
  subcategory?: string; // e.g., "1.5 HP", "Compressor", "Remote"
  brand?: string;
  specifications?: {
    [key: string]: string; // e.g., { "Cooling Capacity": "12000 BTU", "Energy Rating": "A++" }
  };
  price: number;
  currency: 'GHS';
  discountPercentage?: number;
  finalPrice: number; // price - discount
  images: string[]; // Firebase Storage URLs
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  tags?: string[]; // For search/filtering
  isActive: boolean; // Supplier can deactivate
  rating?: number; // Average rating
  reviewCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 5. `orders` Collection
```typescript
interface Order {
  id: string;
  orderNumber: string; // e.g., "ORD-20250102-001"
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    supplierId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productImage?: string;
  }>;
  summary: {
    subtotal: number;
    shippingFee: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: 'GHS';
  };
  shippingAddress: {
    recipientName: string;
    phoneNumber: string;
    street: string;
    city: string;
    region: string;
    country: string;
    instructions?: string;
  };
  paymentMethod: 'mobile-money' | 'card' | 'bank-transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string; // From Paystack
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancellationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 6. `inventory` Collection
```typescript
interface Inventory {
  id: string;
  supplierId: string;
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  lastRestocked?: Timestamp;
  restockHistory: Array<{
    quantity: number;
    date: Timestamp;
    notes?: string;
  }>;
  salesHistory: Array<{
    orderId: string;
    quantity: number;
    date: Timestamp;
  }>;
  updatedAt: Timestamp;
}
```

#### 7. `courses` Collection
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId?: string;
  category: string; // e.g., "Basic HVAC", "Advanced Repair"
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // Total minutes
  thumbnailURL: string;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    videoURL: string; // Firebase Storage
    duration: number; // minutes
    resources?: Array<{
      title: string;
      fileURL: string;
      fileType: string; // "pdf", "pptx", etc.
    }>;
    order: number;
  }>;
  totalEnrollments: number;
  rating?: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 8. `enrollments` Collection
```typescript
interface Enrollment {
  id: string;
  traineeId: string;
  traineeName: string;
  courseId: string;
  courseName: string;
  enrolledAt: Timestamp;
  progress: {
    completedModules: string[]; // Array of module IDs
    currentModuleId?: string;
    percentageComplete: number; // 0-100
  };
  assessments: Array<{
    assessmentId: string;
    score: number;
    passed: boolean;
    attemptedAt: Timestamp;
  }>;
  certificateIssued: boolean;
  certificateId?: string;
  completedAt?: Timestamp;
  lastAccessedAt: Timestamp;
}
```

#### 9. `assessments` Collection
```typescript
interface Assessment {
  id: string;
  courseId: string;
  title: string;
  passingScore: number; // Percentage
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct option
    points: number;
  }>;
  totalPoints: number;
  timeLimit?: number; // minutes
  createdAt: Timestamp;
}
```

#### 10. `certificates` Collection
```typescript
interface Certificate {
  id: string;
  traineeId: string;
  traineeName: string;
  courseId: string;
  courseName: string;
  enrollmentId: string;
  issueDate: Timestamp;
  certificateURL: string; // PDF in Firebase Storage
  verificationCode: string; // Unique code for verification
}
```

#### 11. `chats` Collection
```typescript
interface Chat {
  id: string;
  participants: string[]; // Array of user IDs
  participantDetails: Array<{
    uid: string;
    name: string;
    role: string;
    photoURL?: string;
  }>;
  type: 'customer-support' | 'customer-technician' | 'admin-technician';
  status: 'active' | 'resolved' | 'closed';
  assignedAgentId?: string; // For customer support
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Subcollection: chats/{chatId}/messages
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachments?: Array<{
    url: string;
    type: 'image' | 'document';
    name: string;
  }>;
  timestamp: Timestamp;
  read: boolean;
}
```

#### 12. `notifications` Collection
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'booking-confirmation' | 'job-assigned' | 'order-shipped' | 'chat-message' | 'promo';
  title: string;
  message: string;
  data?: {
    [key: string]: any; // Additional context (e.g., bookingId, orderId)
  };
  read: boolean;
  actionURL?: string; // Deep link within app
  createdAt: Timestamp;
}
```

#### 13. `analytics` Collection
(For admin dashboard metrics)
```typescript
interface DailyAnalytics {
  id: string; // Format: "YYYY-MM-DD"
  date: Timestamp;
  metrics: {
    totalBookings: number;
    totalOrders: number;
    totalRevenue: number;
    newUsers: number;
    activeUsers: number;
    completedJobs: number;
    averageJobRating: number;
    topSellingProducts: Array<{ productId: string; productName: string; unitsSold: number }>;
    revenueByCategory: {
      services: number;
      products: number;
    };
  };
  createdAt: Timestamp;
}
```

### Firestore Indexes

**`firestore.indexes.json`**
```json
{
  "indexes": [
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "technicianId", "order": "ASCENDING" },
        { "fieldPath": "scheduledDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "technicianId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "scheduledDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "supplierId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "enrollments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "traineeId", "order": "ASCENDING" },
        { "fieldPath": "enrolledAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "chatId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## Security Rules

**`firestore.rules`**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ===== Helper Functions =====

    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return request.auth.token.role;
    }

    function isAdmin() {
      return getUserRole() == 'admin';
    }

    function isCustomer() {
      return getUserRole() == 'customer';
    }

    function isTechnician() {
      return getUserRole() == 'technician';
    }

    function isSupplier() {
      return getUserRole() == 'supplier';
    }

    function isTrainee() {
      return getUserRole() == 'trainee';
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isValidRole(role) {
      return role in ['customer', 'technician', 'supplier', 'admin', 'trainee'];
    }

    // ===== Users Collection =====

    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());

      allow create: if isAuthenticated()
        && isOwner(userId)
        && isValidRole(request.resource.data.role);

      allow update: if isAuthenticated()
        && (isOwner(userId) || isAdmin())
        && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'uid'])); // Prevent role/uid change
    }

    // ===== Bookings Collection =====

    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.customerId == request.auth.uid ||
        resource.data.technicianId == request.auth.uid
      );

      allow create: if isAuthenticated()
        && isCustomer()
        && request.resource.data.customerId == request.auth.uid;

      allow update: if isAuthenticated() && (
        isAdmin() ||
        (isTechnician() && resource.data.technicianId == request.auth.uid) // Technician can update assigned jobs
      );

      allow delete: if isAdmin();
    }

    // ===== Jobs Collection =====

    match /jobs/{jobId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.technicianId == request.auth.uid ||
        resource.data.customerId == request.auth.uid
      );

      allow create: if isAdmin(); // Only admin can create jobs (via Cloud Function)

      allow update: if isAuthenticated() && (
        isAdmin() ||
        (isTechnician() && resource.data.technicianId == request.auth.uid)
      );

      allow delete: if isAdmin();
    }

    // ===== Products Collection =====

    match /products/{productId} {
      allow read: if true; // Public catalog

      allow create: if isAuthenticated()
        && (isSupplier() || isAdmin())
        && request.resource.data.supplierId == request.auth.uid;

      allow update: if isAuthenticated() && (
        isAdmin() ||
        (isSupplier() && resource.data.supplierId == request.auth.uid)
      );

      allow delete: if isAuthenticated() && (
        isAdmin() ||
        (isSupplier() && resource.data.supplierId == request.auth.uid)
      );
    }

    // ===== Orders Collection =====

    match /orders/{orderId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.customerId == request.auth.uid ||
        // Supplier can see orders containing their products
        resource.data.items.hasAny([request.auth.uid]) // Simplified; actual check would be more complex
      );

      allow create: if isAuthenticated()
        && isCustomer()
        && request.resource.data.customerId == request.auth.uid;

      allow update: if isAuthenticated() && (
        isAdmin() ||
        isSupplier() // Suppliers can update shipping status
      );

      allow delete: if isAdmin();
    }

    // ===== Inventory Collection =====

    match /inventory/{inventoryId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        (isSupplier() && resource.data.supplierId == request.auth.uid)
      );

      allow write: if isAuthenticated() && (
        isAdmin() ||
        (isSupplier() && request.resource.data.supplierId == request.auth.uid)
      );
    }

    // ===== Courses Collection =====

    match /courses/{courseId} {
      allow read: if isAuthenticated(); // All authenticated users can browse courses

      allow write: if isAdmin(); // Only admin can create/edit courses
    }

    // ===== Enrollments Collection =====

    match /enrollments/{enrollmentId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.traineeId == request.auth.uid
      );

      allow create: if isAuthenticated()
        && isTrainee()
        && request.resource.data.traineeId == request.auth.uid;

      allow update: if isAuthenticated() && (
        isAdmin() ||
        (isTrainee() && resource.data.traineeId == request.auth.uid)
      );

      allow delete: if isAdmin();
    }

    // ===== Assessments Collection =====

    match /assessments/{assessmentId} {
      allow read: if isAuthenticated(); // Trainees need to read questions
      allow write: if isAdmin();
    }

    // ===== Certificates Collection =====

    match /certificates/{certificateId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.traineeId == request.auth.uid
      );

      allow write: if isAdmin(); // Only admin/Cloud Function can issue certificates
    }

    // ===== Chats Collection =====

    match /chats/{chatId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        request.auth.uid in resource.data.participants
      );

      allow create: if isAuthenticated()
        && request.auth.uid in request.resource.data.participants;

      allow update: if isAuthenticated() && (
        isAdmin() ||
        request.auth.uid in resource.data.participants
      );

      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated() && (
          isAdmin() ||
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants
        );

        allow create: if isAuthenticated()
          && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants
          && request.resource.data.senderId == request.auth.uid;
      }
    }

    // ===== Notifications Collection =====

    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && (
        isAdmin() ||
        resource.data.userId == request.auth.uid
      );

      allow update: if isAuthenticated()
        && resource.data.userId == request.auth.uid
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']); // Only allow marking as read

      allow create: if isAdmin(); // Only admin/Cloud Functions can create notifications
      allow delete: if isAdmin();
    }

    // ===== Analytics Collection =====

    match /analytics/{analyticsId} {
      allow read: if isAdmin();
      allow write: if false; // Only Cloud Functions can write analytics
    }
  }
}
```

**Security Rules Testing**
```bash
# Install emulator
firebase emulators:start --only firestore

# Run tests
npm test -- --testPathPattern=firestore.rules.test.ts
```

---

## Cloud Functions

### Functions Architecture

**`functions/src/index.ts`**
```typescript
import * as admin from 'firebase-admin';
admin.initializeApp();

// Export all functions
export * from './auth';
export * from './bookings';
export * from './orders';
export * from './chat';
export * from './notifications';
export * from './analytics';
export * from './training';
```

### Key Cloud Functions

#### 1. Booking Functions

**`functions/src/bookings.ts`**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Trigger when booking is created
export const onBookingCreated = functions
  .region('europe-west1')
  .firestore.document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data();

    // Send confirmation email to customer
    await sendBookingConfirmationEmail(booking);

    // Send SMS notification (using Twilio/Hubtel)
    await sendSMS(booking.customerPhone, `Booking confirmed! Ref: ${context.params.bookingId}`);

    // Create notification
    await admin.firestore().collection('notifications').add({
      userId: booking.customerId,
      type: 'booking-confirmation',
      title: 'Booking Confirmed',
      message: `Your ${booking.serviceType} service is scheduled for ${booking.scheduledDate}`,
      data: { bookingId: context.params.bookingId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });

// Assign technician to booking (called by admin)
export const assignTechnicianToBooking = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Verify admin
    if (!context.auth || context.auth.token.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can assign technicians');
    }

    const { bookingId, technicianId } = data;

    // Get technician details
    const technicianDoc = await admin.firestore().collection('users').doc(technicianId).get();
    const technician = technicianDoc.data();

    // Update booking
    await admin.firestore().collection('bookings').doc(bookingId).update({
      technicianId,
      technicianName: technician?.displayName,
      status: 'assigned',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create job for technician
    const bookingDoc = await admin.firestore().collection('bookings').doc(bookingId).get();
    const booking = bookingDoc.data();

    await admin.firestore().collection('jobs').add({
      bookingId,
      technicianId,
      customerId: booking?.customerId,
      serviceType: booking?.serviceType,
      scheduledDate: booking?.scheduledDate,
      location: booking?.location,
      status: 'assigned',
      timeline: {
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      earnings: booking?.pricing?.totalAmount * 0.6, // 60% to technician
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify technician
    await admin.firestore().collection('notifications').add({
      userId: technicianId,
      type: 'job-assigned',
      title: 'New Job Assigned',
      message: `${booking?.serviceType} service at ${booking?.location?.address}`,
      data: { bookingId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send push notification (FCM)
    await sendPushNotification(technicianId, 'New Job Assigned', `Service on ${booking?.scheduledDate}`);

    return { success: true };
  });
```

#### 2. Order Functions

**`functions/src/orders.ts`**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Process payment with Paystack
export const processPayment = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { orderId, paymentMethod, phoneNumber } = data;

    // Get order
    const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();
    const order = orderDoc.data();

    if (!order) {
      throw new functions.https.HttpsError('not-found', 'Order not found');
    }

    // Initialize Paystack payment
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: order.customerEmail,
        amount: order.summary.totalAmount * 100, // Paystack uses pesewas (GHS cents)
        currency: 'GHS',
        reference: orderId,
        channels: paymentMethod === 'mobile-money' ? ['mobile_money'] : ['card'],
        metadata: {
          orderId,
          customerId: order.customerId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${functions.config().paystack.secret}`,
        },
      }
    );

    return {
      authorizationUrl: paystackResponse.data.data.authorization_url,
      reference: paystackResponse.data.data.reference,
    };
  });

// Verify payment webhook
export const verifyPayment = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    // Verify Paystack signature
    const hash = crypto
      .createHmac('sha512', functions.config().paystack.secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      // Update order payment status
      await admin.firestore().collection('orders').doc(metadata.orderId).update({
        paymentStatus: 'paid',
        paymentReference: reference,
        status: 'processing',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update inventory
      const order = (await admin.firestore().collection('orders').doc(metadata.orderId).get()).data();
      for (const item of order?.items || []) {
        await admin.firestore().collection('products').doc(item.productId).update({
          stockQuantity: admin.firestore.FieldValue.increment(-item.quantity),
        });
      }

      // Notify customer
      await admin.firestore().collection('notifications').add({
        userId: metadata.customerId,
        type: 'order-confirmed',
        title: 'Payment Successful',
        message: `Your order ${metadata.orderId} is being processed`,
        data: { orderId: metadata.orderId },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.status(200).send('OK');
  });

// Trigger when order is created
export const onOrderCreated = functions
  .region('europe-west1')
  .firestore.document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();

    // Send confirmation email
    await sendOrderConfirmationEmail(order);

    // Notify suppliers
    const suppliers = new Set(order.items.map((item: any) => item.supplierId));
    for (const supplierId of suppliers) {
      await admin.firestore().collection('notifications').add({
        userId: supplierId,
        type: 'new-order',
        title: 'New Order Received',
        message: `Order ${context.params.orderId}`,
        data: { orderId: context.params.orderId },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return null;
  });
```

#### 3. Chat Functions

**`functions/src/chat.ts`**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Trigger when new message is sent
export const onMessageCreated = functions
  .region('europe-west1')
  .firestore.document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { chatId } = context.params;

    // Update chat's last message
    const chatRef = admin.firestore().collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();
    const chat = chatDoc.data();

    await chatRef.update({
      lastMessage: {
        text: message.text,
        senderId: message.senderId,
        timestamp: message.timestamp,
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Increment unread count for other participants
    const recipients = chat?.participants.filter((p: string) => p !== message.senderId) || [];

    for (const recipientId of recipients) {
      await chatRef.update({
        [`unreadCount.${recipientId}`]: admin.firestore.FieldValue.increment(1),
      });

      // Send push notification
      await sendPushNotification(
        recipientId,
        message.senderName,
        message.text.substring(0, 100)
      );

      // Create notification
      await admin.firestore().collection('notifications').add({
        userId: recipientId,
        type: 'chat-message',
        title: `Message from ${message.senderName}`,
        message: message.text.substring(0, 100),
        data: { chatId },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return null;
  });
```

#### 4. Training Functions

**`functions/src/training.ts`**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import PDFDocument from 'pdfkit';

// Issue certificate when course is completed
export const issueCertificate = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { enrollmentId } = data;

    // Get enrollment
    const enrollmentDoc = await admin.firestore().collection('enrollments').doc(enrollmentId).get();
    const enrollment = enrollmentDoc.data();

    if (!enrollment || enrollment.traineeId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid enrollment');
    }

    if (enrollment.progress.percentageComplete < 100) {
      throw new functions.https.HttpsError('failed-precondition', 'Course not completed');
    }

    // Generate certificate PDF
    const certificateId = admin.firestore().collection('certificates').doc().id;
    const verificationCode = `CERT-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const pdfBuffer = await generateCertificatePDF({
      traineeName: enrollment.traineeName,
      courseName: enrollment.courseName,
      issueDate: new Date(),
      verificationCode,
    });

    // Upload to Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(`certificates/${certificateId}.pdf`);
    await file.save(pdfBuffer, { contentType: 'application/pdf' });
    const certificateURL = await file.getSignedUrl({ action: 'read', expires: '01-01-2100' });

    // Create certificate document
    await admin.firestore().collection('certificates').doc(certificateId).set({
      traineeId: enrollment.traineeId,
      traineeName: enrollment.traineeName,
      courseId: enrollment.courseId,
      courseName: enrollment.courseName,
      enrollmentId,
      issueDate: admin.firestore.FieldValue.serverTimestamp(),
      certificateURL: certificateURL[0],
      verificationCode,
    });

    // Update enrollment
    await admin.firestore().collection('enrollments').doc(enrollmentId).update({
      certificateIssued: true,
      certificateId,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify trainee
    await admin.firestore().collection('notifications').add({
      userId: enrollment.traineeId,
      type: 'certificate-issued',
      title: 'Certificate Earned!',
      message: `Congratulations! Your certificate for ${enrollment.courseName} is ready`,
      data: { certificateId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { certificateId, certificateURL: certificateURL[0] };
  });

async function generateCertificatePDF(data: any) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Design certificate
    doc.fontSize(30).text('Certificate of Completion', { align: 'center' });
    doc.moveDown();
    doc.fontSize(20).text(data.traineeName, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`has successfully completed the course:`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(22).text(data.courseName, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(12).text(`Issue Date: ${data.issueDate.toLocaleDateString()}`, { align: 'center' });
    doc.fontSize(10).text(`Verification Code: ${data.verificationCode}`, { align: 'center' });

    doc.end();
  });
}
```

#### 5. Analytics Functions

**`functions/src/analytics.ts`**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Generate daily analytics report (scheduled function)
export const generateDailyReport = functions
  .region('europe-west1')
  .pubsub.schedule('0 0 * * *') // Every day at midnight
  .timeZone('Africa/Accra')
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

    // Aggregate metrics
    const bookingsSnapshot = await admin.firestore()
      .collection('bookings')
      .where('createdAt', '>=', startOfDay)
      .where('createdAt', '<=', endOfDay)
      .get();

    const ordersSnapshot = await admin.firestore()
      .collection('orders')
      .where('createdAt', '>=', startOfDay)
      .where('createdAt', '<=', endOfDay)
      .get();

    const totalBookings = bookingsSnapshot.size;
    const totalOrders = ordersSnapshot.size;

    let totalRevenue = 0;
    let serviceRevenue = 0;
    let productRevenue = 0;

    bookingsSnapshot.forEach((doc) => {
      const booking = doc.data();
      if (booking.paymentStatus === 'paid') {
        serviceRevenue += booking.pricing.totalAmount;
      }
    });

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      if (order.paymentStatus === 'paid') {
        productRevenue += order.summary.totalAmount;
      }
    });

    totalRevenue = serviceRevenue + productRevenue;

    // Save analytics
    const dateId = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
    await admin.firestore().collection('analytics').doc(dateId).set({
      date: admin.firestore.Timestamp.fromDate(yesterday),
      metrics: {
        totalBookings,
        totalOrders,
        totalRevenue,
        revenueByCategory: {
          services: serviceRevenue,
          products: productRevenue,
        },
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Daily report generated for ${dateId}`);
    return null;
  });
```

#### 6. Notification Helper

**`functions/src/notifications.ts`**
```typescript
import * as admin from 'firebase-admin';

export async function sendPushNotification(userId: string, title: string, body: string) {
  // Get user's FCM token from user document
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const fcmToken = userDoc.data()?.fcmToken;

  if (!fcmToken) {
    console.log(`No FCM token for user ${userId}`);
    return;
  }

  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };

  try {
    await admin.messaging().send(message);
    console.log(`Push notification sent to ${userId}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

export async function sendBookingConfirmationEmail(booking: any) {
  // Implement with SendGrid or similar
  console.log('Sending booking confirmation email:', booking);
}

export async function sendOrderConfirmationEmail(order: any) {
  // Implement with SendGrid
  console.log('Sending order confirmation email:', order);
}

export async function sendSMS(phoneNumber: string, message: string) {
  // Implement with Twilio or Hubtel (Ghana)
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
}
```

---

## Firebase Storage Structure

```
gs://supremo-ac.appspot.com/
├── users/
│   └── {userId}/
│       ├── profile-photo.jpg
│       └── documents/
├── products/
│   └── {productId}/
│       ├── main.jpg
│       ├── image-1.jpg
│       └── image-2.jpg
├── jobs/
│   └── {jobId}/
│       ├── before-1.jpg
│       ├── before-2.jpg
│       ├── after-1.jpg
│       └── signature.png
├── courses/
│   └── {courseId}/
│       ├── thumbnail.jpg
│       ├── modules/
│       │   └── {moduleId}/
│       │       ├── video.mp4
│       │       └── resources/
│       │           ├── slides.pdf
│       │           └── manual.pdf
├── certificates/
│   └── {certificateId}.pdf
└── chat-attachments/
    └── {chatId}/
        └── {messageId}/
            └── attachment.jpg
```

### Storage Security Rules

**`storage.rules`**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return request.auth.token.role == 'admin';
    }

    // User profile photos
    match /users/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (isOwner(userId) || isAdmin());
    }

    // Product images (public read, supplier/admin write)
    match /products/{productId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated() && (request.auth.token.role == 'supplier' || isAdmin());
    }

    // Job photos (technician and customer can read, technician can write)
    match /jobs/{jobId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.token.role == 'technician';
    }

    // Course materials (authenticated read, admin write)
    match /courses/{courseId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Certificates (owner and admin can read, only admin can write)
    match /certificates/{certificateId}.pdf {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Chat attachments
    match /chat-attachments/{chatId}/{messageId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
  }
}
```

---

## Firebase Cloud Messaging

### FCM Setup

**Frontend - Request Permission** (`src/lib/fcm.ts`):
```typescript
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function requestNotificationPermission(userId: string) {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY',
      });

      // Save token to user document
      await updateDoc(doc(db, 'users', userId), {
        fcmToken: token,
      });

      console.log('FCM token saved:', token);
      return token;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
}

export function listenForMessages(callback: (payload: any) => void) {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    callback(payload);
  });
}
```

**Service Worker** (`public/firebase-messaging-sw.js`):
```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "supremo-ac.firebaseapp.com",
  projectId: "supremo-ac",
  storageBucket: "supremo-ac.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

---

## State Management

### React Context Approach

**Authentication Context** (`src/contexts/AuthContext.tsx`):
```typescript
import { createContext, useContext, ReactNode } from 'react';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: (User & { role?: UserRole }) | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
```

**Firestore Hooks** (`src/hooks/useFirestore.ts`):
```typescript
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setData(documents);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

// Example usage in component:
// const { data: bookings, loading } = useCollection<Booking>('bookings', [
//   where('customerId', '==', user.uid),
//   orderBy('createdAt', 'desc'),
//   limit(10)
// ]);
```

---

## Cost Optimization

### Best Practices

1. **Firestore Read Optimization**
   - **Pagination**: Limit queries to 20-50 documents
   ```typescript
   const q = query(collection(db, 'products'), limit(20));
   ```
   - **Caching**: Use Firebase's offline persistence
   - **Selective Fields**: Don't read entire documents if you only need specific fields (use `select()` in queries when available)

2. **Storage Optimization**
   - Compress images before upload (use `sharp` or `imagemin`)
   - Use Firebase Storage CDN for faster delivery
   - Delete old/unused files regularly

3. **Cloud Functions Optimization**
   - Use appropriate instance sizes (default: 256MB)
   - Set timeouts (default: 60s, reduce if possible)
   - Use Pub/Sub for non-critical async tasks
   - Batch operations when possible

4. **Real-time Listeners**
   - Unsubscribe from listeners when component unmounts
   - Use `onSnapshot` only for data that needs real-time updates
   - For static data, use `getDocs()` instead

5. **Firebase Hosting**
   - Enable caching headers for static assets
   - Use Firebase CDN for global distribution

### Cost Monitoring

**Set up budget alerts in Firebase Console:**
- Firestore: Monitor reads/writes/deletes
- Storage: Monitor bandwidth and storage size
- Functions: Monitor invocations and compute time

**Estimated Monthly Costs (1,000 active users):**
- Firestore: ~$50 (assuming 100 reads/user/day)
- Storage: ~$20 (10GB storage, 100GB bandwidth)
- Functions: ~$30 (10,000 invocations/day)
- Hosting: Free (under 10GB/month)
- **Total: ~$100-150/month**

---

## Development Workflow

### Local Development with Emulators

**`firebase.json`**
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "functions": {
      "port": 5001
    },
    "storage": {
      "port": 9199
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

**Start Emulators:**
```bash
firebase emulators:start
```

**Connect Frontend to Emulators** (in development):
```typescript
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';
import { connectFunctionsEmulator } from 'firebase/functions';

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

### Deployment

**Deploy All:**
```bash
firebase deploy
```

**Deploy Specific Services:**
```bash
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only hosting
```

---

## Conclusion

This Firebase architecture provides a robust, scalable backend for the Supremo AC Services platform. Key benefits:

- **Security**: Role-based access control via custom claims and security rules
- **Scalability**: Auto-scaling Cloud Functions and Firestore
- **Cost-Efficiency**: Optimized queries, caching, and pagination
- **Real-time**: Live chat and notifications via Firestore and FCM
- **Reliability**: 99.9% uptime SLA from Firebase

**Next Steps:**
1. Review and approve this architecture
2. Set up Firebase project in console
3. Configure environment variables
4. Begin Phase 1 implementation
