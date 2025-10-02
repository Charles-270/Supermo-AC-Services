# Milestone 1: Firebase Setup + Authentication + Basic UI Shell

**Goal**: Create a fully functional authentication system with role-based access and basic dashboard routing for all 5 user types.

**Timeline**: 2 Weeks (10 working days)
**Success Criteria**: Users can register, login, and see role-specific dashboard shells

---

## Prerequisites & Setup

- [ ] **Install Required Tools**
  - [ ] Node.js (v18+) installed
  - [ ] Bun installed (`npm install -g bun`)
  - [ ] Firebase CLI installed (`npm install -g firebase-tools`)
  - [ ] Git installed and configured
  - [ ] VS Code (recommended) with extensions:
    - [ ] ES7+ React/Redux/React-Native snippets
    - [ ] Tailwind CSS IntelliSense
    - [ ] Firebase Explorer
    - [ ] TypeScript Vue Plugin (Volar)

- [ ] **Firebase Account Setup**
  - [ ] Google account created/available
  - [ ] Firebase console access verified (firebase.google.com)

---

## Phase 1: Project Initialization (Day 1)

### Task 1.1: Create Vite + React + TypeScript Project
**Priority**: P0 (Critical Path)
**Time Estimate**: 30 minutes

- [ ] Create new Vite project
  ```bash
  bun create vite supremo-ac-platform --template react-ts
  cd supremo-ac-platform
  ```
- [ ] Initialize Git repository
  ```bash
  git init
  git add .
  git commit -m "Initial commit: Vite + React + TypeScript"
  ```
- [ ] Verify project runs
  ```bash
  bun install
  bun dev
  ```
- [ ] Update `package.json` with project details:
  - [ ] Set `name` to `"supremo-ac-platform"`
  - [ ] Add `description`
  - [ ] Set `version` to `"0.1.0"`

---

### Task 1.2: Install Core Dependencies
**Priority**: P0 (Critical Path)
**Time Estimate**: 20 minutes

- [ ] Install TailwindCSS V4
  ```bash
  bun add -D tailwindcss@next @tailwindcss/vite@next
  ```
- [ ] Install ShadCN UI dependencies
  ```bash
  bun add class-variance-authority clsx tailwind-merge
  bun add lucide-react
  bun add @radix-ui/react-slot
  ```
- [ ] Install React Router
  ```bash
  bun add react-router-dom
  ```
- [ ] Install Firebase SDK
  ```bash
  bun add firebase
  ```
- [ ] Install development dependencies
  ```bash
  bun add -D @types/node
  ```

---

### Task 1.3: Configure TailwindCSS V4
**Priority**: P0 (Critical Path)
**Time Estimate**: 30 minutes

- [ ] Create `tailwind.config.ts`
  ```typescript
  import type { Config } from 'tailwindcss'

  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#0EA5E9',
            dark: '#0284C7',
          },
          accent: '#06B6D4',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
      },
    },
    plugins: [],
  } satisfies Config
  ```
- [ ] Update `vite.config.ts` to include Tailwind plugin
  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  })
  ```
- [ ] Update `src/index.css` with Tailwind directives
  ```css
  @import "tailwindcss";
  ```
- [ ] Add custom CSS variables for theme
  ```css
  :root {
    --primary: 14 165 233; /* #0EA5E9 */
    --primary-dark: 2 132 199; /* #0284C7 */
  }
  ```

---

### Task 1.4: Setup Path Aliases (TypeScript)
**Priority**: P1 (Important)
**Time Estimate**: 15 minutes

- [ ] Update `tsconfig.json` with path mapping
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  }
  ```
- [ ] Update `tsconfig.app.json` if it exists
- [ ] Create `src/lib/utils.ts` for utility functions
  ```typescript
  import { type ClassValue, clsx } from "clsx"
  import { twMerge } from "tailwind-merge"

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  ```

---

