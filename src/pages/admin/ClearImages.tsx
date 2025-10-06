/**
 * Clear All Product Images Page
 * Admin utility to clear all product images from Firestore
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { clearAllImages } from '@/scripts/clearImages';
import { useNavigate } from 'react-router-dom';

export default function ClearImages() {
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleClearImages = async () => {
    const confirmed = window.confirm(
      'This will remove all image URLs from your product database. The products will remain, but will have no images. Are you sure you want to continue?'
    );

    if (!confirmed) return;

    setIsClearing(true);
    setStatus('idle');
    setMessage('');

    try {
      await clearAllImages();
      setStatus('success');
      setMessage(
        'Successfully cleared all product images! All products now have empty image arrays. You can now upload new images via the Upload Images page.'
      );
    } catch (error) {
      setStatus('error');
      setMessage(
        `Failed to clear images: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Clear All Product Images</CardTitle>
          <CardDescription>
            This utility will remove all image URLs from your Firestore product database. The
            products themselves will remain unchanged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <Alert className="border-success-500 bg-success-50">
              <CheckCircle2 className="h-4 w-4 text-success-500" />
              <AlertDescription className="text-success-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'idle' && !isClearing && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This will remove image references from all products in
                your database. You'll need to upload new images afterward.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-sm">What this does:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-600">
              <li>Sets the images array to empty ([]) for all products</li>
              <li>Products will display placeholder icons instead of images</li>
              <li>Image files remain in Firebase Storage (not deleted)</li>
              <li>Product names, prices, and other data are unchanged</li>
              <li>Prepares database for fresh image uploads</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClearImages}
              disabled={isClearing}
              variant="destructive"
              size="lg"
              className="flex-1"
            >
              {isClearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing Images...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Product Images
                </>
              )}
            </Button>

            <Button variant="outline" onClick={() => navigate('/dashboard/admin')} size="lg">
              Cancel
            </Button>
          </div>

          {status === 'success' && (
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <Button
                onClick={() => navigate('/admin/upload-images')}
                className="w-full"
                size="lg"
              >
                Upload New Images
              </Button>
              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                View Products (No Images)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
