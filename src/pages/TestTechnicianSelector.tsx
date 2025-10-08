/**
 * Test Page for Technician Selector
 * Use this page to test the technician dropdown functionality
 */

import { useState } from 'react';
import { TechnicianSelector } from '@/components/admin/TechnicianSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { addTestTechnicians } from '@/scripts/addTestTechnicians';
import { CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function TestTechnicianSelector() {
  const [selectedTechId, setSelectedTechId] = useState('');
  const [selectedTechName, setSelectedTechName] = useState('');
  const [testDataAdded, setTestDataAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddTestData = async () => {
    try {
      setAdding(true);
      const result = await addTestTechnicians();
      setTestDataAdded(true);
      toast({
        title: 'Test data added',
        description: result?.count
          ? `Seeded ${result.count} technician profiles.`
          : 'Test technicians added successfully!',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error adding test data:', error);
      const isPermissionError = (error as { code?: string }).code === 'functions/permission-denied';
      toast({
        title: 'Failed to add test data',
        description: isPermissionError
          ? 'Admin privileges are required to seed technicians.'
          : 'Check the console for more details.',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cool p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Technician Selector Test Page
          </h1>
          <p className="text-neutral-600">
            Test the new technician dropdown component
          </p>
        </div>

        {/* Step 1: Add Test Data */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Add Test Technicians</CardTitle>
            <CardDescription>
              Add 5 sample technicians to your Firestore database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-700 mb-2">
                  This will create 5 technicians with different levels:
                </p>
                <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
                  <li>John Mensah - Senior Technician (Available)</li>
                  <li>Kwame Osei - Lead Technician (Available)</li>
                  <li>Ama Boateng - Technician (Available, 2 active jobs)</li>
                  <li>Kofi Asante - Junior Technician (Busy, 6 active jobs)</li>
                  <li>Akosua Frimpong - Senior Technician (Available, 1 active job)</li>
                </ul>
              </div>
              <Button
                onClick={handleAddTestData}
                disabled={adding || testDataAdded}
                className="w-full"
              >
                {adding && '⏳ Adding...'}
                {testDataAdded && '✅ Test Data Added'}
                {!adding && !testDataAdded && 'Add Test Technicians to Firestore'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Test Dropdown */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Test the Dropdown (Dropdown Mode)</CardTitle>
            <CardDescription>
              Select a technician from the dropdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TechnicianSelector
              onSelect={(id, name) => {
                setSelectedTechId(id);
                setSelectedTechName(name);
                console.log('Selected:', { id, name });
              }}
              selectedTechnicianId={selectedTechId}
              serviceArea="Accra"
              showOnlyAvailable={true}
              showRecommendations={false}
            />
          </CardContent>
        </Card>

        {/* Step 3: Test List View with Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Test List View with Smart Recommendations</CardTitle>
            <CardDescription>
              See skill-based matching and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TechnicianSelector
              onSelect={(id, name) => {
                setSelectedTechId(id);
                setSelectedTechName(name);
                console.log('Selected:', { id, name });
              }}
              selectedTechnicianId={selectedTechId}
              requiredSkills={['ac_installation', 'electrical']}
              serviceArea="Accra"
              jobComplexity="complex"
              showOnlyAvailable={true}
              showRecommendations={true}
            />
          </CardContent>
        </Card>

        {/* Selection Result */}
        {selectedTechId && (
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-primary-700">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Selected Technician:</p>
                  <p className="text-sm">{selectedTechName} ({selectedTechId})</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Testing Instructions */}
        <Card className="bg-neutral-50">
          <CardHeader>
            <CardTitle>How to Test in Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-neutral-700">
              <li>
                <strong>1.</strong> Click "Add Test Technicians" button above
              </li>
              <li>
                <strong>2.</strong> Go to your Admin Dashboard: <code className="bg-white px-2 py-1 rounded">/dashboard/admin</code>
              </li>
              <li>
                <strong>3.</strong> Find a booking with "Pending" status
              </li>
              <li>
                <strong>4.</strong> Click the "Assign Technician" button
              </li>
              <li>
                <strong>5.</strong> You'll see the new technician dropdown with:
                <ul className="ml-6 mt-1 list-disc list-inside">
                  <li>Availability status (🟢 Available / 🟡 Busy)</li>
                  <li>Current workload (X/8 jobs)</li>
                  <li>Technician level badges</li>
                  <li>Searchable list</li>
                </ul>
              </li>
              <li>
                <strong>6.</strong> Select a technician and click "Assign"
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
