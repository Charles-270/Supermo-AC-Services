/**
 * Manage Users Page
 * Admin interface for user management
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  ArrowLeft,
  Search,
  Filter,
  UserPlus,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Shield,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  Eye,
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

export default function ManageUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
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

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

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

  const filterUsers = () => {
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
  };

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800',
      technician: 'bg-green-100 text-green-800',
      supplier: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      trainee: 'bg-amber-100 text-amber-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
                <p className="text-sm text-neutral-600">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                  {selectedUsers.size > 0 && ` • ${selectedUsers.size} selected`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fetchUsers()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="secondary" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Users</CardDescription>
              <CardTitle className="text-3xl">
                {users.filter((u) => u.isActive).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Approval</CardDescription>
              <CardTitle className="text-3xl text-amber-600">
                {pendingUsers.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Inactive Users</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {users.filter((u) => !u.isActive).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Pending Approvals Section */}
        {pendingUsers.length > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription className="text-amber-800">
                    {pendingUsers.length} {pendingUsers.length === 1 ? 'user requires' : 'users require'} approval
                  </CardDescription>
                </div>
                {selectedUsers.size > 0 && (
                  <Button onClick={handleBulkApprove} disabled={processing}>
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
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedUsers.has(user.uid)}
                        onCheckedChange={() => handleSelectUser(user.uid)}
                      />
                      <div>
                        <p className="font-semibold">{user.displayName}</p>
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
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
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

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.size === filteredUsers.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.uid)}
                          onCheckedChange={() => handleSelectUser(user.uid)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{user.displayName}</p>
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
                            className="text-destructive-500 hover:text-destructive-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

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
                <p className="font-semibold">{selectedUser.displayName}</p>
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
    </div>
  );
}
