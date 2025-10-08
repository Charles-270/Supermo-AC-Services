/**
 * Admin Approvals Component
 * Dedicated component for reviewing and approving admin role requests
 * Admin is a sensitive role requiring special approval workflow
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  getPendingAdminApprovals,
  approveUser,
  deactivateUser,
} from '@/services/userService';
import type { UserProfile } from '@/types/user';
import { toast } from '@/components/ui/use-toast';

export function AdminApprovals() {
  const [pendingAdmins, setPendingAdmins] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<UserProfile | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    setLoading(true);
    try {
      const admins = await getPendingAdminApprovals();
      setPendingAdmins(admins);
    } catch (error) {
      console.error('Error fetching pending admin approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (applicant: UserProfile, action: 'approve' | 'reject') => {
    setSelectedApplicant(applicant);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedApplicant) return;

    setProcessing(true);
    try {
      if (actionType === 'approve') {
        await approveUser(selectedApplicant.uid);
      } else {
        // Reject by deactivating the user
        await deactivateUser(selectedApplicant.uid);
      }

      // Refresh data
      await fetchPendingAdmins();
      setActionDialogOpen(false);
      setSelectedApplicant(null);
      toast({
        title: actionType === 'approve' ? 'Admin access granted' : 'Request rejected',
        description:
          actionType === 'approve'
            ? `${selectedApplicant.displayName} now has admin privileges.`
            : `${selectedApplicant.displayName}'s admin request has been rejected.`,
        variant: actionType === 'approve' ? 'success' : 'default',
      });
    } catch (error) {
      console.error('Error performing action:', error);
      toast({
        title: 'Action failed',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card className="border-amber-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </CardContent>
      </Card>
    );
  }

  if (pendingAdmins.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            Admin Approvals
          </CardTitle>
          <CardDescription className="text-green-700">
            No pending admin approval requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Shield className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-green-700">All admin requests have been reviewed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Shield className="h-5 w-5" />
                Admin Approval Requests
              </CardTitle>
              <CardDescription className="text-red-700">
                {pendingAdmins.length} pending admin {pendingAdmins.length === 1 ? 'request' : 'requests'} requiring review
              </CardDescription>
            </div>
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {pendingAdmins.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Security Warning */}
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Security Notice</p>
              <p className="text-sm text-red-800 mt-1">
                Admin role grants full platform access including user management, data modification, and
                system configuration. Please verify applicants carefully before approval.
              </p>
            </div>
          </div>

          {/* Pending Admin List */}
          <div className="space-y-4">
            {pendingAdmins.map((applicant) => (
              <div
                key={applicant.uid}
                className="bg-white border-2 border-red-200 rounded-lg p-5 hover:border-red-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-neutral-900">
                        {applicant.displayName}
                      </h3>
                      <Badge className="bg-red-100 text-red-800 border-red-300">
                        Admin Request
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {/* Email */}
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <span>{applicant.email}</span>
                      </div>

                      {/* Phone */}
                      {applicant.phoneNumber && (
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Phone className="h-4 w-4 text-neutral-400" />
                          <span>{applicant.phoneNumber}</span>
                        </div>
                      )}

                      {/* Request Date */}
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        <span>Requested: {formatDate(applicant.createdAt)}</span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-amber-500 text-amber-700">
                          Pending Approval
                        </Badge>
                        {applicant.isEmailVerified && (
                          <Badge variant="outline" className="border-green-500 text-green-700">
                            Email Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    {applicant.metadata?.businessName && (
                      <div className="mt-3 p-3 bg-neutral-50 rounded border border-neutral-200">
                        <p className="text-sm text-neutral-600">
                          <span className="font-semibold">Organization:</span> {applicant.metadata.businessName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-200">
                  <Button
                    onClick={() => openActionDialog(applicant, 'approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve Admin Access
                  </Button>
                  <Button
                    onClick={() => openActionDialog(applicant, 'reject')}
                    variant="destructive"
                    className="flex-1"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Reject Request
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <Shield className="h-5 w-5 text-green-600" />
                  Approve Admin Request
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Admin Request
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'This will grant full admin privileges to this user. They will have complete access to all platform features, user data, and system settings.'
                : 'This will reject the admin request and deactivate the user account. They will not be able to access the platform.'}
            </DialogDescription>
          </DialogHeader>

          {selectedApplicant && (
            <div className="py-4">
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <p className="font-semibold text-lg mb-2">{selectedApplicant.displayName}</p>
                <div className="space-y-1 text-sm text-neutral-600">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedApplicant.email}
                  </p>
                  {selectedApplicant.phoneNumber && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedApplicant.phoneNumber}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Requested: {formatDate(selectedApplicant.createdAt)}
                  </p>
                </div>
              </div>

              {actionType === 'approve' && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Warning:</strong> Admin privileges cannot be easily revoked. Ensure you trust this
                    user before proceeding.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Confirm Rejection
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
