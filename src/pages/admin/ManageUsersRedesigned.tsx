/**
 * Manage Users Page - Redesigned
 * Admin interface for user management
 * Google Stitch-inspired design - October 2025
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
// import { AdminApprovals } from '@/components/admin/AdminApprovals';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  // Filter,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  getAllUsers,
  getPendingApprovalUsers,
  approveUser,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  deleteUserProfile,
} from '@/services/userService';
import type { UserProfile, UserRole } from '@/types/user';
import { USER_ROLE_LABELS } from '@/types/user';
import { toast } from '@/components/ui/use-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function ManageUsersRedesigned() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'deactivate' | 'activate' | 'delete' | 'role'>('approve');
  const [newRole, setNewRole] = useState<UserRole>('customer');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const pending = await getPendingApprovalUsers();
      setPendingUsers(pending);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((user) => user.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((user) => !user.isActive);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter((user) => !user.isApproved);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleSelectUser = (uid: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(uid)) {
      newSelected.delete(uid);
    } else {
      newSelected.add(uid);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.uid)));
    }
  };

  const openActionDialog = (user: UserProfile, action: typeof actionType) => {
    setSelectedUser(user);
    setActionType(action);
    if (action === 'role') {
      setNewRole(user.role);
    }
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedUser) return;

    setProcessing(true);
    try {
      switch (actionType) {
        case 'approve':
          await approveUser(selectedUser.uid);
          break;
        case 'deactivate':
          await deactivateUser(selectedUser.uid);
          break;
        case 'activate':
          await reactivateUser(selectedUser.uid);
          break;
        case 'delete':
          await deleteUserProfile(selectedUser.uid);
          break;
        case 'role':
          await updateUserRole(selectedUser.uid, newRole);
          break;
      }

      // Refresh data
      await fetchUsers();
      await fetchPendingUsers();
      setActionDialogOpen(false);
      setSelectedUser(null);
      const actionMessages: Record<typeof actionType, { title: string; description: string; variant?: 'success' | 'default' | 'destructive' }> = {
        approve: {
          title: 'User approved',
          description: `${selectedUser.displayName} can now access the platform.`,
          variant: 'success',
        },
        deactivate: {
          title: 'User deactivated',
          description: `${selectedUser.displayName}'s account is now inactive.`,
        },
        activate: {
          title: 'User reactivated',
          description: `${selectedUser.displayName} can log in again.`,
          variant: 'success',
        },
        delete: {
          title: 'User removed',
          description: `${selectedUser.displayName}'s access has been revoked.`,
        },
        role: {
          title: 'Role updated',
          description: `${selectedUser.displayName} is now a ${USER_ROLE_LABELS[newRole]}.`,
          variant: 'success',
        },
      };
      const message = actionMessages[actionType];
      toast({
        title: message.title,
        description: message.description,
        variant: message.variant ?? 'default',
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

  const handleBulkApprove = async () => {
    if (selectedUsers.size === 0) return;

    setProcessing(true);
    try {
      await Promise.all(
        Array.from(selectedUsers).map((uid) => approveUser(uid))
      );
      await fetchUsers();
      await fetchPendingUsers();
      setSelectedUsers(new Set());
      toast({
        title: 'Users approved',
        description: `${selectedUsers.size} account${selectedUsers.size === 1 ? '' : 's'} have been approved.`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error bulk approving:', error);
      toast({
        title: 'Bulk approval failed',
        description: 'Failed to approve users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Approved', 'Created'];
    const rows = filteredUsers.map((user) => [
      user.displayName || '',
      user.email || '',
      USER_ROLE_LABELS[user.role],
      user.isActive ? 'Active' : 'Inactive',
      user.isApproved ? 'Yes' : 'No',
      user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: { toDate: () => Date } | Date | string | undefined) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'object' && 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800 border-blue-200',
      technician: 'bg-green-100 text-green-800 border-green-200',
      supplier: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-red-100 text-red-800 border-red-200',
      trainee: 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle={`${filteredUsers.length} ${filteredUsers.length === 1 ? 'user' : 'users'}${selectedUsers.size > 0 ? ` • ${selectedUsers.size} selected` : ''}`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'User Management' }
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchUsers()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-neutral-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-neutral-900">{users.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-neutral-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold text-green-600">
                {users.filter((u) => u.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-neutral-600 mb-1">Pending Approval</p>
              <p className="text-3xl font-bold text-amber-600">
                {pendingUsers.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-neutral-600 mb-1">Inactive Users</p>
              <p className="text-3xl font-bold text-red-600">
                {users.filter((u) => !u.isActive).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Section */}
        {pendingUsers.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <AlertCircle className="h-5 w-5" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription className="text-amber-800">
                    {pendingUsers.length} {pendingUsers.length === 1 ? 'user requires' : 'users require'} approval
                  </CardDescription>
                </div>
                {selectedUsers.size > 0 && (
                  <Button onClick={handleBulkApprove} disabled={processing} size="sm">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve Selected ({selectedUsers.size})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedUsers.has(user.uid)}
                        onCheckedChange={() => handleSelectUser(user.uid)}
                      />
                      <div>
                        <p className="font-semibold text-neutral-900">{user.displayName}</p>
                        <p className="text-sm text-neutral-600">{user.email}</p>
                      </div>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {USER_ROLE_LABELS[user.role]}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        const userProfile: UserProfile = {
                          ...user,
                          uid: user.uid,
                        };
                        openActionDialog(userProfile, 'approve');
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="technician">Technicians</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="trainee">Trainees</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100">
                  <AlertCircle className="h-8 w-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.size === filteredUsers.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Joined</TableHead>
                      <TableHead className="font-semibold">Last Login</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.uid} className="hover:bg-neutral-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(user.uid)}
                            onCheckedChange={() => handleSelectUser(user.uid)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-neutral-900">{user.displayName}</p>
                            <p className="text-sm text-neutral-600">{user.email}</p>
                            {user.phoneNumber && (
                              <p className="text-xs text-neutral-500">{user.phoneNumber}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {USER_ROLE_LABELS[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user.isActive ? (
                              <Badge variant="outline" className="border-green-500 text-green-700 w-fit">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-500 text-red-700 w-fit">
                                Inactive
                              </Badge>
                            )}
                            {!user.isApproved && (
                              <Badge variant="outline" className="border-amber-500 text-amber-700 w-fit">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600">
                          {formatDate(user.lastLoginAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {!user.isApproved && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openActionDialog(user, 'approve')}
                                title="Approve User"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openActionDialog(user, 'role')}
                              title="Change Role"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.isActive ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openActionDialog(user, 'deactivate')}
                                title="Deactivate User"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openActionDialog(user, 'activate')}
                                title="Activate User"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openActionDialog(user, 'delete')}
                              title="Delete User"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve User'}
              {actionType === 'deactivate' && 'Deactivate User'}
              {actionType === 'activate' && 'Activate User'}
              {actionType === 'delete' && 'Delete User'}
              {actionType === 'role' && 'Change User Role'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' &&
                'This will approve the user and grant them access to the platform.'}
              {actionType === 'deactivate' &&
                'This will deactivate the user account and prevent them from logging in.'}
              {actionType === 'activate' &&
                'This will reactivate the user account and allow them to log in again.'}
              {actionType === 'delete' &&
                'This will permanently deactivate the user. This action cannot be undone.'}
              {actionType === 'role' && 'Select the new role for this user.'}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="bg-neutral-50 p-3 rounded-lg mb-4">
                <p className="font-semibold text-neutral-900">{selectedUser.displayName}</p>
                <p className="text-sm text-neutral-600">{selectedUser.email}</p>
                <Badge className={`mt-2 ${getRoleBadgeColor(selectedUser.role)}`}>
                  {USER_ROLE_LABELS[selectedUser.role]}
                </Badge>
              </div>

              {actionType === 'role' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Role</label>
                  <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="trainee">Trainee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' && 'Approve'}
                  {actionType === 'deactivate' && 'Deactivate'}
                  {actionType === 'activate' && 'Activate'}
                  {actionType === 'delete' && 'Delete'}
                  {actionType === 'role' && 'Change Role'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
