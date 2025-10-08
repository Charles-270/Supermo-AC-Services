/**
 * Review Form Component
 * Allow customers to review delivered orders
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import { createReview } from '@/services/reviewService';
import { useAuth } from '@/hooks/useAuth';
import type { ReviewFormData } from '@/types/review';
import { toast } from '@/components/ui/use-toast';

interface ReviewFormProps {
  orderId: string;
  orderNumber: string;
  onSuccess?: () => void;
}

export function ReviewForm({ orderId, orderNumber, onSuccess }: ReviewFormProps) {
  const { user, profile } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 5 - photos.length); // Max 5 photos
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast({
        title: 'Sign in required',
        description: 'You must be logged in to submit a review.',
        variant: 'destructive',
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Rating missing',
        description: 'Please select a rating before submitting your review.',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toast({
        title: 'Review incomplete',
        description: 'Please provide both a title and a comment.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const reviewData: ReviewFormData = {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        photos: photos.length > 0 ? photos : undefined,
      };

      await createReview(
        orderId,
        orderNumber,
        user.uid,
        profile.displayName || 'Anonymous',
        profile.email,
        reviewData
      );

      toast({
        title: 'Review submitted',
        description: 'Thank you for sharing your experience.',
        variant: 'success',
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Submission failed',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Your Experience</CardTitle>
        <CardDescription>
          Share your experience with order {orderNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <Label className="mb-2 block">Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-neutral-600 mt-2">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Very Good!'}
                {rating === 3 && 'Good'}
                {rating === 2 && 'Fair'}
                {rating === 1 && 'Poor'}
              </p>
            )}
          </div>

          {/* Review Title */}
          <div>
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              placeholder="Sum up your experience in one line"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="mt-2"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              {title.length}/100 characters
            </p>
          </div>

          {/* Review Comment */}
          <div>
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience with the product and service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={1000}
              className="mt-2"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="mb-2 block">Add Photos (Optional)</Label>
            <div className="space-y-3">
              {/* Upload Button */}
              {photos.length < 5 && (
                <div>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos ({photos.length}/5)
                  </Button>
                </div>
              )}

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Upload up to 5 photos to help others see your experience
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Submitting Review...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
