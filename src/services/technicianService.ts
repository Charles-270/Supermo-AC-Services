/**
 * Technician Service
 * Manages technician profiles, teams, and assignment logic
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types/user';
import type {
  TechnicianLevel,
  TechnicianSkill,
  TechnicianMetadata,
  AssignmentRecommendation,
  JobComplexity,
  Team,
  AvailabilityStatus,
} from '@/types/technician';

/**
 * Technician with full profile data
 */
export interface TechnicianProfile extends UserProfile {
  role: 'technician';
  metadata: TechnicianMetadata;
}

/**
 * Get all technicians from Firestore
 */
export async function getAllTechnicians(): Promise<TechnicianProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('role', '==', 'technician'),
      where('isActive', '==', true),
      where('isApproved', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const technicians: TechnicianProfile[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserProfile;
      if (data.role === 'technician') {
        technicians.push(data as TechnicianProfile);
      }
    });

    return technicians;
  } catch (error) {
    console.error('Error fetching technicians:', error);
    throw new Error('Failed to fetch technicians');
  }
}

/**
 * Get available technicians
 * Filters by availability status
 */
export async function getAvailableTechnicians(): Promise<TechnicianProfile[]> {
  try {
    const allTechnicians = await getAllTechnicians();

    return allTechnicians.filter(tech => {
      const metadata = tech.metadata as TechnicianMetadata;
      return (
        metadata.availabilityStatus === 'available' &&
        (metadata.currentJobIds?.length || 0) < (metadata.maxJobsPerDay || 8)
      );
    });
  } catch (error) {
    console.error('Error fetching available technicians:', error);
    throw new Error('Failed to fetch available technicians');
  }
}

/**
 * Get technician by ID
 */
export async function getTechnicianById(uid: string): Promise<TechnicianProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data() as UserProfile;
    if (data.role !== 'technician') {
      throw new Error('User is not a technician');
    }

    return data as TechnicianProfile;
  } catch (error) {
    console.error('Error fetching technician:', error);
    throw new Error('Failed to fetch technician');
  }
}

/**
 * Get technicians by skill
 */
export async function getTechniciansBySkill(skill: TechnicianSkill): Promise<TechnicianProfile[]> {
  try {
    const allTechnicians = await getAllTechnicians();

    return allTechnicians.filter(tech => {
      const metadata = tech.metadata as TechnicianMetadata;
      return metadata.skills?.includes(skill);
    });
  } catch (error) {
    console.error('Error fetching technicians by skill:', error);
    throw new Error('Failed to fetch technicians by skill');
  }
}

/**
 * Get technicians by service area
 */
export async function getTechniciansByServiceArea(area: string): Promise<TechnicianProfile[]> {
  try {
    const allTechnicians = await getAllTechnicians();

    return allTechnicians.filter(tech => {
      const metadata = tech.metadata as TechnicianMetadata;
      return metadata.serviceAreas?.includes(area);
    });
  } catch (error) {
    console.error('Error fetching technicians by area:', error);
    throw new Error('Failed to fetch technicians by area');
  }
}

/**
 * Update technician availability status
 */
export async function updateTechnicianAvailability(
  uid: string,
  status: AvailabilityStatus
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'metadata.availabilityStatus': status,
      updatedAt: serverTimestamp(),
    });
    console.log(`✅ Technician ${uid} availability updated to ${status}`);
  } catch (error) {
    console.error('Error updating technician availability:', error);
    throw new Error('Failed to update technician availability');
  }
}

/**
 * Add job to technician's current jobs
 */
export async function assignJobToTechnician(
  uid: string,
  jobId: string
): Promise<void> {
  try {
    const technicianRef = doc(db, 'users', uid);
    const technicianSnap = await getDoc(technicianRef);

    if (!technicianSnap.exists()) {
      throw new Error('Technician not found');
    }

    const data = technicianSnap.data() as TechnicianProfile;
    const metadata = data.metadata as TechnicianMetadata;
    const currentJobs = metadata.currentJobIds || [];

    await updateDoc(technicianRef, {
      'metadata.currentJobIds': [...currentJobs, jobId],
      'metadata.totalJobsAssigned': (metadata.totalJobsAssigned || 0) + 1,
      updatedAt: serverTimestamp(),
    });

    // Auto-update availability if at capacity
    const maxJobs = metadata.maxJobsPerDay || 8;
    if (currentJobs.length + 1 >= maxJobs) {
      await updateTechnicianAvailability(uid, 'busy');
    }

    console.log(`✅ Job ${jobId} assigned to technician ${uid}`);
  } catch (error) {
    console.error('Error assigning job to technician:', error);
    throw new Error('Failed to assign job to technician');
  }
}

/**
 * Remove job from technician's current jobs
 */
export async function removeJobFromTechnician(
  uid: string,
  jobId: string
): Promise<void> {
  try {
    const technicianRef = doc(db, 'users', uid);
    const technicianSnap = await getDoc(technicianRef);

    if (!technicianSnap.exists()) {
      throw new Error('Technician not found');
    }

    const data = technicianSnap.data() as TechnicianProfile;
    const metadata = data.metadata as TechnicianMetadata;
    const currentJobs = (metadata.currentJobIds || []).filter(id => id !== jobId);

    await updateDoc(technicianRef, {
      'metadata.currentJobIds': currentJobs,
      updatedAt: serverTimestamp(),
    });

    // Auto-update availability if below capacity
    const maxJobs = metadata.maxJobsPerDay || 8;
    if (currentJobs.length < maxJobs && metadata.availabilityStatus === 'busy') {
      await updateTechnicianAvailability(uid, 'available');
    }

    console.log(`✅ Job ${jobId} removed from technician ${uid}`);
  } catch (error) {
    console.error('Error removing job from technician:', error);
    throw new Error('Failed to remove job from technician');
  }
}

