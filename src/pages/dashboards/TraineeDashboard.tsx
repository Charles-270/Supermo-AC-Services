/**
 * Trainee Dashboard
 * Access training courses, track progress, earn certificates
 */

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Award, Play, Clock } from 'lucide-react';

export function TraineeDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Training Portal</h1>
                <p className="text-sm text-neutral-600">Welcome, {profile?.displayName}!</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Enrolled Courses</CardDescription>
              <CardTitle className="text-3xl">4</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed Courses</CardDescription>
              <CardTitle className="text-3xl">2</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Certificates Earned</CardDescription>
              <CardTitle className="text-3xl">2</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overall Progress</CardDescription>
              <CardTitle className="text-3xl">65%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Current Courses */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-500" />
              My Courses
            </CardTitle>
            <CardDescription>Continue learning where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample Course */}
              <div className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="h-16 w-16 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">HVAC Fundamentals</h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    Learn the basics of heating, ventilation, and air conditioning
                  </p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      8 hours
                    </span>
                    <span>Module 3 of 8</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="warning">In Progress</Badge>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Continue
                  </Button>
                </div>
              </div>

              {/* Another Course */}
              <div className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="h-16 w-16 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-accent-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Advanced Refrigeration Systems</h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    Master complex refrigeration troubleshooting
                  </p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      12 hours
                    </span>
                    <span>Module 1 of 10</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-500 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge>Just Started</Badge>
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-success" />
                My Certificates
              </CardTitle>
              <CardDescription>View and download earned certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                View Certificates
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-500" />
                Browse Courses
              </CardTitle>
              <CardDescription>Explore available training programs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Browse Catalog</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
