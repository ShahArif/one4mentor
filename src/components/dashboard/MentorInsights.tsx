import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  BarChart3,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MentorInsightsProps {
  mentorId: string;
}

interface ChartData {
  date: string;
  value: number;
}

interface CandidateProgress {
  id: string;
  name: string;
  progress: number;
  lastActivity: string;
  status: 'active' | 'completed' | 'stalled';
}

export function MentorInsights({ mentorId }: MentorInsightsProps) {
  const [dateFilter, setDateFilter] = useState('30d');
  const [requestsData, setRequestsData] = useState<ChartData[]>([]);
  const [earningsData, setEarningsData] = useState<ChartData[]>([]);
  const [candidateProgress, setCandidateProgress] = useState<CandidateProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    acceptedRequests: 0,
    rejectionRate: 0,
    totalEarnings: 0,
    avgEarningsPerMonth: 0,
    activeCandidates: 0,
    completedCandidates: 0,
    avgProgress: 0
  });

  useEffect(() => {
    if (mentorId) {
      fetchInsightsData();
    }
  }, [mentorId, dateFilter]);

  const fetchInsightsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch requests data
      await fetchRequestsData();
      
      // Fetch earnings data
      await fetchEarningsData();
      
      // Fetch candidate progress
      await fetchCandidateProgress();
      
      // Calculate overall stats
      calculateOverallStats();
      
    } catch (error) {
      console.error('Error fetching insights data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequestsData = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select('created_at, status')
        .eq('mentor_id', mentorId)
        .gte('created_at', getDateFilterValue());

      if (error) throw error;

      // Process data for chart
      const processedData = processRequestsData(data || []);
      setRequestsData(processedData);
    } catch (error) {
      console.error('Error fetching requests data:', error);
    }
  };

  const fetchEarningsData = async () => {
    try {
      // Mock earnings data - replace with actual earnings table when available
      const mockEarnings = generateMockEarningsData();
      setEarningsData(mockEarnings);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    }
  };

  const fetchCandidateProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select(`
          id,
          candidate_id,
          status,
          created_at
        `)
        .eq('mentor_id', mentorId)
        .eq('status', 'accepted');

      if (error) throw error;

      // Mock candidate progress data - replace with actual progress tracking
      const mockProgress = generateMockCandidateProgress(data || []);
      setCandidateProgress(mockProgress);
    } catch (error) {
      console.error('Error fetching candidate progress:', error);
    }
  };

  const processRequestsData = (data: any[]): ChartData[] => {
    const dateMap = new Map<string, { received: number; accepted: number }>();
    
    data.forEach(request => {
      const date = new Date(request.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { received: 0, accepted: 0 });
      }
      
      const current = dateMap.get(date)!;
      current.received++;
      
      if (request.status === 'accepted') {
        current.accepted++;
      }
    });

    return Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      value: counts.received,
      accepted: counts.accepted
    }));
  };

  const generateMockEarningsData = (): ChartData[] => {
    const days = 30;
    const data: ChartData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 2000) + 500 // Random earnings between 500-2500
      });
    }
    
    return data;
  };

  const generateMockCandidateProgress = (acceptedRequests: any[]): CandidateProgress[] => {
    return acceptedRequests.slice(0, 5).map((request, index) => ({
      id: request.id,
      name: `Candidate ${index + 1}`,
      progress: Math.floor(Math.random() * 100) + 10, // Random progress 10-100%
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: ['active', 'completed', 'stalled'][Math.floor(Math.random() * 3)] as any
    }));
  };

  const calculateOverallStats = () => {
    // Calculate overall statistics
    const totalRequests = requestsData.reduce((sum, item) => sum + item.value, 0);
    const totalAccepted = requestsData.reduce((sum, item) => sum + (item as any).accepted, 0);
    const rejectionRate = totalRequests > 0 ? ((totalRequests - totalAccepted) / totalRequests) * 100 : 0;
    
    const totalEarnings = earningsData.reduce((sum, item) => sum + item.value, 0);
    const avgEarningsPerMonth = totalEarnings / (parseInt(dateFilter) / 30);
    
    const activeCandidates = candidateProgress.filter(c => c.status === 'active').length;
    const completedCandidates = candidateProgress.filter(c => c.status === 'completed').length;
    const avgProgress = candidateProgress.length > 0 
      ? candidateProgress.reduce((sum, c) => sum + c.progress, 0) / candidateProgress.length 
      : 0;

    setStats({
      totalRequests,
      acceptedRequests: totalAccepted,
      rejectionRate,
      totalEarnings,
      avgEarningsPerMonth,
      activeCandidates,
      completedCandidates,
      avgProgress
    });
  };

  const getDateFilterValue = () => {
    const now = new Date();
    switch (dateFilter) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'stalled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'stalled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Insights</h2>
          <p className="text-gray-600">Track your mentorship performance and progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Time Period:</span>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                <p className="text-xs text-gray-500">
                  {stats.acceptedRequests} accepted
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  Avg: ₹{Math.round(stats.avgEarningsPerMonth).toLocaleString()}/month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCandidates}</p>
                <p className="text-xs text-gray-500">
                  {stats.completedCandidates} completed
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgProgress)}%</p>
                <p className="text-xs text-gray-500">
                  Across all candidates
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Requests Received vs Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestsData.length > 0 ? (
                <div className="space-y-3">
                  {requestsData.slice(-7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-16">{item.date}</span>
                      <div className="flex-1 mx-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.value / Math.max(...requestsData.map(d => d.value))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {item.value}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Accepted: {(item as any).accepted || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No request data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Earnings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earningsData.length > 0 ? (
                <div className="space-y-3">
                  {earningsData.slice(-7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-16">{item.date}</span>
                      <div className="flex-1 mx-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(item.value / Math.max(...earningsData.map(d => d.value))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-16 text-right">
                            ₹{item.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No earnings data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Candidate Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {candidateProgress.length > 0 ? (
              candidateProgress.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                      <p className="text-sm text-gray-500">
                        Last activity: {candidate.lastActivity}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{candidate.progress}%</p>
                      <Progress value={candidate.progress} className="w-24" />
                    </div>
                    <Badge className={getStatusColor(candidate.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(candidate.status)}
                        <span className="capitalize">{candidate.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No candidate progress data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Acceptance Rate</span>
              <span className="font-medium">
                {stats.totalRequests > 0 ? Math.round((stats.acceptedRequests / stats.totalRequests) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rejection Rate</span>
              <span className="font-medium text-red-600">
                {Math.round(stats.rejectionRate)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="font-medium">2.3 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="font-medium text-green-600">87%</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Target className="h-4 w-4 mr-2" />
              Update Progress
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Feedback
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