### Task 1.5: Setup ShadCN UI Components
**Priority**: P1 (Can be done in parallel with Firebase setup)
**Time Estimate**: 45 minutes

- [ ] Create `components.json` for ShadCN configuration
  ```json
  {
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "new-york",
    "rsc": false,
    "tsx": true,
    "tailwind": {
      "config": "tailwind.config.ts",
      "css": "src/index.css",
      "baseColor": "slate",
      "cssVariables": true
    },
    "aliases": {
      "components": "@/components",
      "utils": "@/lib/utils"
    }
  }
  ```
- [ ] Install ShadCN CLI
  ```bash
  bunx shadcn@latest init
  ```
- [ ] Install essential components:
  - [ ] Button: `bunx shadcn@latest add button`
  - [ ] Input: `bunx shadcn@latest add input`
  - [ ] Card: `bunx shadcn@latest add card`
  - [ ] Dialog: `bunx shadcn@latest add dialog`
  - [ ] Form: `bunx shadcn@latest add form`
  - [ ] Label: `bunx shadcn@latest add label`
  - [ ] Tabs: `bunx shadcn@latest add tabs`
  - [ ] Avatar: `bunx shadcn@latest add avatar`
  - [ ] DropdownMenu: `bunx shadcn@latest add dropdown-menu`

---

## Phase 2: Firebase Project Setup (Day 1-2)

### Task 2.1: Create Firebase Project
**Priority**: P0 (Critical Path)
**Time Estimate**: 20 minutes

- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Click "Add project"
- [ ] Enter project name: `supremo-ac-services` (or `supremo-ac`)
- [ ] Disable Google Analytics (can enable later)
- [ ] Wait for project creation
- [ ] Note down Project ID

---

### Task 2.2: Enable Firebase Services
**Priority**: P0 (Critical Path)
**Time Estimate**: 30 minutes

- [ ] **Enable Authentication**:
  - [ ] Go to Authentication → Get Started
  - [ ] Enable Email/Password provider
  - [ ] Enable Google Sign-in provider
    - [ ] Add project support email
  - [ ] Go to Settings → Authorized domains
  - [ ] Add `localhost` (should be there by default)

