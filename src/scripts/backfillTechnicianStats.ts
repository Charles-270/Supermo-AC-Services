/**
 * Migration Script: Backfill Technician Stats
 * Recalculates completed jobs count and average ratings from existing bookings
 *
 * Run this once to sync historical data, then the real-time syncs will keep it updated
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDMb9e4GEJhEO0MqjEUxzzJH-SZHLaBPLo",
  authDomain: "supremo-ac.firebaseapp.com",
  projectId: "supremo-ac",
  storageBucket: "supremo-ac.firebasestorage.app",
  messagingSenderId: "1011705826528",
  appId: "1:1011705826528:web:ae5f44ee98f7db6a71c23e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface TechnicianStats {
  totalJobsCompleted: number;
  averageRating: number;
  totalRatings: number;
  totalRatingSum: number;
}

async function backfillTechnicianStats() {
  console.log('🔄 Starting technician stats backfill...\n');

  try {
    // Get all technicians
    const technicianQuery = query(
      collection(db, 'users'),
      where('role', '==', 'technician')
    );
    const techSnapshot = await getDocs(technicianQuery);

    console.log(`Found ${techSnapshot.size} technicians\n`);

    for (const techDoc of techSnapshot.docs) {
      const techId = techDoc.id;
      const techData = techDoc.data();
      const techName = techData.displayName || techData.email;

      console.log(`📊 Processing: ${techName} (${techId})`);

      // Get all completed bookings for this technician
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('technicianId', '==', techId),
        where('status', '==', 'completed')
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      const stats: TechnicianStats = {
        totalJobsCompleted: bookingsSnapshot.size,
        averageRating: 0,
        totalRatings: 0,
        totalRatingSum: 0,
      };

      // Calculate average rating from bookings with ratings
      bookingsSnapshot.forEach((bookingDoc) => {
        const booking = bookingDoc.data();
        if (booking.customerRating && typeof booking.customerRating === 'number') {
          stats.totalRatings++;
          stats.totalRatingSum += booking.customerRating;
        }
      });

      if (stats.totalRatings > 0) {
        stats.averageRating = stats.totalRatingSum / stats.totalRatings;
      }

      // Update technician profile
      const techRef = doc(db, 'users', techId);
      await updateDoc(techRef, {
        'metadata.totalJobsCompleted': stats.totalJobsCompleted,
        'metadata.averageRating': stats.averageRating,
      });

      console.log(`  ✅ Updated: ${stats.totalJobsCompleted} jobs, ${stats.averageRating.toFixed(1)} avg rating (${stats.totalRatings} ratings)\n`);
    }

    console.log('✅ Backfill complete!');
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    throw error;
  }
}

// Run the migration
backfillTechnicianStats()
  .then(() => {
    console.log('\n🎉 Migration successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
