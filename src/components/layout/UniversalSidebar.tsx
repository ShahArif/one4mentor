import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home,
  Users,
  MessageCircle,
  BookOpen,
  User,
  Settings,
  BarChart3,
  Calendar,
  Star,
  TrendingUp,
  Search,
  FileText,
  MessageSquare,
  Target,
  Clock,
  Award
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface UniversalSidebarProps {
  className?: string;
  pendingRequests?: number;
  acceptedCandidates?: number;
  sessionsThisMonth?: number;
  totalRequests?: number;
  totalRoadmaps?: number;
}

export function UniversalSidebar({ 
  className, 
  pendingRequests = 0, 
  acceptedCandidates = 0, 
  sessionsThisMonth = 0,
  totalRequests = 0,
  totalRoadmaps = 0
}: UniversalSidebarProps) {
  const location = useLocation();
  const { roles } = useAuth();

  const isCandidate = roles.includes('candidate');
  const isMentor = roles.includes('mentor');
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');

  const getNavigationItems = () => {
    if (isMentor) {
      return [
        {
          name: "Dashboard",
          href: "/mentor/dashboard",
          icon: Home,
          description: "Overview and quick stats"
        },
        {
          name: "Browse Candidates",
          href: "/mentors",
          icon: Users,
          description: "Find potential mentees"
        },
        {
          name: "Mentorship Requests",
          href: "/mentor/requests",
          icon: MessageCircle,
          description: "Review incoming requests"
        },
        {
          name: "My Candidates",
          href: "/mentor/candidates",
          icon: BookOpen,
          description: "Manage accepted mentees"
        },
        {
          name: "Sessions",
          href: "/sessions",
          icon: Calendar,
          description: "Schedule and manage sessions"
        },
        {
          name: "Analytics",
          href: "/analytics",
          icon: TrendingUp,
          description: "Track progress and insights"
        },
        {
          name: "Reviews",
          href: "/reviews",
          icon: Star,
          description: "View and manage reviews"
        },
        {
          name: "Profile",
          href: "/profile/edit",
          icon: User,
          description: "Edit your profile"
        },
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
          description: "Account and preferences"
        }
      ];
    } else if (isCandidate) {
      return [
        {
          name: "Dashboard",
          href: "/candidate/dashboard",
          icon: Home,
          description: "Overview and progress"
        },
        {
          name: "Find Mentors",
          href: "/mentors",
          icon: Search,
          description: "Discover mentors in your field"
        },
        {
          name: "My Requests",
          href: "/candidate/requests",
          icon: FileText,
          description: "View your mentorship requests"
        },
        {
          name: "Learning Roadmaps",
          href: "/candidate/roadmaps",
          icon: BookOpen,
          description: "Track your learning progress"
        },
        {
          name: "Sessions",
          href: "/sessions",
          icon: Calendar,
          description: "Manage your sessions"
        },
        {
          name: "Chat",
          href: "/chat",
          icon: MessageSquare,
          description: "Message mentors"
        },
        {
          name: "Reviews",
          href: "/reviews",
          icon: Star,
          description: "View and write reviews"
        },
        {
          name: "Analytics",
          href: "/analytics",
          icon: TrendingUp,
          description: "Track your progress"
        },
        {
          name: "Profile",
          href: "/profile/edit",
          icon: User,
          description: "Edit your profile"
        },
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
          description: "Account and preferences"
        }
      ];
    } else if (isAdmin) {
      return [
        {
          name: "Dashboard",
          href: "/admin/dashboard",
          icon: Home,
          description: "Admin overview"
        },
        {
          name: "Users",
          href: "/admin/users",
          icon: Users,
          description: "Manage all users"
        },
        {
          name: "Mentorship Requests",
          href: "/admin/requests",
          icon: MessageCircle,
          description: "Review all requests"
        },
        {
          name: "Analytics",
          href: "/admin/analytics",
          icon: TrendingUp,
          description: "System analytics"
        },
        {
          name: "Settings",
          href: "/admin/settings",
          icon: Settings,
          description: "System settings"
        }
      ];
    }
    return [];
  };

  const getQuickStats = () => {
    if (isMentor) {
      return [
        { label: "Active Mentees", value: acceptedCandidates },
        { label: "Pending Requests", value: pendingRequests },
        { label: "Sessions This Month", value: sessionsThisMonth }
      ];
    } else if (isCandidate) {
      return [
        { label: "Total Requests", value: totalRequests },
        { label: "Learning Roadmaps", value: totalRoadmaps },
        { label: "Pending Requests", value: pendingRequests }
      ];
    } else if (isAdmin) {
      return [
        { label: "Total Users", value: 0 },
        { label: "Active Requests", value: 0 },
        { label: "System Status", value: "Healthy" }
      ];
    }
    return [];
  };

  const getSidebarTitle = () => {
    if (isMentor) return { title: "Mentor Portal", subtitle: "Manage your mentorship" };
    if (isCandidate) return { title: "Candidate Portal", subtitle: "Track your learning" };
    if (isAdmin) return { title: "Admin Portal", subtitle: "System management" };
    return { title: "Portal", subtitle: "Navigation" };
  };

  const navigationItems = getNavigationItems();
  const quickStats = getQuickStats();
  const { title, subtitle } = getSidebarTitle();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn("bg-white border-r border-gray-200 h-full", className)}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActiveItem = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50",
                isActiveItem
                  ? "bg-blue-50 border-r-2 border-blue-500 text-blue-700"
                  : "text-gray-700 hover:text-gray-900"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isActiveItem
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-medium text-sm transition-colors",
                  isActiveItem
                    ? "text-blue-900"
                    : "text-gray-900 group-hover:text-blue-900"
                )}>
                  {item.name}
                </h3>
                <p className={cn(
                  "text-xs mt-1 transition-colors",
                  isActiveItem
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-600"
                )}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats Summary */}
      {quickStats.length > 0 && (
        <div className="p-4 border-t border-gray-200 mt-auto">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
          <div className="space-y-2">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{stat.label}</span>
                <span className="font-medium text-gray-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
