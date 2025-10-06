/**
 * Script to add test technician data
 * Run this once to populate your Firestore with sample technicians
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from '../types/user';
import type { TechnicianMetadata } from '../types/technician';

const testTechnicians = [
  {
    uid: 'tech_001',
    email: 'john.mensah@supremo.com',
    displayName: 'John Mensah',
    phoneNumber: '+233201234567',
    role: 'technician' as const,
    metadata: {
      level: 'senior',
      yearsOfExperience: 6,
      skills: ['ac_installation', 'ac_repair', 'electrical', 'diagnostics'],
      certifications: [],
      primarySpecialization: 'ac_installation',
      teamId: undefined,
      isTeamLead: false,
      serviceAreas: ['Accra', 'Tema'],
      maxJobsPerDay: 8,
      canWorkAlone: true,
      availabilityStatus: 'available',
      currentJobIds: [],
      totalJobsCompleted: 124,
      totalJobsAssigned: 130,
      averageRating: 4.7,
      firstTimeFixRate: 88.5,
      averageJobDuration: 3.2,
      hasVehicle: true,
      vehicleType: 'Van',
      hasToolKit: true,
      isEmergencyTechnician: true,
    } as TechnicianMetadata,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
  {
    uid: 'tech_002',
    email: 'kwame.osei@supremo.com',
    displayName: 'Kwame Osei',
    phoneNumber: '+233207654321',
    role: 'technician' as const,
    metadata: {
      level: 'lead',
      yearsOfExperience: 9,
      skills: ['ac_installation', 'ac_repair', 'commercial_systems', 'ductwork', 'diagnostics', 'welding'],
      certifications: [],
      primarySpecialization: 'commercial_systems',
      teamId: undefined,
      isTeamLead: false,
      serviceAreas: ['Accra', 'Kumasi'],
      maxJobsPerDay: 6,
      canWorkAlone: true,
      availabilityStatus: 'available',
      currentJobIds: [],
      totalJobsCompleted: 287,
      totalJobsAssigned: 295,
      averageRating: 4.9,
      firstTimeFixRate: 92.3,
      averageJobDuration: 4.5,
      hasVehicle: true,
      vehicleType: 'Truck',
      hasToolKit: true,
      isEmergencyTechnician: true,
    } as TechnicianMetadata,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
  {
    uid: 'tech_003',
    email: 'ama.boateng@supremo.com',
    displayName: 'Ama Boateng',
    phoneNumber: '+233245678901',
    role: 'technician' as const,
    metadata: {
      level: 'technician',
      yearsOfExperience: 4,
      skills: ['ac_repair', 'preventive_maintenance', 'residential_systems', 'hvac_controls'],
      certifications: [],
      primarySpecialization: 'preventive_maintenance',
      teamId: undefined,
      isTeamLead: false,
      serviceAreas: ['Accra', 'Tema', 'Kasoa'],
      maxJobsPerDay: 10,
      canWorkAlone: true,
      availabilityStatus: 'available',
      currentJobIds: ['job_001', 'job_002'],
      totalJobsCompleted: 89,
      totalJobsAssigned: 92,
      averageRating: 4.6,
      firstTimeFixRate: 85.2,
      averageJobDuration: 2.8,
      hasVehicle: true,
      vehicleType: 'Motorcycle',
      hasToolKit: true,
      isEmergencyTechnician: false,
    } as TechnicianMetadata,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
  {
    uid: 'tech_004',
    email: 'kofi.asante@supremo.com',
    displayName: 'Kofi Asante',
    phoneNumber: '+233209876543',
    role: 'technician' as const,
    metadata: {
      level: 'junior',
      yearsOfExperience: 2,
      skills: ['ac_repair', 'preventive_maintenance', 'residential_systems'],
      certifications: [],
      primarySpecialization: 'ac_repair',
      teamId: undefined,
      isTeamLead: false,
      serviceAreas: ['Tema', 'Ashaiman'],
      maxJobsPerDay: 8,
      canWorkAlone: true,
      availabilityStatus: 'busy',
      currentJobIds: ['job_003', 'job_004', 'job_005', 'job_006', 'job_007', 'job_008'],
      totalJobsCompleted: 34,
      totalJobsAssigned: 38,
      averageRating: 4.3,
      firstTimeFixRate: 78.9,
      averageJobDuration: 3.5,
      hasVehicle: false,
      hasToolKit: true,
      isEmergencyTechnician: false,
    } as TechnicianMetadata,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
  {
    uid: 'tech_005',
    email: 'akosua.frimpong@supremo.com',
    displayName: 'Akosua Frimpong',
    phoneNumber: '+233241122334',
    role: 'technician' as const,
    metadata: {
      level: 'senior',
      yearsOfExperience: 7,
      skills: ['refrigeration', 'ac_installation', 'diagnostics', 'commercial_systems'],
      certifications: [],
      primarySpecialization: 'refrigeration',
      teamId: undefined,
      isTeamLead: false,
      serviceAreas: ['Accra', 'Tema'],
      maxJobsPerDay: 7,
      canWorkAlone: true,
      availabilityStatus: 'available',
      currentJobIds: ['job_009'],
      totalJobsCompleted: 156,
      totalJobsAssigned: 162,
      averageRating: 4.8,
      firstTimeFixRate: 90.1,
      averageJobDuration: 3.7,
      hasVehicle: true,
      vehicleType: 'Van',
      hasToolKit: true,
      isEmergencyTechnician: true,
    } as TechnicianMetadata,
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isApproved: true,
  },
];

export async function addTestTechnicians() {
  console.log('🔧 Adding test technicians to Firestore...');

  for (const tech of testTechnicians) {
    try {
      const userDoc = doc(db, 'users', tech.uid);
      await setDoc(userDoc, {
        ...tech,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Added technician: ${tech.displayName} (${tech.metadata.level})`);
    } catch (error) {
      console.error(`❌ Error adding ${tech.displayName}:`, error);
    }
  }

  console.log('🎉 All test technicians added successfully!');
  console.log('\nYou can now:');
  console.log('1. Log in as Admin');
  console.log('2. Navigate to the Admin Dashboard');
  console.log('3. Click "Assign Technician" on any pending booking');
  console.log('4. See the technician dropdown with 5 test technicians\n');
}

// Run the script
addTestTechnicians().catch(console.error);
