/**
 * Remove Duplicate Products Page
 * Admin utility to remove duplicate products from Firestore
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Copy } from 'lucide-react';
import { removeDuplicateProducts } from '@/scripts/removeDuplicates';
import { useNavigate } from 'react-router-dom';

export default function RemoveDuplicates() {
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRemoveDuplicates = async () => {
    const confirmed = window.confirm(
      'This will remove all duplicate products from your database. Only the oldest copy of each product will be kept. Are you sure?'
    );

    if (!confirmed) return;

    setIsRemoving(true);
    setStatus('idle');
    setMessage('');

    try {
      await removeDuplicateProducts();
      setStatus('success');
      setMessage(
        'Successfully removed all duplicate products! The oldest copy of each product has been kept. Refresh the products page to see the updated catalog.'
      );
    } catch (error) {
      setStatus('error');
      setMessage(
        `Failed to remove duplicates: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Remove Duplicate Products</CardTitle>
          <CardDescription>
            This utility will scan your Firestore database and remove any duplicate products based
            on product name. Only the oldest copy will be kept.
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

          {status === 'idle' && !isRemoving && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This operation cannot be undone. Make sure you understand
                what will happen before proceeding.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-sm">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-600">
              <li>Scans all products in your Firestore database</li>
              <li>Groups products with identical names</li>
              <li>Keeps the oldest product (first created)</li>
              <li>Deletes all newer duplicates</li>
              <li>Shows a summary of removed items</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRemoveDuplicates}
              disabled={isRemoving}
              variant="destructive"
              size="lg"
              className="flex-1"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing Duplicates...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Remove Duplicate Products
                </>
              )}
            </Button>

            <Button variant="outline" onClick={() => navigate('/dashboard/admin')} size="lg">
              Cancel
            </Button>
          </div>

          {status === 'success' && (
            <div className="pt-4 border-t border-neutral-200">
              <Button
                onClick={() => navigate('/products')}
                className="w-full"
                variant="outline"
                size="lg"
              >
                View Products Catalog
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
