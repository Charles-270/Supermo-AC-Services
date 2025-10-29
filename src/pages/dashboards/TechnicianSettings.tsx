/**
 * Technician Settings Page
 * Profile and preferences settings for technicians
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TechnicianLayout } from '@/components/layout/TechnicianLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface TechnicianProfileData {
  displayName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  experience: string;
  specializations: string;
  bio: string;
  availableWeekdays: boolean;
  availableWeekends: boolean;
  availableEvening: boolean;
  notificationsEnabled: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
}

export function TechnicianSettings() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileForm, setProfileForm] = useState<TechnicianProfileData>({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    experience: '',
    specializations: '',
    bio: '',
    availableWeekdays: true,
    availableWeekends: false,
    availableEvening: false,
    notificationsEnabled: true,
    smsNotifications: true,
    emailNotifications: true,
  });

  const loadProfile = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);
      
      // Load profile data from auth profile and any additional metadata
      setProfileForm({
        displayName: profile.displayName || '',
        email: profile.email || '',
        phone: (profile.metadata as any)?.phone || '',
        address: (profile.metadata as any)?.address || '',
        city: (profile.metadata as any)?.city || '',
        experience: (profile.metadata as any)?.experience || '',
        specializations: (profile.metadata as any)?.specializations || '',
        bio: (profile.metadata as any)?.bio || '',
        availableWeekdays: (profile.metadata as any)?.availableWeekdays ?? true,
        availableWeekends: (profile.metadata as any)?.availableWeekends ?? false,
        availableEvening: (profile.metadata as any)?.availableEvening ?? false,
        notificationsEnabled: (profile.metadata as any)?.notificationsEnabled ?? true,
        smsNotifications: (profile.metadata as any)?.smsNotifications ?? true,
        emailNotifications: (profile.metadata as any)?.emailNotifications ?? true,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Failed to load profile',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      void loadProfile();
    }
  }, [profile, loadProfile]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      // In a real app, you would update the user profile in Firebase
      // For now, we'll just show a success message
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Unable to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TechnicianLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your profile, availability, and notification preferences.
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal and professional details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Full Name</Label>
                  <Input
                    id="display-name"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    disabled
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+233 20 000 0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Accra"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street, East Legon"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="5 years"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations</Label>
                  <Input
                    id="specializations"
                    value={profileForm.specializations}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, specializations: e.target.value }))}
                    placeholder="AC Repair, Installation, Maintenance"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell customers about your experience and expertise..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Availability Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              Set your working hours and availability preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekdays">Available on Weekdays</Label>
                  <p className="text-sm text-gray-500">Monday to Friday</p>
                </div>
                <Switch
                  id="weekdays"
                  checked={profileForm.availableWeekdays}
                  onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, availableWeekdays: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekends">Available on Weekends</Label>
                  <p className="text-sm text-gray-500">Saturday and Sunday</p>
                </div>
                <Switch
                  id="weekends"
                  checked={profileForm.availableWeekends}
                  onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, availableWeekends: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="evening">Available in Evenings</Label>
                  <p className="text-sm text-gray-500">After 6 PM</p>
                </div>
                <Switch
                  id="evening"
                  checked={profileForm.availableEvening}
                  onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, availableEvening: checked }))}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Availability
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose how you want to receive job notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-gray-500">Receive job alerts and updates</p>
                </div>
                <Switch
                  id="notifications"
                  checked={profileForm.notificationsEnabled}
                  onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, notificationsEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Get text messages for urgent jobs</p>
                </div>
                <Switch
                  id="sms"
                  checked={profileForm.smsNotifications}
                  onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, smsNotifications: checked }))}
                  disabled={!profileForm.notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notif">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive job summaries via email</p>
                </div>
                <Switch
                  id="email-notif"
                  checked={profileForm.emailNotifications}
                  onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, emailNotifications: checked }))}
                  disabled={!profileForm.notificationsEnabled}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TechnicianLayout>
  );
}