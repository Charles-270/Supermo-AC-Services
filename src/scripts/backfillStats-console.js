/**
 * Browser Console Migration: Backfill Technician Stats
 *
 * HOW TO RUN:
 * 1. Log in as Admin at http://localhost:5173
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 *
 * This will update all technician profiles with their completed jobs count and average ratings
 */

(async function backfillTechnicianStats() {
  console.log('%c🔄 Starting Technician Stats Backfill...', 'color: #3b82f6; font-size: 16px; font-weight: bold');
  console.log('');

  try {
    // Import Firebase functions from the app
    const { db } = await import('/src/lib/firebase.ts');
    const { collection, getDocs, doc, updateDoc, query, where } = await import('firebase/firestore');

    // Get all technicians
    console.log('📋 Fetching all technicians...');
    const technicianQuery = query(
      collection(db, 'users'),
      where('role', '==', 'technician')
    );
    const techSnapshot = await getDocs(technicianQuery);

    console.log(`✅ Found ${techSnapshot.size} technicians\n`);

    if (techSnapshot.size === 0) {
      console.log('%c⚠️ No technicians found. Make sure technicians are registered.', 'color: #f59e0b');
      return;
    }

    let updated = 0;

    for (const techDoc of techSnapshot.docs) {
      const techId = techDoc.id;
      const techData = techDoc.data();
      const techName = techData.displayName || techData.email;

      console.log(`%c👤 Processing: ${techName}`, 'color: #8b5cf6; font-weight: bold');

      // Get all completed bookings for this technician
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('technicianId', '==', techId),
        where('status', '==', 'completed')
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      const totalJobsCompleted = bookingsSnapshot.size;
      let totalRatings = 0;
      let totalRatingSum = 0;

      // Calculate average rating
      bookingsSnapshot.forEach((bookingDoc) => {
        const booking = bookingDoc.data();
        if (booking.customerRating && typeof booking.customerRating === 'number') {
          totalRatings++;
          totalRatingSum += booking.customerRating;
        }
      });

      const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

      // Update technician profile
      const techRef = doc(db, 'users', techId);
      await updateDoc(techRef, {
        'metadata.totalJobsCompleted': totalJobsCompleted,
        'metadata.averageRating': averageRating,
      });

      console.log(
        `   ✅ Updated: %c${totalJobsCompleted} jobs%c, %c${averageRating.toFixed(1)}⭐%c (${totalRatings} ratings)`,
        'color: #10b981; font-weight: bold',
        'color: inherit',
        'color: #f59e0b; font-weight: bold',
        'color: inherit'
      );
      console.log('');

      updated++;
    }

    console.log('%c🎉 Backfill Complete!', 'color: #10b981; font-size: 16px; font-weight: bold');
    console.log(`✅ Updated ${updated} technician${updated !== 1 ? 's' : ''}`);
    console.log('');
    console.log('%cℹ️ Refresh the Manage Bookings page to see the updated stats in the technician selector.', 'color: #3b82f6');

  } catch (error) {
    console.error('%c❌ Migration Error:', 'color: #ef4444; font-weight: bold', error);
    console.log('');
    console.log('%c⚠️ Make sure you are logged in as Admin and try again.', 'color: #f59e0b');
  }
})();
