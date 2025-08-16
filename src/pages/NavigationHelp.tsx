import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { NavigationGuide } from "@/components/layout/NavigationGuide";
import { QuickNav } from "@/components/layout/QuickNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Compass, 
  Users, 
  MessageSquare, 
  Calendar,
  Star,
  TrendingUp,
  Settings,
  User,
  Shield,
  Search,
  FileText,
  Video,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";

export default function NavigationHelp() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Navigation Help</h2>
            <p className="text-gray-600 mb-4">
              Please log in to access the navigation guide.
            </p>
            <Button asChild>
              <Link to="/auth/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout showSidebar={false}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Navigation Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find your way around the platform with our comprehensive navigation guide. 
            Discover all available features and pages organized by category.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-12">
          <QuickNav />
        </div>

        {/* Navigation Guide */}
        <div className="mb-12">
          <NavigationGuide />
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Find Mentors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Discover mentors in your field, view their profiles, and send mentorship requests.
              </p>
              <Button asChild size="sm" className="w-full">
                <Link to="/mentors">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Mentors
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>Communication</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Chat with mentors, join video calls, and stay connected throughout your mentorship journey.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/chat">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Schedule and manage your mentorship sessions, track progress, and provide feedback.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/sessions">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Sessions
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Reviews & Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Rate your mentorship experiences and read reviews from other users.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/reviews">
                  <Star className="h-4 w-4 mr-2" />
                  View Reviews
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span>Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Track your learning progress, view insights, and monitor your mentorship journey.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>Account Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage your profile, update preferences, and control your account settings.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Open Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help & Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Compass className="h-5 w-5" />
              <span>Need More Help?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              If you're still having trouble navigating the platform, here are some additional resources:
            </p>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• Check the navigation guide above for detailed page descriptions</p>
              <p>• Use the quick navigation panel for frequently accessed pages</p>
              <p>• Contact support if you need assistance with specific features</p>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/mentors">
                  <Search className="h-4 w-4 mr-2" />
                  Start Exploring
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
