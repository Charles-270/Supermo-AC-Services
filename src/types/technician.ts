/**
 * Technician & Team Type Definitions
 * Based on industry research of HVAC field service teams
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Technician Experience Levels
 * Based on years of experience and capabilities
 */
export type TechnicianLevel =
  | 'trainee'      // 0-1 year, learning the trade
  | 'junior'       // 1-3 years, basic repairs
  | 'technician'   // 3-5 years, independent work
  | 'senior'       // 5-7 years, complex diagnostics
  | 'lead'         // 7+ years, team leadership
  | 'supervisor';  // Manages multiple teams

export const TECHNICIAN_LEVEL_LABELS: Record<TechnicianLevel, string> = {
  trainee: 'Trainee',
  junior: 'Junior Technician',
  technician: 'Technician',
  senior: 'Senior Technician',
  lead: 'Lead Technician',
  supervisor: 'Supervisor',
};

export const TECHNICIAN_LEVEL_COLORS: Record<TechnicianLevel, string> = {
  trainee: 'bg-gray-100 text-gray-700',
  junior: 'bg-blue-100 text-blue-700',
  technician: 'bg-green-100 text-green-700',
  senior: 'bg-purple-100 text-purple-700',
  lead: 'bg-orange-100 text-orange-700',
  supervisor: 'bg-red-100 text-red-700',
};

/**
 * Technical Skills & Specializations
 */
export type TechnicianSkill =
  | 'ac_installation'           // Install new AC units
  | 'ac_repair'                 // Repair AC systems
  | 'refrigeration'             // Refrigerant handling, leak detection
  | 'electrical'                // Electrical wiring, circuits
  | 'preventive_maintenance'    // Regular servicing, filter changes
  | 'emergency_service'         // After-hours urgent repairs
  | 'commercial_systems'        // Large commercial HVAC
  | 'residential_systems'       // Home AC units
  | 'ductwork'                  // Duct installation/repair
  | 'hvac_controls'             // Thermostats, automation
  | 'diagnostics'               // Troubleshooting, testing
  | 'welding';                  // Pipe welding, fabrication

export const SKILL_LABELS: Record<TechnicianSkill, string> = {
  ac_installation: 'AC Installation',
  ac_repair: 'AC Repair',
  refrigeration: 'Refrigeration',
  electrical: 'Electrical Systems',
  preventive_maintenance: 'Preventive Maintenance',
  emergency_service: 'Emergency Service',
  commercial_systems: 'Commercial Systems',
  residential_systems: 'Residential Systems',
  ductwork: 'Ductwork',
  hvac_controls: 'HVAC Controls',
  diagnostics: 'Diagnostics',
  welding: 'Welding & Fabrication',
};

export const SKILL_ICONS: Record<TechnicianSkill, string> = {
  ac_installation: '🔧',
  ac_repair: '🛠️',
  refrigeration: '❄️',
  electrical: '⚡',
  preventive_maintenance: '🔍',
  emergency_service: '🚨',
  commercial_systems: '🏢',
  residential_systems: '🏠',
  ductwork: '🌬️',
  hvac_controls: '🎛️',
  diagnostics: '📊',
  welding: '🔥',
};

/**
 * Professional Certifications
 */
export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Timestamp;
  expiryDate?: Timestamp;
  certificateNumber?: string;
  certificateUrl?: string; // Firebase Storage URL
  isVerified: boolean;
}

/**
 * Technician Availability Status
 */
export type AvailabilityStatus =
  | 'available'     // Ready for new jobs
  | 'busy'          // Currently on a job
  | 'unavailable'   // Off duty, on leave
  | 'emergency';    // Available for emergencies only

/**
 * Extended Technician Metadata
 * Stored in UserProfile.metadata for technician role
 */
export interface TechnicianMetadata {
  // Experience & Level
  level: TechnicianLevel;
  yearsOfExperience: number;
  hireDate: Timestamp;

  // Skills & Certifications
  skills: TechnicianSkill[];
  certifications: Certification[];
  primarySpecialization: TechnicianSkill;

  // Team Information
  teamId?: string;
  teamName?: string;
  isTeamLead: boolean;

  // Service Coverage
  serviceAreas: string[]; // Cities/zones they cover
  maxJobsPerDay: number;
  canWorkAlone: boolean; // Based on level

  // Availability
  availabilityStatus: AvailabilityStatus;
  currentJobIds: string[]; // Active booking IDs

  // Performance Metrics
  totalJobsCompleted: number;
  totalJobsAssigned: number;
  averageRating: number;
  firstTimeFixRate: number; // Percentage 0-100
  averageJobDuration: number; // Hours

  // Equipment
  hasVehicle: boolean;
  vehicleType?: string;
  hasToolKit: boolean;

  // Emergency
  isEmergencyTechnician: boolean;
  emergencyContactNumber?: string;
}

/**
 * Job Assignment Types
 */
export type AssignmentType =
  | 'individual'  // Single technician
  | 'team'        // Full team (lead + members)
  | 'pair';       // Two technicians (mentor + trainee)

