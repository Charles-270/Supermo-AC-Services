/**
 * Photo Uploader Component
 * Allows technicians to upload before/after photos for service reports
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, X, Upload, Loader2, AlertCircle } from 'lucide-react';
import {
  uploadJobPhoto,
  deleteJobPhoto,
  validateImageFile,
} from '@/services/storageService';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  bookingId: string;
  type: 'before' | 'after';
  existingPhotos?: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
}

export function PhotoUploader({
  bookingId,
  type,
  existingPhotos = [],
  onPhotosChange,
  maxPhotos = 5,
  label,
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const validationError = validateImageFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        const url = await uploadJobPhoto(file, bookingId, type, (progress) => {
          setUploadProgress(progress);
        });

        return url;
      });

      const urls = await Promise.all(uploadPromises);
      const updatedPhotos = [...photos, ...urls];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoUrl: string, index: number) => {
    try {
      await deleteJobPhoto(photoUrl);
      const updatedPhotos = photos.filter((_, i) => i !== index);
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);
    } catch (err) {
      setError('Failed to delete photo');
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="text-sm font-medium">
          {label} ({photos.length}/{maxPhotos})
        </label>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photoUrl, index) => (
          <Card key={photoUrl} className="relative overflow-hidden aspect-square group">
            <img
              src={photoUrl}
              alt={`${type} photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleDeletePhoto(photoUrl, index)}
              className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
          </Card>
        ))}

        {photos.length < maxPhotos && (
          <Card
            className={cn(
              'aspect-square flex flex-col items-center justify-center cursor-pointer border-2 border-dashed hover:border-primary-500 hover:bg-primary-50 transition-colors',
              uploading && 'pointer-events-none opacity-50'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                <Progress value={uploadProgress} className="w-3/4" />
                <span className="text-xs text-neutral-500">{uploadProgress}%</span>
              </div>
            ) : (
              <>
                <Camera className="h-8 w-8 text-neutral-400 mb-2" />
                <span className="text-sm text-neutral-600">Add Photo</span>
              </>
            )}
          </Card>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading || photos.length >= maxPhotos}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || photos.length >= maxPhotos}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Choose Photos
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      <p className="text-xs text-neutral-500">
        Accepted formats: JPEG, PNG, WebP. Max 10MB per photo. Photos compressed automatically.
      </p>
    </div>
  );
}
