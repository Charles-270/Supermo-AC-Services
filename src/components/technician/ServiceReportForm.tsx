/**
 * Service Report Form Component
 * Technicians complete this form to finish a job
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhotoUploader } from './PhotoUploader';
import { Loader2, Plus, X, PenTool } from 'lucide-react';
import { completeBooking } from '@/services/bookingService';
import type { Booking } from '@/types/booking';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ServiceReportFormProps {
  booking: Booking;
  onComplete?: () => void;
}

interface PartUsed {
  name: string;
  quantity: number;
  cost: number;
}

export function ServiceReportForm({ booking, onComplete }: ServiceReportFormProps) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Form state
  const [serviceNotes, setServiceNotes] = useState('');
  const [laborHours, setLaborHours] = useState<number>(1);
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([]);
  const [beforePhotos, setBeforePhotos] = useState<string[]>(booking.beforePhotos || []);
  const [afterPhotos, setAfterPhotos] = useState<string[]>(booking.afterPhotos || []);
  const [hasSignature, setHasSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New part form
  const [newPart, setNewPart] = useState({ name: '', quantity: 1, cost: 0 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const addPart = () => {
    if (!newPart.name || newPart.quantity <= 0 || newPart.cost < 0) {
      toast({
        title: 'Incomplete part details',
        description: 'Please provide a name, quantity, and cost before adding a part.',
        variant: 'destructive',
      });
      return;
    }

    setPartsUsed([...partsUsed, { ...newPart }]);
    setNewPart({ name: '', quantity: 1, cost: 0 });
  };

  const removePart = (index: number) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  const calculateTotalCost = (): number => {
    const partsCost = partsUsed.reduce((sum, part) => sum + (part.cost * part.quantity), 0);
    const laborCost = laborHours * 50; // GHS 50 per hour (configurable)
    return partsCost + laborCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceNotes.trim()) {
      toast({
        title: 'Service notes required',
        description: 'Please provide service notes before completing the job.',
        variant: 'destructive',
      });
      return;
    }

    if (beforePhotos.length === 0 || afterPhotos.length === 0) {
      const confirm = window.confirm(
        'No photos uploaded. It is recommended to include before/after photos. Continue anyway?'
      );
      if (!confirm) return;
    }

    try {
      setSubmitting(true);

      // Get signature as base64
      const canvas = canvasRef.current;
      const customerSignature = canvas ? canvas.toDataURL('image/png') : undefined;

      // Prepare completion data
      const completionData = {
        serviceNotes,
        laborHours,
        partsUsed: partsUsed.length > 0 ? partsUsed : undefined,
        beforePhotos: beforePhotos.length > 0 ? beforePhotos : undefined,
        afterPhotos: afterPhotos.length > 0 ? afterPhotos : undefined,
        customerSignature,
        finalCost: calculateTotalCost(),
      };

      await completeBooking(booking.id, completionData);

      toast({
        title: 'Job completed',
        description: 'The service report has been submitted successfully.',
        variant: 'success',
      });

      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard/technician');
      }
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: 'Completion failed',
        description: 'Failed to complete job. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalCost = calculateTotalCost();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Work Performed</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe the work performed, any issues found, and solutions applied..."
            value={serviceNotes}
            onChange={(e) => setServiceNotes(e.target.value)}
            rows={6}
            required
          />
        </CardContent>
      </Card>

      {/* Labor Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Labor Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="0.5"
              step="0.5"
              value={laborHours}
              onChange={(e) => setLaborHours(parseFloat(e.target.value))}
              className="w-32"
              required
            />
            <span className="text-sm text-neutral-600">
              @ GHS 50/hour = {formatCurrency(laborHours * 50)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Parts Used */}
      <Card>
        <CardHeader>
          <CardTitle>Parts Used</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Parts List */}
          {partsUsed.length > 0 && (
            <div className="space-y-2">
              {partsUsed.map((part, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium">{part.name}</p>
                    <p className="text-sm text-neutral-600">
                      Qty: {part.quantity} × {formatCurrency(part.cost)} = {formatCurrency(part.quantity * part.cost)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePart(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Part */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label htmlFor="partName">Part Name</Label>
              <Input
                id="partName"
                placeholder="e.g., Compressor"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="partQty">Quantity</Label>
              <Input
                id="partQty"
                type="number"
                min="1"
                value={newPart.quantity}
                onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="partCost">Unit Cost (GHS)</Label>
              <Input
                id="partCost"
                type="number"
                min="0"
                step="0.01"
                value={newPart.cost}
                onChange={(e) => setNewPart({ ...newPart, cost: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <Button type="button" variant="outline" onClick={addPart} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Part
          </Button>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Before Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUploader
            bookingId={booking.id}
            type="before"
            existingPhotos={beforePhotos}
            onPhotosChange={setBeforePhotos}
            maxPhotos={5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>After Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUploader
            bookingId={booking.id}
            type="after"
            existingPhotos={afterPhotos}
            onPhotosChange={setAfterPhotos}
            maxPhotos={5}
          />
        </CardContent>
      </Card>

      {/* Customer Signature */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Signature</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-2 bg-white">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
            <PenTool className="h-3 w-3" />
            Customer signature confirming work completion
          </p>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card className="border-primary-500">
        <CardHeader>
          <CardTitle>Total Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Labor ({laborHours}h)</span>
              <span>{formatCurrency(laborHours * 50)}</span>
            </div>
            {partsUsed.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>Parts</span>
                <span>{formatCurrency(partsUsed.reduce((sum, p) => sum + (p.cost * p.quantity), 0))}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Completing Job...
          </>
        ) : (
          'Complete Job'
        )}
      </Button>
    </form>
  );
}
