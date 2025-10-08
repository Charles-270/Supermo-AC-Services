/**
 * Technician seeding helper
 * Invokes the Cloud Function `seedTechnicians`
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface SeedTechnicianResponse {
  success: boolean;
  count: number;
}

export async function addTestTechnicians() {
  console.log('🔧 Invoking seedTechnicians Cloud Function...');

  const seedTechnicians = httpsCallable<unknown, SeedTechnicianResponse>(functions, 'seedTechnicians');
  const response = await seedTechnicians();

  console.log('🎉 Technician seed complete:', response.data);
  return response.data;
}
