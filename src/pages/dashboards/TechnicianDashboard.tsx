/**
 * Technician Dashboard
 * Manage jobs, communicate with customers, update job status
 */

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, MapPin, Clock, CheckCircle } from 'lucide-react';

export function TechnicianDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Technician Dashboard</h1>
                <p className="text-sm text-neutral-600">Welcome, {profile?.displayName}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success">Available</Badge>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Today's Jobs</CardDescription>
              <CardTitle className="text-3xl">3</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Jobs</CardDescription>
              <CardTitle className="text-3xl">7</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed (Month)</CardDescription>
              <CardTitle className="text-3xl">42</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Rating</CardDescription>
              <CardTitle className="text-3xl">4.8⭐</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Today's Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-500" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Jobs assigned for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample Job */}
              <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">AC Installation - Villa 23</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      10:00 AM - 12:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      East Legon, Accra
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">In Progress</Badge>
                  <Button size="sm">View Details</Button>
                </div>
              </div>

              {/* No jobs message */}
              <p className="text-neutral-500 text-center py-8">
                No more jobs scheduled for today. Great work!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-500" />
                View All Jobs
              </CardTitle>
              <CardDescription>See all assigned and available jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Jobs</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Complete Job
              </CardTitle>
              <CardDescription>Mark a job as completed</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Complete
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-accent-500" />
                Request Parts
              </CardTitle>
              <CardDescription>Order parts from inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
