/**
 * Product Image Upload Page
 * Admin page to upload 26 product images to Firebase Storage
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, XCircle, ImageIcon, Loader2 } from 'lucide-react';
import { uploadProductImage, type UploadResult } from '@/utils/imageUpload';
import { updateDoc, doc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';

// List of 26 products in order
const PRODUCT_LIST = [
  'Samsung 1.0HP Split Air Conditioner',
  'LG 1.5HP Dual Inverter Split AC',
  'Hisense 2.0HP Split Air Conditioner',
  'Midea 1.5HP Inverter Split AC',
  'Nasco 1.0HP Split Air Conditioner',
  'Bruhm 2.5HP Split AC - Heavy Duty',
  'TCL 1.5HP Inverter Split AC',
  'Gree 3.0HP Floor Standing AC',
  'LG Multi-Split 4-Zone Central AC System',
  'Daikin VRV Central AC - 5 Ton',
  'Universal AC Remote Control',
  'AC Compressor 1.5HP - Universal',
  'AC Fan Motor - Indoor Unit',
  'AC Capacitor - 35uF',
  'AC Refrigerant Gas - R410A (5kg)',
  'AC Circuit Board - Universal PCB',
  'AC Drain Pump - Condensate Removal',
  'AC Installation Kit - Complete Set',
  'AC Wall Mounting Bracket - Heavy Duty',
  'AC Filter - HEPA Air Purification',
  'AC Cover - Outdoor Unit Protection',
  'AC Stabilizer - Voltage Protector 2000W',
  'AC Cleaning Kit - Professional Grade',
  'Smart AC Controller - WiFi Enabled',
  'AC Copper Pipe Set - 5 Meters',
  'AC Thermostat - Digital Programmable',
];

interface ImageUpload {
  file: File | null;
  productName: string;
  preview: string | null;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
  productId?: string;
}

export default function UploadImages() {
  const [uploads, setUploads] = useState<ImageUpload[]>(
    PRODUCT_LIST.map((name) => ({
      file: null,
      productName: name,
      preview: null,
      status: 'pending',
    }))
  );
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const handleFileSelect = (index: number, file: File) => {
    const newUploads = [...uploads];
    newUploads[index].file = file;
    newUploads[index].preview = URL.createObjectURL(file);
    newUploads[index].status = 'pending';
    setUploads(newUploads);
  };

  const handleBulkUpload = async () => {
    const filesToUpload = uploads.filter((u) => u.file !== null);

    if (filesToUpload.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please choose at least one image to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setCompletedCount(0);

    const total = filesToUpload.length;

    for (let i = 0; i < filesToUpload.length; i++) {
      const upload = filesToUpload[i];
      const uploadIndex = uploads.findIndex((u) => u.productName === upload.productName);

      try {
        // Update status to uploading
        setUploads((prev) => {
          const newUploads = [...prev];
          newUploads[uploadIndex].status = 'uploading';
          return newUploads;
        });

        // Upload to Firebase Storage
        const result: UploadResult = await uploadProductImage(
          upload.file!,
          upload.productName
        );

        // Find and update the product in Firestore
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('name', '==', upload.productName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const productDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'products', productDoc.id), {
            images: [result.url],
            updatedAt: new Date(),
          });
        }

        // Update status to success
        setUploads((prev) => {
          const newUploads = [...prev];
          newUploads[uploadIndex].status = 'success';
          newUploads[uploadIndex].url = result.url;
          return newUploads;
        });

        // Update progress
        const currentProgress = Math.round(((i + 1) / total) * 100);
        setProgress(currentProgress);
        setCompletedCount(i + 1);
      } catch (error) {
        console.error(`Failed to upload ${upload.productName}:`, error);
        setUploads((prev) => {
          const newUploads = [...prev];
          newUploads[uploadIndex].status = 'error';
          newUploads[uploadIndex].error =
            error instanceof Error ? error.message : 'Upload failed';
          return newUploads;
        });
      }
    }

    setIsUploading(false);
  };

  const successCount = uploads.filter((u) => u.status === 'success').length;
  const errorCount = uploads.filter((u) => u.status === 'error').length;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Product Images</CardTitle>
          <CardDescription>
            Upload 26 product images to Firebase Storage. Images will be automatically linked
            to their respective products.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Progress */}
          {isUploading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Uploading images... {completedCount} of {uploads.filter((u) => u.file).length}
                <Progress value={progress} className="mt-2" />
              </AlertDescription>
            </Alert>
          )}

          {/* Success/Error Summary */}
          {!isUploading && (successCount > 0 || errorCount > 0) && (
            <div className="space-y-2">
              {successCount > 0 && (
                <Alert className="border-success-500 bg-success-50">
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                  <AlertDescription className="text-success-700">
                    Successfully uploaded {successCount} image{successCount > 1 ? 's' : ''}
                  </AlertDescription>
                </Alert>
              )}
              {errorCount > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to upload {errorCount} image{errorCount > 1 ? 's' : ''}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleBulkUpload}
            disabled={isUploading || uploads.every((u) => !u.file)}
            size="lg"
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {uploads.filter((u) => u.file).length} Image
                {uploads.filter((u) => u.file).length !== 1 ? 's' : ''} to Firebase
              </>
            )}
          </Button>

          {/* Product Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((upload, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {index + 1}. {upload.productName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Image Preview */}
                  <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                    {upload.preview ? (
                      <img
                        src={upload.preview}
                        alt={upload.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-neutral-300" />
                      </div>
                    )}

                    {/* Status Indicator */}
                    {upload.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                    {upload.status === 'success' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-6 w-6 text-success-500 bg-white rounded-full" />
                      </div>
                    )}
                    {upload.status === 'error' && (
                      <div className="absolute top-2 right-2">
                        <XCircle className="h-6 w-6 text-destructive bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* File Input */}
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(index, file);
                      }}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      disabled={isUploading}
                    />
                  </div>

                  {/* Error Message */}
                  {upload.error && (
                    <p className="text-xs text-destructive">{upload.error}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
