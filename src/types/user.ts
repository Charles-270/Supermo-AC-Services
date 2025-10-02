/**
 * User Types and Interfaces
 * Defines the authentication and user profile structure for Supremo AC Services
 */

import { Timestamp } from 'firebase/firestore';

/**
 * User Roles
 * Defines 5 user types for the platform
 */
export type UserRole = 'customer' | 'technician' | 'supplier' | 'admin' | 'trainee';

/**
 * User Profile Interface
 * Stored in Firestore 'users' collection
 */
export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;

  // Role-specific metadata
  metadata: {
    // Customer-specific
    address?: string;
    preferredPaymentMethod?: 'cash' | 'momo' | 'card';

    // Technician-specific
    specialization?: string[];
    certifications?: string[];
    availability?: 'available' | 'busy' | 'offline';

    // Supplier-specific
    companyName?: string;
    businessRegNumber?: string;
    productCategories?: string[];

    // Admin-specific
    permissions?: string[];
    department?: string;

    // Trainee-specific
    enrolledCourses?: string[];
    completedCourses?: string[];
    certificationProgress?: number;
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;

  // Account status
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
}

/**
 * Authentication User Interface
 * Used in React state management (useAuth hook)
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role?: UserRole; // Fetched from Firestore after auth
  profile?: UserProfile; // Full profile data
}

/**
 * Authentication Context State
 * Passed through React Context
 */
export interface AuthContextState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Register Form Data
 * Used when creating new accounts
 */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;

  // Optional role-specific fields
  address?: string; // For customers
  specialization?: string[]; // For technicians
  companyName?: string; // For suppliers
}

/**
 * Login Form Data
 * Used for email/password authentication
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * User Role Display Names
 * For UI display
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  technician: 'Technician',
  supplier: 'Supplier',
  admin: 'Admin',
  trainee: 'Trainee',
};

/**
 * User Role Descriptions
 * For registration UI
 */
export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  customer: 'Book services, shop for AC units, track orders',
  technician: 'Manage jobs, communicate with customers, update job status',
  supplier: 'Manage product catalog, track inventory, fulfill orders',
  admin: 'Platform oversight, analytics, user management',
  trainee: 'Access training courses, track progress, earn certificates',
};

/**
 * Default User Profile
 * Template for creating new user profiles
 */
export const createDefaultUserProfile = (
  uid: string,
  email: string,
  role: UserRole,
  displayName: string
): Omit<UserProfile, 'createdAt' | 'updatedAt'> => ({
  uid,
  email,
  role,
  displayName,
  metadata: {},
  isActive: true,
  isEmailVerified: false,
  isPhoneVerified: false,
});
