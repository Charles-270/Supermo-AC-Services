import { describe, it, expect } from 'vitest';
import type { TechnicianProfile } from '@/services/technicianService';
import { calculateMatchScore } from '@/services/technicianService';

const baseTechnician: TechnicianProfile = {
  uid: 'tech-123',
  email: 'tech@example.com',
  role: 'technician',
  displayName: 'Kwame Mensah',
  metadata: {
    skills: ['ac_installation', 'electrical'],
    serviceAreas: ['Accra', 'Tema'],
    availabilityStatus: 'available',
    currentJobIds: [],
    maxJobsPerDay: 6,
    level: 'senior',
    yearsOfExperience: 6,
    certifications: [],
    primarySpecialization: 'ac_installation',
    isTeamLead: false,
    totalJobsCompleted: 40,
    totalJobsAssigned: 50,
    averageRating: 4.8,
    firstTimeFixRate: 92,
    averageJobDuration: 2.5,
    hasVehicle: true,
    hasToolKit: true,
    isEmergencyTechnician: false,
  },
};

describe('calculateMatchScore', () => {
  it('rewards technicians that meet all criteria', () => {
    const score = calculateMatchScore(
      baseTechnician,
      ['ac_installation'],
      'Accra',
      'moderate'
    );

    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('penalises technicians outside service area or availability', () => {
    const busyTechnician: TechnicianProfile = {
      ...baseTechnician,
      metadata: {
        ...baseTechnician.metadata,
        availabilityStatus: 'busy',
        serviceAreas: ['Kumasi'],
      },
    };

    const score = calculateMatchScore(
      busyTechnician,
      ['refrigeration'],
      'Accra',
      'complex'
    );

    expect(score).toBeLessThan(50);
  });
});