- [ ] **Create Firestore Database**:
  - [ ] Go to Firestore Database → Create Database
  - [ ] Select region: `europe-west1` (closest to Ghana)
  - [ ] Start in **Production mode** (we'll add rules next)

- [ ] **Enable Firebase Storage**:
  - [ ] Go to Storage → Get Started
  - [ ] Start in **Production mode**
  - [ ] Use same region: `europe-west1`

- [ ] **Enable Firebase Hosting**:
  - [ ] Go to Hosting → Get Started
  - [ ] (Configuration will be done via CLI later)

---

### Task 2.3: Register Web App in Firebase
**Priority**: P0 (Critical Path)
**Time Estimate**: 15 minutes

- [ ] In Firebase Console, click gear icon → Project Settings
- [ ] Scroll to "Your apps" section
- [ ] Click "</>" (Web app icon)
- [ ] Register app:
  - [ ] App nickname: `Supremo AC Web`
  - [ ] Check "Also set up Firebase Hosting"
  - [ ] Click "Register app"
- [ ] Copy Firebase config object (will use in next task)
- [ ] Click "Continue to console"

---

### Task 2.4: Configure Firebase SDK in Project
**Priority**: P0 (Critical Path)
**Time Estimate**: 30 minutes

- [ ] Create `.env.local` file in project root
  ```env
  VITE_FIREBASE_API_KEY=your_api_key_here
  VITE_FIREBASE_AUTH_DOMAIN=supremo-ac.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=supremo-ac
  VITE_FIREBASE_STORAGE_BUCKET=supremo-ac.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
  VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
  ```
- [ ] Add `.env.local` to `.gitignore`
- [ ] Create `src/lib/firebase.ts`
  ```typescript
  import { initializeApp } from 'firebase/app';
  import { getAuth } from 'firebase/auth';
  import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
  import { getStorage } from 'firebase/storage';
  import { getFunctions } from 'firebase/functions';

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
  export const functions = getFunctions(app, 'europe-west1');

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support offline persistence');
    }
  });
  ```
- [ ] Test Firebase initialization (no errors in console)

---

### Task 2.5: Setup Firebase CLI and Initialize Project
**Priority**: P1 (Important)
**Time Estimate**: 25 minutes

- [ ] Login to Firebase CLI
  ```bash
  firebase login
  ```
- [ ] Initialize Firebase in project
  ```bash
  firebase init
  ```
- [ ] Select features:
  - [ ] Firestore
  - [ ] Functions (skip for now, will add later)
  - [ ] Hosting
  - [ ] Storage
  - [ ] Emulators
- [ ] Configuration:
  - [ ] Use existing project: Select `supremo-ac` (or your project ID)
  - [ ] Firestore rules: `firestore.rules`
  - [ ] Firestore indexes: `firestore.indexes.json`
  - [ ] Hosting public directory: `dist`
  - [ ] Single-page app: `Yes`
  - [ ] GitHub deployment: `No` (for now)
  - [ ] Emulators: Select Auth, Firestore, Storage
- [ ] Verify `firebase.json` created
- [ ] Verify `.firebaserc` created

---

## Phase 3: Authentication System (Day 2-3)

### Task 3.1: Create User Roles Type System
**Priority**: P0 (Critical Path)
**Time Estimate**: 15 minutes

- [ ] Create `src/types/user.ts`
  ```typescript
  export type UserRole = 'customer' | 'technician' | 'supplier' | 'admin' | 'trainee';

  export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    phoneNumber?: string;
    createdAt: Date;
    lastLogin: Date;
  }

  export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role?: UserRole;
  }
  ```

---

### Task 3.2: Create Authentication Hook
**Priority**: P0 (Critical Path)
**Time Estimate**: 1 hour

- [ ] Create `src/hooks/useAuth.ts`
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
    sendPasswordResetEmail,
    onAuthStateChanged
  } from 'firebase/auth';
  import { auth } from '@/lib/firebase';
  import { UserRole, AuthUser } from '@/types/user';

  export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const tokenResult = await firebaseUser.getIdTokenResult();
          const role = tokenResult.claims.role as UserRole;
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    }, []);

    const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Note: Custom claims will be set via Cloud Function
      // For now, we'll store role in Firestore
      await sendEmailVerification(userCredential.user);
      return userCredential.user;
    };

    const signIn = async (email: string, password: string) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    };

    const signInWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
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

### Task 3.3: Create Authentication Context
**Priority**: P0 (Critical Path)
**Time Estimate**: 30 minutes