/**
 * Job Complexity Levels
 * Determines required technician level and team size
 */
export type JobComplexity =
  | 'simple'    // Filter cleaning, minor repairs (1-2 hours, 1 tech)
  | 'moderate'  // Standard repairs, installations (2-4 hours, 1 tech)
  | 'complex'   // Major repairs, ductwork (4-6 hours, 2 techs)
  | 'expert';   // Commercial systems, complex diagnostics (6+ hours, team)

export const JOB_COMPLEXITY_LABELS: Record<JobComplexity, string> = {
  simple: 'Simple',
  moderate: 'Moderate',
  complex: 'Complex',
  expert: 'Expert Level',
};

export const JOB_COMPLEXITY_COLORS: Record<JobComplexity, string> = {
  simple: 'bg-green-100 text-green-700',
  moderate: 'bg-blue-100 text-blue-700',
  complex: 'bg-orange-100 text-orange-700',
  expert: 'bg-red-100 text-red-700',
};

/**
 * Team Structure
 */
export interface Team {
  id: string;
  name: string;

  // Team Lead
  leadTechnicianId: string;
  leadTechnicianName: string;

  // Team Members
  memberIds: string[]; // Includes lead
  members: Array<{
    uid: string;
    name: string;
    level: TechnicianLevel;
    role: 'lead' | 'member';
    joinedAt: Timestamp;
  }>;

  // Capabilities
  serviceAreas: string[];
  specializations: TechnicianSkill[];
  maxConcurrentJobs: number;

  // Status
  isActive: boolean;
  currentJobIds: string[]; // Active booking IDs

  // Performance
  totalJobsCompleted: number;
  averageRating: number;
  averageCompletionTime: number; // Hours

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // Admin UID
}

/**
 * Assignment Recommendation
 * Used for smart dispatch suggestions
 */
export interface AssignmentRecommendation {
  type: 'technician' | 'team';

  // Technician recommendation
  technicianId?: string;
  technicianName?: string;
  technicianLevel?: TechnicianLevel;

  // Team recommendation
  teamId?: string;
  teamName?: string;

  // Match Quality
  matchScore: number; // 0-100
  reasons: string[];

  // Availability
  availability: AvailabilityStatus;
  currentWorkload: number; // Number of active jobs
  estimatedAvailableAt?: string;

  // Location
  distanceFromJob?: number; // Kilometers
  estimatedTravelTime?: number; // Minutes

  // Skills Match
  hasRequiredSkills: boolean;
  matchingSkills: TechnicianSkill[];
  missingSkills: TechnicianSkill[];
}

/**
 * Team Commission Split
 * For dividing earnings among team members
 */
export interface CommissionSplit {
  technicianId: string;
  technicianName: string;
  role: 'lead' | 'senior' | 'technician' | 'junior' | 'trainee';
  percentage: number;
  amount: number;
}

/**
 * Default commission rates by role
 */
export const DEFAULT_COMMISSION_RATES: Record<string, number> = {
  lead: 0.40,       // 40% for lead technician
  senior: 0.30,     // 30% for senior techs
  technician: 0.25, // 25% for regular techs
  junior: 0.20,     // 20% for junior techs
  trainee: 0.10,    // 10% for trainees
};

/**
 * Minimum technician levels required for job complexities
 */
export const MIN_LEVEL_FOR_COMPLEXITY: Record<JobComplexity, TechnicianLevel> = {
  simple: 'junior',
  moderate: 'technician',
  complex: 'senior',
  expert: 'lead',
};

/**
 * Helper function to check if technician can handle job alone
 */
export function canHandleJobAlone(
  techLevel: TechnicianLevel,
  jobComplexity: JobComplexity
): boolean {
  const levels: TechnicianLevel[] = ['trainee', 'junior', 'technician', 'senior', 'lead', 'supervisor'];
  const techLevelIndex = levels.indexOf(techLevel);
  const minLevelIndex = levels.indexOf(MIN_LEVEL_FOR_COMPLEXITY[jobComplexity]);

  return techLevelIndex >= minLevelIndex;
}

/**
 * Helper function to get recommended team size
 */
export function getRecommendedTeamSize(complexity: JobComplexity): number {
  switch (complexity) {
    case 'simple':
    case 'moderate':
      return 1;
    case 'complex':
      return 2;
    case 'expert':
      return 3;
    default:
      return 1;
  }
}

/**
 * Helper function to calculate earnings split for team
 */
export function calculateTeamEarnings(
  totalEarnings: number,
  teamMembers: Array<{ role: string }>
): CommissionSplit[] {
  const totalPercentage = teamMembers.reduce(
    (sum, member) => sum + (DEFAULT_COMMISSION_RATES[member.role] || 0.25),
    0
  );

  return teamMembers.map((member) => {
    const rate = DEFAULT_COMMISSION_RATES[member.role] || 0.25;
    const percentage = (rate / totalPercentage) * 100;
    const amount = (totalEarnings * rate) / totalPercentage;

    return {
      technicianId: '',
      technicianName: '',
      role: member.role as any,
      percentage,
      amount,
    };
  });
}