/**
 * Calculate match score for technician assignment
 * Returns score from 0-100
 */
export function calculateMatchScore(
  technician: TechnicianProfile,
  requiredSkills: TechnicianSkill[],
  serviceArea: string,
  complexity: JobComplexity
): number {
  const metadata = technician.metadata as TechnicianMetadata;
  let score = 0;

  // Skills match (40 points max)
  if (requiredSkills.length > 0) {
    const matchingSkills = requiredSkills.filter(skill =>
      metadata.skills?.includes(skill)
    );
    const skillMatchRate = matchingSkills.length / requiredSkills.length;
    score += skillMatchRate * 40;
  } else {
    score += 40; // No specific skills required
  }

  // Service area match (20 points)
  if (metadata.serviceAreas?.includes(serviceArea)) {
    score += 20;
  }

  // Level appropriate for complexity (20 points)
  const levelScore = getLevelScore(metadata.level, complexity);
  score += levelScore * 20;

  // Availability (10 points)
  if (metadata.availabilityStatus === 'available') {
    score += 10;
  } else if (metadata.availabilityStatus === 'emergency') {
    score += 5;
  }

  // Workload (10 points)
  const currentJobs = metadata.currentJobIds?.length || 0;
  const maxJobs = metadata.maxJobsPerDay || 8;
  const workloadScore = Math.max(0, 1 - (currentJobs / maxJobs));
  score += workloadScore * 10;

  return Math.round(score);
}

/**
 * Helper function to score technician level vs job complexity
 */
function getLevelScore(level: TechnicianLevel, complexity: JobComplexity): number {
  const levelPoints: Record<TechnicianLevel, number> = {
    trainee: 1,
    junior: 2,
    technician: 3,
    senior: 4,
    lead: 5,
    supervisor: 5,
  };

  const complexityRequirement: Record<JobComplexity, number> = {
    simple: 2,    // Junior or above
    moderate: 3,  // Technician or above
    complex: 4,   // Senior or above
    expert: 5,    // Lead or above
  };

  const techLevel = levelPoints[level];
  const requiredLevel = complexityRequirement[complexity];

  if (techLevel >= requiredLevel) {
    return 1; // Perfect match or overqualified
  } else {
    return Math.max(0, techLevel / requiredLevel); // Underqualified
  }
}

/**
 * Get assignment recommendations for a job
 * Returns sorted list of best matches
 */
export async function getAssignmentRecommendations(
  requiredSkills: TechnicianSkill[],
  serviceArea: string,
  complexity: JobComplexity,
  maxResults: number = 10
): Promise<AssignmentRecommendation[]> {
  try {
    const allTechnicians = await getAllTechnicians();

    const recommendations: AssignmentRecommendation[] = allTechnicians.map(tech => {
      const metadata = tech.metadata as TechnicianMetadata;
      const matchScore = calculateMatchScore(tech, requiredSkills, serviceArea, complexity);

      const matchingSkills = requiredSkills.filter(skill =>
        metadata.skills?.includes(skill)
      );
      const missingSkills = requiredSkills.filter(skill =>
        !metadata.skills?.includes(skill)
      );

      const reasons: string[] = [];
      if (matchingSkills.length > 0) {
        reasons.push(`✓ Has ${matchingSkills.length}/${requiredSkills.length} required skills`);
      }
      if (metadata.serviceAreas?.includes(serviceArea)) {
        reasons.push(`✓ Covers ${serviceArea}`);
      }
      if (metadata.availabilityStatus === 'available') {
        reasons.push('✓ Available now');
      }
      const currentJobs = metadata.currentJobIds?.length || 0;
      if (currentJobs < (metadata.maxJobsPerDay || 8)) {
        reasons.push(`✓ Capacity: ${currentJobs}/${metadata.maxJobsPerDay || 8} jobs`);
      }

      return {
        type: 'technician',
        technicianId: tech.uid,
        technicianName: tech.displayName,
        technicianLevel: metadata.level,
        matchScore,
        reasons,
        availability: metadata.availabilityStatus,
        currentWorkload: currentJobs,
        hasRequiredSkills: matchingSkills.length === requiredSkills.length,
        matchingSkills,
        missingSkills,
      };
    });

    // Sort by match score (descending)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations.slice(0, maxResults);
  } catch (error) {
    console.error('Error getting assignment recommendations:', error);
    throw new Error('Failed to get assignment recommendations');
  }
}

/**
 * Create or update team
 */
export async function createTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const teamsRef = collection(db, 'teams');
    const newTeamRef = doc(teamsRef);

    const teamData: Team = {
      ...team,
      id: newTeamRef.id,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    await setDoc(newTeamRef, teamData);

    // Update team members' profiles
    for (const memberId of team.memberIds) {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        'metadata.teamId': newTeamRef.id,
        'metadata.teamName': team.name,
        'metadata.isTeamLead': memberId === team.leadTechnicianId,
        updatedAt: serverTimestamp(),
      });
    }

    console.log('✅ Team created:', newTeamRef.id);
    return newTeamRef.id;
  } catch (error) {
    console.error('Error creating team:', error);
    throw new Error('Failed to create team');
  }
}

/**
 * Get all teams
 */
export async function getAllTeams(): Promise<Team[]> {
  try {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    const teams: Team[] = [];
    querySnapshot.forEach((doc) => {
      teams.push({ id: doc.id, ...doc.data() } as Team);
    });

    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw new Error('Failed to fetch teams');
  }
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: string): Promise<Team | null> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return null;
    }

    return { id: teamSnap.id, ...teamSnap.data() } as Team;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw new Error('Failed to fetch team');
  }
}
