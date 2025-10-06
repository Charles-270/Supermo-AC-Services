/**
 * Product Image Update Utility
 * Redirect page to the new upload interface
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight } from 'lucide-react';

export default function UpdateProducts() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/admin/upload-images');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Page Moved</CardTitle>
          <CardDescription>
            The product image update feature has been moved to a new, improved upload interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-primary-500 bg-primary-50">
            <ArrowRight className="h-4 w-4 text-primary-500" />
            <AlertDescription className="text-primary-700">
              Redirecting you to the new upload page in 3 seconds...
            </AlertDescription>
          </Alert>

          <div className="text-sm text-neutral-500 space-y-2">
            <p><strong>New features:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Upload images directly to Firebase Storage</li>
              <li>Preview images before uploading</li>
              <li>Track upload progress in real-time</li>
              <li>Automatic Firestore linking</li>
            </ul>
            <p className="mt-4">
              <a
                href="/admin/upload-images"
                className="text-primary-600 hover:underline font-medium"
              >
                Click here if you're not redirected automatically
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
