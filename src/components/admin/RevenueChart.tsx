/**
 * Revenue Chart Component
 * Visual representation of revenue trends over time
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  getRevenueByDateRange, 
  type RevenueBreakdown 
} from '@/services/revenueService';
import { formatCurrency } from '@/lib/utils';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';

interface RevenueChartProps {
  className?: string;
}

type DateRange = '7d' | '30d' | '90d';

export function RevenueChart({ className }: RevenueChartProps) {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueBreakdown[]>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange>('30d');
  const [error, setError] = useState<string | null>(null);

  const loadRevenueData = async (range: DateRange) => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();

      switch (range) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const data = await getRevenueByDateRange(startDate, endDate);
      setRevenueData(data);
    } catch (err) {
      console.error('Error loading revenue data:', err);
      setError('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRevenueData(selectedRange);
  }, [selectedRange]);

  const handleRangeChange = (range: DateRange) => {
    setSelectedRange(range);
  };

  // Calculate totals
  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const totalCommission = revenueData.reduce((sum, day) => sum + day.commission, 0);
  const totalBookings = revenueData.reduce((sum, day) => sum + day.bookings, 0);

  // Find max values for scaling
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  const getRangeLabel = (range: DateRange) => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Trends</CardTitle>
          <CardDescription>Revenue performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={() => loadRevenueData(selectedRange)}
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
            <CardTitle className="text-lg">Revenue Trends</CardTitle>
            <CardDescription>Revenue performance over time</CardDescription>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
              <Button
                key={range}
                variant={selectedRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRangeChange(range)}
              >
                {getRangeLabel(range)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading revenue data...</p>
          </div>
        ) : revenueData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No revenue data available for this period</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Platform Commission</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalCommission)}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Total Bookings</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {totalBookings}
                </p>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Daily Revenue Breakdown</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {revenueData.map((day) => (
                  <div key={day.date} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <div className="w-20 text-xs text-gray-500">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    {/* Revenue Bar */}
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <div className="w-20 text-xs font-medium text-right">
                        {formatCurrency(day.revenue)}
                      </div>
                    </div>
                    
                    {/* Bookings Count */}
                    <div className="w-12 text-xs text-gray-500 text-center">
                      {day.bookings} jobs
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Daily Revenue */}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average Daily Revenue:</span>
                <span className="font-medium">
                  {formatCurrency(revenueData.length > 0 ? totalRevenue / revenueData.length : 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Average Daily Commission:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(revenueData.length > 0 ? totalCommission / revenueData.length : 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}