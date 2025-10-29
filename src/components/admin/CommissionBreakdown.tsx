/**
 * Commission Breakdown Component
 * Detailed analysis of platform commission and technician payouts
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  calculateCommissionBreakdown, 
  type CommissionDetails 
} from '@/services/revenueService';
import { formatCurrency } from '@/lib/utils';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Download,
  ExternalLink 
} from 'lucide-react';
import { SERVICE_TYPE_LABELS } from '@/types/booking';

interface CommissionBreakdownProps {
  className?: string;
  limit?: number;
}

export function CommissionBreakdown({ className, limit = 20 }: CommissionBreakdownProps) {
  const [loading, setLoading] = useState(true);
  const [commissionData, setCommissionData] = useState<CommissionDetails[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadCommissionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await calculateCommissionBreakdown();
      setCommissionData(data.slice(0, limit));
    } catch (err) {
      console.error('Error loading commission data:', err);
      setError('Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCommissionData();
  }, [limit]);

  // Calculate summary statistics
  const totalCommission = commissionData.reduce((sum, item) => sum + item.platformCommission, 0);
  const totalPayouts = commissionData.reduce((sum, item) => sum + item.technicianPayout, 0);
  const totalRevenue = commissionData.reduce((sum, item) => sum + item.finalCost, 0);
  const averageCommission = commissionData.length > 0 ? totalCommission / commissionData.length : 0;

  // Group by service type for insights
  const serviceTypeStats = commissionData.reduce((acc, item) => {
    const serviceType = item.serviceType;
    if (!acc[serviceType]) {
      acc[serviceType] = {
        count: 0,
        totalRevenue: 0,
        totalCommission: 0,
      };
    }
    acc[serviceType].count += 1;
    acc[serviceType].totalRevenue += item.finalCost;
    acc[serviceType].totalCommission += item.platformCommission;
    return acc;
  }, {} as Record<string, { count: number; totalRevenue: number; totalCommission: number }>);

  const exportData = () => {
    const csvContent = [
      ['Booking ID', 'Service Type', 'Service Package', 'Agreed Price', 'Final Cost', 'Platform Commission', 'Technician Payout', 'Completed Date'].join(','),
      ...commissionData.map(item => [
        item.bookingId,
        item.serviceType,
        item.servicePackage,
        item.agreedPrice,
        item.finalCost,
        item.platformCommission,
        item.technicianPayout,
        item.completedAt.toDate().toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-breakdown-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Commission Breakdown</CardTitle>
          <CardDescription>Detailed commission analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={loadCommissionData}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Commission Breakdown</CardTitle>
            <CardDescription>
              Detailed analysis of recent completed bookings
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              disabled={commissionData.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCommissionData}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading commission data...</p>
          </div>
        ) : commissionData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No commission data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Total Commission</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(totalCommission)}
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Technician Payouts</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(totalPayouts)}
                </p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-900">Total Revenue</span>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-900">Avg Commission</span>
                </div>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(averageCommission)}
                </p>
              </div>
            </div>

            {/* Service Type Breakdown */}
            {Object.keys(serviceTypeStats).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Revenue by Service Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(serviceTypeStats).map(([serviceType, stats]) => (
                    <div key={serviceType} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {SERVICE_TYPE_LABELS[serviceType as keyof typeof SERVICE_TYPE_LABELS] || serviceType}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {stats.count} jobs
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Commission:</span>
                          <span className="font-medium text-green-600">{formatCurrency(stats.totalCommission)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Table */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Completed Bookings</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Final Cost</TableHead>
                      <TableHead>Commission (10%)</TableHead>
                      <TableHead>Technician (90%)</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionData.map((item) => (
                      <TableRow key={item.bookingId}>
                        <TableCell className="font-mono text-xs">
                          {item.bookingId.slice(-8)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {SERVICE_TYPE_LABELS[item.serviceType as keyof typeof SERVICE_TYPE_LABELS] || item.serviceType}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.servicePackage}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.finalCost)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(item.platformCommission)}
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {formatCurrency(item.technicianPayout)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {item.completedAt.toDate().toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {commissionData.length >= limit && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Showing {limit} most recent completed bookings
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}