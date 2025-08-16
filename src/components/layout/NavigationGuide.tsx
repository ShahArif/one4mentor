import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Video,
  Star,
  TrendingUp,
  Settings,
  User,
  Shield,
  BookOpen,
  Target,
  Briefcase,
  GraduationCap,
  Bell,
  Search,
  LayoutDashboard,
  BarChart3,
  LogOut,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavigationSection {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
  role?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

export function NavigationGuide() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const navigationSections: NavigationSection[] = [
    {
      title: "Dashboard & Overview",
      description: "Main dashboard and overview pages",
      icon: LayoutDashboard,
      items: [
        {
          name: "Candidate Dashboard",
          href: "/candidate/dashboard",
          description: "View your mentorship journey and progress",
          icon: LayoutDashboard,
          role: "candidate"
        },
        {
          name: "Mentor Dashboard",
          href: "/mentor/dashboard",
          description: "Manage your mentorship activities",
          icon: LayoutDashboard,
          role: "mentor"
        },
        {
          name: "Admin Dashboard",
          href: "/admin/dashboard",
          description: "Manage users and approve requests",
          icon: Shield,
          role: "super_admin"
        }
      ]
    },
    {
      title: "Mentorship & Requests",
      description: "Find mentors and manage requests",
      icon: Users,
      items: [
        {
          name: "Find Mentors",
          href: "/mentors",
          description: "Discover mentors in your field",
          icon: Search
        },
        {
          name: "My Requests",
          href: "/candidate/requests",
          description: "View your mentorship requests",
          icon: FileText,
          role: "candidate"
        },
        {
          name: "Mentorship Requests",
          href: "/mentor/requests",
          description: "Review incoming requests",
          icon: FileText,
          role: "mentor"
        }
      ]
    },
    {
      title: "Sessions & Learning",
      description: "Manage sessions and track progress",
      icon: Calendar,
      items: [
        {
          name: "Sessions",
          href: "/sessions",
          description: "Manage your mentorship sessions",
          icon: Calendar
        },
        {
          name: "Session Feedback",
          href: "/session-feedback",
          description: "Provide feedback on sessions",
          icon: Star
        },
        {
          name: "Learning Progress",
          href: "/learning-progress",
          description: "Track your skill development",
          icon: TrendingUp
        }
      ]
    },
    {
      title: "Communication",
      description: "Chat and video call features",
      icon: MessageSquare,
      items: [
        {
          name: "Chat",
          href: "/chat",
          description: "Message mentors and candidates",
          icon: MessageSquare
        },
        {
          name: "Video Calls",
          href: "/video-call",
          description: "Join video sessions",
          icon: Video
        }
      ]
    },
    {
      title: "Reviews & Feedback",
      description: "Rate and review experiences",
      icon: Star,
      items: [
        {
          name: "Reviews",
          href: "/reviews",
          description: "View and write reviews",
          icon: Star
        },
        {
          name: "Analytics",
          href: "/analytics",
          description: "Track your progress and insights",
          icon: TrendingUp
        }
      ]
    },
    {
      title: "Account & Settings",
      description: "Manage your account and preferences",
      icon: Settings,
      items: [
        {
          name: "Profile",
          href: "/profile",
          description: "Update your profile information",
          icon: User
        },
        {
          name: "Settings",
          href: "/settings",
          description: "Manage account settings",
          icon: Settings
        }
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Navigation Guide</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Complete overview of all available pages and features
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {navigationSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.title);
            
            return (
              <div key={section.title} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 space-y-3">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      
                      // Skip role-specific items if user doesn't have that role
                      if (item.role && item.role !== "candidate" && item.role !== "mentor" && item.role !== "super_admin") {
                        return null;
                      }
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50",
                            isActive(item.href) && "bg-blue-50 border border-blue-200"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg",
                            isActive(item.href)
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          )}>
                            <ItemIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className={cn(
                                "font-medium text-sm",
                                isActive(item.href) ? "text-blue-900" : "text-gray-900"
                              )}>
                                {item.name}
                              </h4>
                              {item.badge && (
                                <Badge variant={item.badgeVariant || "secondary"} className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.description}
                            </p>
                          </div>
                          {isActive(item.href) && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/mentors">
                <Plus className="h-4 w-4 mr-2" />
                Find Mentors
              </Link>
            </Button>
            
            <Button asChild size="sm" variant="outline">
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            
            <Button asChild size="sm" variant="outline">
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