- [ ] Create `src/contexts/AuthContext.tsx`
  ```typescript
  import { createContext, useContext, ReactNode } from 'react';
  import { useAuth } from '@/hooks/useAuth';
  import { AuthUser, UserRole } from '@/types/user';
  import { User } from 'firebase/auth';

  interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<User>;
    signIn: (email: string, password: string) => Promise<User>;
    signInWithGoogle: () => Promise<User>;
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

---

### Task 3.4: Create Firestore User Profile Management
**Priority**: P0 (Critical Path)
**Time Estimate**: 45 minutes

- [ ] Create `src/services/userService.ts`
  ```typescript
  import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
  import { db } from '@/lib/firebase';
  import { UserRole, UserProfile } from '@/types/user';

  export const createUserProfile = async (
    uid: string,
    email: string,
    displayName: string,
    role: UserRole
  ) => {
    const userRef = doc(db, 'users', uid);

    await setDoc(userRef, {
      uid,
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true,
      emailVerified: false,
    });
  };

  export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  };

  export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  export const updateLastLogin = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
    });
  };
  ```
- [ ] Update `useAuth` hook to create user profile on signup
- [ ] Update `useAuth` hook to call `updateLastLogin` on signin

---

### Task 3.5: Build Login Page UI
**Priority**: P0 (Critical Path)
**Time Estimate**: 1.5 hours

- [ ] Create `src/pages/auth/LoginPage.tsx`
  - [ ] Email/password form with validation
  - [ ] Google sign-in button
  - [ ] "Forgot password" link
  - [ ] "Create account" link
  - [ ] Loading states
  - [ ] Error handling and display
- [ ] Use ShadCN components:
  - [ ] Card for layout
  - [ ] Input for email/password
  - [ ] Button for submit and Google sign-in
  - [ ] Label for form fields
- [ ] Add form validation (email format, password strength)
- [ ] Integrate with `useAuthContext` hook

---

### Task 3.6: Build Registration Page UI
**Priority**: P0 (Critical Path)
**Time Estimate**: 2 hours

- [ ] Create `src/pages/auth/RegisterPage.tsx`
  - [ ] Full name input
  - [ ] Email input
  - [ ] Password input (with strength indicator)
  - [ ] Confirm password input
  - [ ] Role selection (radio buttons or select)
    - [ ] Customer (default, highlighted)
    - [ ] Technician
    - [ ] Supplier
    - [ ] Trainee
    - [ ] (Admin role only assignable by existing admin)
  - [ ] Terms & conditions checkbox
  - [ ] Submit button
  - [ ] Google sign-up button
  - [ ] "Already have account" link
- [ ] Form validation:
  - [ ] All fields required
  - [ ] Email format validation
  - [ ] Password min 8 characters
  - [ ] Passwords match
  - [ ] Terms accepted
- [ ] Success state (show "Check email for verification")
- [ ] Error handling

---

### Task 3.7: Build Password Reset Flow
**Priority**: P1 (Important, not blocking)
**Time Estimate**: 45 minutes

- [ ] Create `src/pages/auth/ForgotPasswordPage.tsx`
  - [ ] Email input
  - [ ] Submit button
  - [ ] Back to login link
- [ ] Success message after email sent
- [ ] Error handling (email not found, etc.)

---

## Phase 4: Firestore Setup (Day 3-4)

### Task 4.1: Create Initial Firestore Collections
**Priority**: P0 (Critical Path)
**Time Estimate**: 30 minutes

- [ ] In Firebase Console → Firestore Database
- [ ] Create collections (manually add 1 dummy document each, then delete):
  - [ ] `users`
  - [ ] `bookings`
  - [ ] `products`
  - [ ] `orders`
  - [ ] `chats`
  - [ ] `notifications`

---

### Task 4.2: Setup Firestore Security Rules
**Priority**: P0 (Critical Path)
**Time Estimate**: 1.5 hours

- [ ] Edit `firestore.rules` file
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {

      // Helper functions
      function isAuthenticated() {
        return request.auth != null;
      }

      function getUserRole() {
        return request.auth.token.role;
      }

      function isAdmin() {
        return getUserRole() == 'admin';
      }

      function isOwner(userId) {
        return request.auth.uid == userId;
      }

      // Users collection
      match /users/{userId} {
        allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
        allow create: if isAuthenticated() && isOwner(userId);
        allow update: if isAuthenticated() && (isOwner(userId) || isAdmin());
      }

      // Bookings (basic rules, will expand later)
      match /bookings/{bookingId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isAuthenticated();
      }

      // Products (public read for now)
      match /products/{productId} {
        allow read: if true;
        allow write: if isAuthenticated();
      }

      // Orders
      match /orders/{orderId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isAuthenticated();
      }

      // Chats
      match /chats/{chatId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isAuthenticated();

        match /messages/{messageId} {
          allow read: if isAuthenticated();
          allow create: if isAuthenticated();
        }
      }

      // Notifications
      match /notifications/{notificationId} {
        allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
        allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      }
    }
  }
  ```
