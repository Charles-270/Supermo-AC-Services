/**
 * Admin Utility: Backfill Technician Stats
 * One-time migration to sync historical booking data to technician profiles
 */

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface MigrationResult {
  technicianName: string;
  totalJobsCompleted: number;
  averageRating: number;
  ratingsCount: number;
}

export default function BackfillTechnicianStats() {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setRunning(true);
    setError(null);
    setResults([]);
    setCompleted(false);

    try {
      // Get all technicians
      const technicianQuery = query(
        collection(db, 'users'),
        where('role', '==', 'technician')
      );
      const techSnapshot = await getDocs(technicianQuery);

      if (techSnapshot.size === 0) {
        throw new Error('No technicians found');
      }

      const migrationResults: MigrationResult[] = [];

      for (const techDoc of techSnapshot.docs) {
        const techId = techDoc.id;
        const techData = techDoc.data();
        const techName = techData.displayName || techData.email;

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

        migrationResults.push({
          technicianName: techName,
          totalJobsCompleted,
          averageRating,
          ratingsCount: totalRatings,
        });
      }

      setResults(migrationResults);
      setCompleted(true);

      toast({
        title: '✅ Migration Complete',
        description: `Updated ${migrationResults.length} technician${migrationResults.length !== 1 ? 's' : ''}`,
      });
    } catch (err) {
      console.error('Migration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      toast({
        title: '❌ Migration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Backfill Technician Stats
            </CardTitle>
            <CardDescription>
              This one-time migration syncs historical booking data to technician profiles.
              It calculates completed jobs count and average ratings from existing bookings.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!completed && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What this does:</h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                  <li>Finds all technicians in the system</li>
                  <li>Counts their completed bookings</li>
                  <li>Calculates average customer ratings</li>
                  <li>Updates their profiles with accurate stats</li>
                </ul>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-900 font-semibold mb-2">
                  <AlertCircle className="h-5 w-5" />
                  Migration Failed
                </div>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {completed && results.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-900 font-semibold mb-4">
                  <CheckCircle2 className="h-5 w-5" />
                  Migration Successful
                </div>

                <div className="space-y-2">
                  {results.map((result, idx) => (
                    <div key={idx} className="bg-white rounded p-3 text-sm">
                      <div className="font-medium text-gray-900">{result.technicianName}</div>
                      <div className="text-gray-600 mt-1">
                        <span className="font-semibold text-green-600">{result.totalJobsCompleted}</span> jobs completed
                        {result.ratingsCount > 0 && (
                          <>
                            {' • '}
                            <span className="font-semibold text-yellow-600">{result.averageRating.toFixed(1)}⭐</span>
                            {' '}({result.ratingsCount} rating{result.ratingsCount !== 1 ? 's' : ''})
                          </>
                        )}
                        {result.ratingsCount === 0 && (
                          <span className="text-gray-400"> • No ratings yet</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
                  <strong>Next step:</strong> Go to Manage Bookings and check the technician selector.
                  You should now see accurate completed jobs and ratings!
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={runMigration}
                disabled={running || completed}
                size="lg"
                className="flex-1"
              >
                {running && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {completed ? 'Migration Complete' : running ? 'Running Migration...' : 'Run Migration'}
              </Button>

              {completed && (
                <Button
                  onClick={() => window.location.href = '/admin/manage-bookings'}
                  variant="outline"
                  size="lg"
                >
                  Go to Manage Bookings
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
