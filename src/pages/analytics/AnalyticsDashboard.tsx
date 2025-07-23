import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Star,
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart
} from "lucide-react";

const performanceMetrics = {
  totalSessions: 156,
  monthlyGrowth: 23,
  averageRating: 4.8,
  totalEarnings: 245000,
  responseRate: 98,
  completionRate: 95
};

const monthlyData = [
  { month: "Jan", sessions: 12, earnings: 18000, newClients: 8 },
  { month: "Feb", sessions: 15, earnings: 22500, newClients: 10 },
  { month: "Mar", sessions: 18, earnings: 27000, newClients: 12 },
  { month: "Apr", sessions: 20, earnings: 30000, newClients: 14 },
  { month: "May", sessions: 22, earnings: 33000, newClients: 16 },
  { month: "Jun", sessions: 25, earnings: 37500, newClients: 18 }
];

const sessionTypes = [
  { type: "Technical Interview", count: 45, percentage: 35, earnings: 90000 },
  { type: "System Design", count: 32, percentage: 25, earnings: 64000 },
  { type: "Career Guidance", count: 28, percentage: 22, earnings: 42000 },
  { type: "Resume Review", count: 23, percentage: 18, earnings: 34500 }
];

const topSkills = [
  { skill: "JavaScript", sessions: 42, satisfaction: 4.9 },
  { skill: "System Design", sessions: 38, satisfaction: 4.8 },
  { skill: "React", sessions: 35, satisfaction: 4.7 },
  { skill: "Python", sessions: 28, satisfaction: 4.6 },
  { skill: "Data Structures", sessions: 25, satisfaction: 4.8 }
];

const recentAchievements = [
  { title: "Top Mentor Badge", description: "Awarded for maintaining 4.8+ rating", date: "This month" },
  { title: "100 Sessions Milestone", description: "Completed 100 successful sessions", date: "Last month" },
  { title: "Expert Certification", description: "JavaScript & React expertise verified", date: "2 months ago" }
];

export default function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your mentoring performance and growth</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{performanceMetrics.totalSessions}</p>
                      <p className="text-xs text-muted-foreground">Total Sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">+{performanceMetrics.monthlyGrowth}%</p>
                      <p className="text-xs text-muted-foreground">Monthly Growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-2xl font-bold">{performanceMetrics.averageRating}</p>
                      <p className="text-xs text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">₹{(performanceMetrics.totalEarnings / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">Total Earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{performanceMetrics.responseRate}%</p>
                      <p className="text-xs text-muted-foreground">Response Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{performanceMetrics.completionRate}%</p>
                      <p className="text-xs text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Types Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Session Types Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionTypes.map((type, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type.type}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">{type.count} sessions</span>
                          <span className="font-medium">₹{(type.earnings / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                      <Progress value={type.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="outline">{achievement.date}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Top Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Top Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{skill.skill}</h4>
                        <p className="text-sm text-muted-foreground">{skill.sessions} sessions completed</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{skill.satisfaction}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Satisfaction</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">Monthly Sessions</h4>
                    <div className="space-y-3">
                      {monthlyData.map((month, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <span className="w-12 text-sm">{month.month}</span>
                          <div className="flex-1">
                            <Progress value={(month.sessions / 25) * 100} className="h-2" />
                          </div>
                          <span className="w-16 text-sm text-right">{month.sessions}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold">₹37,500</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold">₹1,500</p>
                  <p className="text-sm text-muted-foreground">Avg per Session</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold">25</p>
                  <p className="text-sm text-muted-foreground">Sessions This Month</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Earnings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{month.month} 2024</h4>
                        <p className="text-sm text-muted-foreground">
                          {month.sessions} sessions • {month.newClients} new clients
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₹{month.earnings.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{Math.round(month.earnings / month.sessions).toLocaleString()}/session
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-800">Strong Growth</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your sessions increased by 23% this month, with technical interviews being most popular.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-800">High Satisfaction</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your 4.8-star rating puts you in the top 10% of mentors on the platform.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Expand System Design Sessions</h4>
                    <p className="text-sm text-muted-foreground">
                      High demand and great ratings. Consider increasing availability.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Peak Hours Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Most bookings happen 6-9 PM. Consider scheduling more sessions during these hours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Monthly Sessions Target</span>
                      <span className="text-sm text-muted-foreground">25/30</span>
                    </div>
                    <Progress value={83} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Earnings Goal</span>
                      <span className="text-sm text-muted-foreground">₹37,500/₹40,000</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Response Time Goal</span>
                      <span className="text-sm text-muted-foreground">2.1/2.0 hours</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}