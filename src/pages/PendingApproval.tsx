/**
 * Pending Approval Page
 * Shown to users whose accounts are awaiting admin approval
 */

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Shield, Mail } from 'lucide-react';

export function PendingApproval() {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-cool flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription>
            Your {profile?.role} account is awaiting administrator approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-neutral-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Why is approval required?</h3>
                <p className="text-sm text-neutral-600">
                  {profile?.role === 'admin' &&
                    'Admin accounts have full platform access and require verification to ensure security and proper authorization.'
                  }
                  {profile?.role === 'technician' &&
                    'Technician accounts need verification to ensure you meet our qualifications and can provide quality service to customers.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1">What happens next?</h3>
                <p className="text-sm text-neutral-600">
                  An administrator will review your account and approve it within 24-48 hours.
                  You'll receive an email notification once your account is approved.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2 text-primary-900">Account Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-neutral-600">Name:</span> <span className="font-medium">{profile?.displayName}</span></p>
              <p><span className="text-neutral-600">Email:</span> <span className="font-medium">{profile?.email}</span></p>
              <p><span className="text-neutral-600">Role:</span> <span className="font-medium capitalize">{profile?.role}</span></p>
              <p><span className="text-neutral-600">Status:</span> <span className="font-medium text-warning">Pending Approval</span></p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-neutral-600 text-center">
              If you have any questions, please contact support at{' '}
              <a href="mailto:support@supremoac.com" className="text-primary-600 hover:underline">
                support@supremoac.com
              </a>
            </p>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