- [ ] Deploy rules: `firebase deploy --only firestore:rules`
- [ ] Test rules in Firebase Console Rules Playground

---

### Task 4.3: Create Firestore Indexes Configuration
**Priority**: P1 (Important)
**Time Estimate**: 30 minutes

- [ ] Edit `firestore.indexes.json`
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
        "collectionGroup": "orders",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "customerId", "order": "ASCENDING" },
          { "fieldPath": "createdAt", "order": "DESCENDING" }
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
- [ ] Deploy indexes: `firebase deploy --only firestore:indexes`

---

### Task 4.4: Create Firestore Hooks for Data Fetching
**Priority**: P1 (Can be done in parallel)
**Time Estimate**: 45 minutes

- [ ] Create `src/hooks/useFirestore.ts`
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

  export function useDocument<T = DocumentData>(collectionName: string, documentId: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      if (!documentId) {
        setLoading(false);
        return;
      }

      const docRef = doc(db, collectionName, documentId);

      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData({ id: snapshot.id, ...snapshot.data() } as T);
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          setError(err as Error);
          setLoading(false);
        }
      );

      return unsubscribe;
    }, [collectionName, documentId]);

    return { data, loading, error };
  }
  ```

---

## Phase 5: Routing & Dashboard Shells (Day 4-5)

### Task 5.1: Setup React Router
**Priority**: P0 (Critical Path)
**Time Estimate**: 1 hour

- [ ] Create `src/routes/index.tsx`
  ```typescript
  import { createBrowserRouter, Navigate } from 'react-router-dom';
  import { RootLayout } from '@/layouts/RootLayout';
  import { AuthLayout } from '@/layouts/AuthLayout';
  import { DashboardLayout } from '@/layouts/DashboardLayout';

  // Auth pages
  import LoginPage from '@/pages/auth/LoginPage';
  import RegisterPage from '@/pages/auth/RegisterPage';
  import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

  // Dashboard pages (shells for now)
  import CustomerDashboard from '@/pages/dashboards/CustomerDashboard';
  import TechnicianDashboard from '@/pages/dashboards/TechnicianDashboard';
  import SupplierDashboard from '@/pages/dashboards/SupplierDashboard';
  import AdminDashboard from '@/pages/dashboards/AdminDashboard';
  import TraineeDashboard from '@/pages/dashboards/TraineeDashboard';

  export const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/auth/login" replace />,
        },
        {
          path: 'auth',
          element: <AuthLayout />,
          children: [
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
            { path: 'forgot-password', element: <ForgotPasswordPage /> },
          ],
        },
        {
          path: 'dashboard',
          element: <DashboardLayout />,
          children: [
            { path: 'customer', element: <CustomerDashboard /> },
            { path: 'technician', element: <TechnicianDashboard /> },
            { path: 'supplier', element: <SupplierDashboard /> },
            { path: 'admin', element: <AdminDashboard /> },
            { path: 'trainee', element: <TraineeDashboard /> },
          ],
        },
      ],
    },
  ]);
  ```
- [ ] Update `src/main.tsx` to use router
  ```typescript
  import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import { RouterProvider } from 'react-router-dom'
  import { AuthProvider } from '@/contexts/AuthContext'
  import { router } from '@/routes'
  import './index.css'

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StrictMode>,
  )
  ```

---

### Task 5.2: Create Protected Route Component
**Priority**: P0 (Critical Path)
**Time Estimate**: 45 minutes

- [ ] Create `src/components/ProtectedRoute.tsx`
  ```typescript
  import { Navigate, useLocation } from 'react-router-dom';
  import { useAuthContext } from '@/contexts/AuthContext';
  import { UserRole } from '@/types/user';
  import { Loader2 } from 'lucide-react';

  interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
  }

  export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuthContext();
    const location = useLocation();

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
      // Redirect to their appropriate dashboard
      return <Navigate to={`/dashboard/${user.role}`} replace />;
    }

    return <>{children}</>;
  }
  ```
- [ ] Update router to use `ProtectedRoute` for dashboard routes

---

### Task 5.3: Create Layout Components
**Priority**: P0 (Critical Path)
**Time Estimate**: 2 hours

- [ ] Create `src/layouts/RootLayout.tsx`
  ```typescript
  import { Outlet } from 'react-router-dom';

  export function RootLayout() {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }
  ```

- [ ] Create `src/layouts/AuthLayout.tsx`
  ```typescript
  import { Outlet, Navigate } from 'react-router-dom';
  import { useAuthContext } from '@/contexts/AuthContext';

  export function AuthLayout() {
    const { user, loading } = useAuthContext();

    if (loading) {
      return <div>Loading...</div>;
    }

    // If user is already authenticated, redirect to their dashboard
    if (user && user.role) {
      return <Navigate to={`/dashboard/${user.role}`} replace />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    );
  }
  ```

- [ ] Create `src/layouts/DashboardLayout.tsx`
  - [ ] Header/navbar with:
    - [ ] Logo
    - [ ] Navigation links (role-specific)
    - [ ] User profile dropdown (avatar, name, sign out)
  - [ ] Sidebar (optional, can be added later)
  - [ ] Main content area with `<Outlet />`
  - [ ] Footer (optional)
- [ ] Make responsive (mobile hamburger menu)

---

### Task 5.4: Create Dashboard Shell Pages
**Priority**: P0 (Critical Path)
**Time Estimate**: 1.5 hours

- [ ] Create `src/pages/dashboards/CustomerDashboard.tsx`
  ```typescript
  import { useAuthContext } from '@/contexts/AuthContext';
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

  export default function CustomerDashboard() {
    const { user } = useAuthContext();

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user?.displayName}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Book a Service</CardTitle>
              <CardDescription>Schedule AC installation, repair, or maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Shop Products</CardTitle>
              <CardDescription>Browse AC units and spare parts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>Track your orders and bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  ```

- [ ] Create `src/pages/dashboards/TechnicianDashboard.tsx` (similar structure)
  - [ ] "Today's Jobs" card
  - [ ] "Earnings" card
  - [ ] "Performance" card

- [ ] Create `src/pages/dashboards/SupplierDashboard.tsx`
  - [ ] "Products" card
  - [ ] "Orders" card
  - [ ] "Inventory" card

- [ ] Create `src/pages/dashboards/AdminDashboard.tsx`
  - [ ] "Overview" card (metrics)
  - [ ] "Bookings" card
  - [ ] "Users" card

- [ ] Create `src/pages/dashboards/TraineeDashboard.tsx`
  - [ ] "My Courses" card
  - [ ] "Progress" card
  - [ ] "Certificates" card

---

### Task 5.5: Implement Role-Based Navigation
**Priority**: P1 (Important)
**Time Estimate**: 1 hour

- [ ] Create `src/components/DashboardNav.tsx`
  - [ ] Show different nav links based on `user.role`
  - [ ] Customer: Bookings, Shop, Orders, Chat
  - [ ] Technician: Jobs, Earnings, Profile
  - [ ] Supplier: Products, Orders, Inventory
  - [ ] Admin: Dashboard, Bookings, Orders, Users, Analytics
  - [ ] Trainee: Courses, My Learning, Certificates
- [ ] Integrate into `DashboardLayout`
- [ ] Add active link highlighting

---

## Phase 6: Firebase Hosting Setup (Day 5)

### Task 6.1: Configure Firebase Hosting
**Priority**: P1 (Can be done in parallel)
**Time Estimate**: 30 minutes

- [ ] Verify `firebase.json` hosting config:
  ```json
  {
    "hosting": {
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  }
  ```
- [ ] Add build script to `package.json`
  ```json
  {
    "scripts": {
      "build": "tsc && vite build",
      "preview": "vite preview"
    }
  }
  ```

---

### Task 6.2: First Deployment
**Priority**: P1 (Not blocking)
**Time Estimate**: 20 minutes

- [ ] Build production version
  ```bash
  bun run build
  ```
- [ ] Test build locally
  ```bash
  bun run preview
  ```
- [ ] Deploy to Firebase Hosting
  ```bash
  firebase deploy --only hosting
  ```
- [ ] Test deployed app at `https://supremo-ac.web.app` (or custom domain)
- [ ] Verify auth flow works on deployed version

---

## Phase 7: Testing & Polish (Day 5)

### Task 7.1: Manual Testing Checklist
**Priority**: P0 (Critical)
**Time Estimate**: 1.5 hours

- [ ] **Authentication Flow**:
  - [ ] User can register with email/password (all 5 roles)
  - [ ] User receives verification email
  - [ ] User can log in with email/password
  - [ ] User can log in with Google
  - [ ] User can reset password
  - [ ] User can log out
  - [ ] Logged-in user cannot access auth pages (redirects to dashboard)
  - [ ] Logged-out user cannot access dashboard (redirects to login)

- [ ] **Role-Based Access**:
  - [ ] Customer sees customer dashboard
  - [ ] Technician sees technician dashboard
  - [ ] Supplier sees supplier dashboard
  - [ ] Admin sees admin dashboard
  - [ ] Trainee sees trainee dashboard
  - [ ] User cannot access other role's dashboard (redirects to their own)

- [ ] **Firestore Rules**:
  - [ ] User can read their own profile
  - [ ] User cannot read other users' profiles (unless admin)
  - [ ] User can update their own profile
  - [ ] Test in Firebase Console Rules Playground

- [ ] **UI/UX**:
  - [ ] All pages responsive (mobile, tablet, desktop)
  - [ ] Loading states display correctly
  - [ ] Error messages display correctly
  - [ ] Success messages display correctly
  - [ ] Navigation works correctly
  - [ ] Links/buttons have hover states
  - [ ] Forms validate correctly

---

### Task 7.2: Setup Firebase Emulators for Development
**Priority**: P1 (Recommended)
**Time Estimate**: 45 minutes

- [ ] Verify emulator configuration in `firebase.json`
  ```json
  {
    "emulators": {
      "auth": { "port": 9099 },
      "firestore": { "port": 8080 },
      "storage": { "port": 9199 },
      "ui": { "enabled": true, "port": 4000 }
    }
  }
  ```
- [ ] Update `src/lib/firebase.ts` to connect to emulators in dev
  ```typescript
  if (import.meta.env.DEV) {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  }
  ```
- [ ] Start emulators
  ```bash
  firebase emulators:start
  ```
- [ ] Test auth flow with emulators
- [ ] Create seed data script (optional)

---

### Task 7.3: Code Quality & Documentation
**Priority**: P1 (Important)
**Time Estimate**: 1 hour

- [ ] Add JSDoc comments to all functions/hooks
- [ ] Create `README.md` with:
  - [ ] Project setup instructions
  - [ ] Environment variables setup
  - [ ] Firebase configuration steps
  - [ ] Development commands
  - [ ] Deployment instructions
- [ ] Create `.env.example` file
  ```env
  VITE_FIREBASE_API_KEY=
  VITE_FIREBASE_AUTH_DOMAIN=
  VITE_FIREBASE_PROJECT_ID=
  VITE_FIREBASE_STORAGE_BUCKET=
  VITE_FIREBASE_MESSAGING_SENDER_ID=
  VITE_FIREBASE_APP_ID=
  ```
- [ ] Update `.gitignore` (ensure `.env.local`, `dist`, `node_modules` are ignored)
- [ ] Run linter and fix issues
  ```bash
  bun lint
  ```

---

### Task 7.4: Performance Optimization
**Priority**: P2 (Nice to have)
**Time Estimate**: 30 minutes

- [ ] Enable code splitting for dashboard routes (lazy loading)
  ```typescript
  const CustomerDashboard = lazy(() => import('@/pages/dashboards/CustomerDashboard'));
  ```
- [ ] Add `<Suspense>` fallback for lazy-loaded routes
- [ ] Optimize images (compress, use WebP)
- [ ] Check Lighthouse score (aim for 90+)

---

## Success Checklist

### Milestone 1 Complete When:

- [x] **Project Setup**
  - [ ] Vite + React + TypeScript project running
  - [ ] TailwindCSS V4 configured and working
  - [ ] ShadCN UI components installed and usable
  - [ ] Path aliases working (`@/` imports)

- [x] **Firebase Setup**
  - [ ] Firebase project created
  - [ ] Authentication enabled (Email/Password, Google)
  - [ ] Firestore database created
  - [ ] Storage enabled
  - [ ] Firebase SDK configured in app
  - [ ] Environment variables set up

- [x] **Authentication**
  - [ ] User can register (email/password)
  - [ ] User can login (email/password)
  - [ ] User can login (Google)
  - [ ] User can reset password
  - [ ] User can logout
  - [ ] Email verification sent on registration
  - [ ] Auth state persists on page refresh
  - [ ] User profile created in Firestore on registration

- [x] **Firestore**
  - [ ] Core collections created (users, bookings, products, orders, chats, notifications)
  - [ ] Security rules deployed and working
  - [ ] Indexes configured
  - [ ] User can read/write to allowed collections

- [x] **Routing & UI**
  - [ ] React Router configured
  - [ ] Protected routes working
  - [ ] Role-based redirects working (user lands on correct dashboard)
  - [ ] 5 dashboard shells created (Customer, Technician, Supplier, Admin, Trainee)
  - [ ] Dashboard layout with navigation
  - [ ] Responsive design (mobile, tablet, desktop)

- [x] **Deployment**
  - [ ] Firebase Hosting configured
  - [ ] App deployed to Firebase Hosting
  - [ ] Deployed app works correctly

---

## Troubleshooting

### Common Issues:

1. **Firebase initialization errors**
   - Verify all environment variables are set correctly
   - Check Firebase console for project ID match
   - Ensure Firebase services are enabled in console

2. **Auth state not persisting**
   - Check `onAuthStateChanged` is set up correctly
   - Verify token refresh is working
   - Check browser storage (IndexedDB for Firestore persistence)

3. **Security rules blocking reads/writes**
   - Test rules in Firebase Console Rules Playground
   - Verify custom claims are set (will need Cloud Function later)
   - Check user is authenticated before Firestore operations

4. **Role not showing up on user object**
   - Custom claims require Cloud Function (will add in Milestone 2)
   - For now, read role from Firestore user document
   - Update `useAuth` hook to fetch role from Firestore

5. **Build errors with Vite/TypeScript**
   - Run `bun install` again
   - Clear `.vite` cache folder
   - Check `tsconfig.json` paths are correct

6. **Deployment fails**
   - Verify `firebase.json` public directory is `dist`
   - Run `bun run build` before deploy
   - Check Firebase CLI is logged in (`firebase login`)

---

## Next Steps (Milestone 2)

After Milestone 1 is complete, Milestone 2 will focus on:
- Customer service booking flow (full implementation)
- Firestore data models for bookings
- Cloud Functions (booking confirmation emails, technician assignment)
- Admin dashboard to view and manage bookings
- Payment integration setup (Paystack)

---

**Estimated Total Time: 10 working days (2 weeks)**

**Critical Path Tasks** (must be done sequentially):
1. Project initialization → Firebase setup → Auth system → Routing → Dashboard shells

**Parallel Tasks** (can be done simultaneously):
- ShadCN UI setup (while Firebase is configuring)
- Firestore hooks (while building auth UI)
- Dashboard styling (while testing auth flow)
