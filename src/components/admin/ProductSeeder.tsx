/**
 * Product Seeder Component
 * Admin tool to populate database with sample products
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { seedProducts } from '@/scripts/seedProducts';

export function ProductSeeder() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await seedProducts();
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message || 'Failed to seed products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Product Database Seeder
        </CardTitle>
        <CardDescription>
          Populate the database with 27 sample AC products including units, spare parts, and
          accessories with Ghana market prices (GHS 45 - 45,000)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert className="border-success-600 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-success-600" />
            <AlertDescription className="text-success-600">
              Successfully seeded 27 products to Firestore! Check the Products page to view them.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-error bg-red-50">
            <AlertCircle className="h-4 w-4 text-error" />
            <AlertDescription className="text-error">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">What will be created:</h4>
          <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
            <li>8 Split AC Units (Samsung, LG, Hisense, Midea, Nasco, Bruhm, TCL, Gree)</li>
            <li>2 Central AC Systems (LG Multi-Split, Daikin VRV)</li>
            <li>7 Spare Parts (Remote, Compressor, Fan Motor, Capacitor, Gas, PCB, Pump)</li>
            <li>10 Accessories (Installation Kit, Brackets, Filters, Covers, Stabilizers, etc.)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-amber-600">⚠️ Important Notes:</h4>
          <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
            <li>Products will be assigned to random sample suppliers</li>
            <li>Images use placeholder URLs from Unsplash</li>
            <li>This action can be run multiple times (will create duplicates)</li>
            <li>Recommended: Run once, then manage products via Admin Dashboard</li>
          </ul>
        </div>

        <Button onClick={handleSeed} disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Seeding Products...' : 'Seed Products to Database'}
        </Button>
      </CardContent>
    </Card>
  );
}
