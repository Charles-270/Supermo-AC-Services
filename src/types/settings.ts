/**
 * Platform Settings Types
 * Defines all configurable platform settings
 */

export interface BusinessHours {
  monday: { open: string; close: string; isOpen: boolean };
  tuesday: { open: string; close: string; isOpen: boolean };
  wednesday: { open: string; close: string; isOpen: boolean };
  thursday: { open: string; close: string; isOpen: boolean };
  friday: { open: string; close: string; isOpen: boolean };
  saturday: { open: string; close: string; isOpen: boolean };
  sunday: { open: string; close: string; isOpen: boolean };
}

export interface GeneralSettings {
  platformName: string;
  businessName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  region: string;
  country: string;
  businessHours: BusinessHours;
  serviceAreas: string[]; // Cities/regions served
  logoUrl?: string;
  faviconUrl?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  enabled: boolean;
  estimatedDuration: number; // in minutes
}

export interface ServiceSettings {
  serviceTypes: ServiceType[];
  defaultServiceFee: number;
  emergencyServiceFee: number;
  installationFeePercentage: number; // % of product price
  bookingAdvanceHours: number; // Minimum hours before booking
  maxBookingsPerDay: number;
  allowWeekendBookings: boolean;
  timeSlots: string[]; // e.g., ["09:00", "11:00", "14:00", "16:00"]
}

export interface PaymentSettings {
  acceptedMethods: string[]; // ['paystack', 'cash', 'bank-transfer']
  paystackPublicKey: string;
  paystackSecretKey?: string; // Should be in env, not here
  currency: string;
  currencySymbol: string;
  shippingFeeFlat: number;
  shippingFeePerKm?: number;
  taxRate: number; // GST/VAT percentage
  enabledPaymentMethods: {
    paystack: boolean;
    cash: boolean;
    bankTransfer: boolean;
    mobileMoney: boolean;
  };
}

export interface NotificationSettings {
  emailNotifications: {
    enabled: boolean;
    fromEmail: string;
    fromName: string;
    bookingConfirmation: boolean;
    orderConfirmation: boolean;
    statusUpdates: boolean;
    adminAlerts: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    provider: 'hubtel' | 'twilio' | 'none';
    bookingReminders: boolean;
    deliveryUpdates: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    webPush: boolean;
    mobilePush: boolean;
  };
  adminNotifications: {
    newBookings: boolean;
    newOrders: boolean;
    lowStock: boolean;
    pendingApprovals: boolean;
    customerMessages: boolean;
  };
}

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowNewRegistrations: boolean;
  requireEmailVerification: boolean;
  requireAdminApproval: boolean; // For non-customer roles
  maxLoginAttempts: number;
  sessionTimeout: number; // in minutes
  enableAnalytics: boolean;
  enableLiveChat: boolean;
  dataRetentionDays: number;
  features: {
    ecommerce: boolean;
    serviceBooking: boolean;
    training: boolean;
    liveChat: boolean;
    reviews: boolean;
  };
  limits: {
    maxOrderItems: number;
    maxFileUploadSize: number; // in MB
    maxImagesPerProduct: number;
  };
}

export interface PlatformSettings {
  general: GeneralSettings;
  service: ServiceSettings;
  payment: PaymentSettings;
  notifications: NotificationSettings;
  system: SystemSettings;
  updatedAt?: Date | { toDate: () => Date }; // Firestore Timestamp
  updatedBy?: string; // Admin UID
}

/**
 * Default settings structure
 */
export const DEFAULT_SETTINGS: PlatformSettings = {
  general: {
    platformName: 'Supremo AC Services',
    businessName: 'Supremo AC Services Ltd.',
    tagline: 'Your trusted HVAC experts in Ghana',
    contactEmail: 'info@supremo-ac.com',
    contactPhone: '+233 20 123 4567',
    address: '123 Independence Avenue',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    businessHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '15:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: false },
    },
    serviceAreas: ['Accra', 'Tema', 'Kasoa', 'Madina', 'Legon'],
  },
  service: {
    serviceTypes: [
      {
        id: 'installation',
        name: 'AC Installation',
        description: 'Professional air conditioning installation service',
        basePrice: 500,
        enabled: true,
        estimatedDuration: 240,
      },
      {
        id: 'repair',
        name: 'AC Repair',
        description: 'Expert AC repair and troubleshooting',
        basePrice: 200,
        enabled: true,
        estimatedDuration: 120,
      },
      {
        id: 'maintenance',
        name: 'AC Maintenance',
        description: 'Regular maintenance and servicing',
        basePrice: 150,
        enabled: true,
        estimatedDuration: 90,
      },
      {
        id: 'gas-refill',
        name: 'Gas Refill',
        description: 'AC gas recharge service',
        basePrice: 180,
        enabled: true,
        estimatedDuration: 60,
      },
    ],
    defaultServiceFee: 50,
    emergencyServiceFee: 100,
    installationFeePercentage: 10,
    bookingAdvanceHours: 24,
    maxBookingsPerDay: 10,
    allowWeekendBookings: true,
    timeSlots: ['08:00', '10:00', '12:00', '14:00', '16:00'],
  },
  payment: {
    acceptedMethods: ['paystack', 'cash', 'bank-transfer'],
    paystackPublicKey: '',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    shippingFeeFlat: 50,
    taxRate: 0, // Ghana VAT is 0% for most services
    enabledPaymentMethods: {
      paystack: true,
      cash: true,
      bankTransfer: true,
      mobileMoney: true,
    },
  },
  notifications: {
    emailNotifications: {
      enabled: true,
      fromEmail: 'noreply@supremo-ac.com',
      fromName: 'Supremo AC Services',
      bookingConfirmation: true,
      orderConfirmation: true,
      statusUpdates: true,
      adminAlerts: true,
    },
    smsNotifications: {
      enabled: false,
      provider: 'none',
      bookingReminders: false,
      deliveryUpdates: false,
    },
    pushNotifications: {
      enabled: false,
      webPush: false,
      mobilePush: false,
    },
    adminNotifications: {
      newBookings: true,
      newOrders: true,
      lowStock: true,
      pendingApprovals: true,
      customerMessages: true,
    },
  },
  system: {
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing system maintenance. Please check back soon.',
    allowNewRegistrations: true,
    requireEmailVerification: false,
    requireAdminApproval: true,
    maxLoginAttempts: 5,
    sessionTimeout: 120,
    enableAnalytics: true,
    enableLiveChat: true,
    dataRetentionDays: 365,
    features: {
      ecommerce: true,
      serviceBooking: true,
      training: true,
      liveChat: true,
      reviews: true,
    },
    limits: {
      maxOrderItems: 10,
      maxFileUploadSize: 5,
      maxImagesPerProduct: 6,
    },
  },
};
