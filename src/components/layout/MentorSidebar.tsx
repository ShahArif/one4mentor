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
  TrendingUp
} from "lucide-react";

interface MentorSidebarProps {
  className?: string;
  pendingRequests?: number;
  acceptedCandidates?: number;
  sessionsThisMonth?: number;
}

export function MentorSidebar({ className, pendingRequests, acceptedCandidates, sessionsThisMonth }: MentorSidebarProps) {
  const location = useLocation();

  const navigationItems = [
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn("bg-white border-r border-gray-200 h-full", className)}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Mentor Portal</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your mentorship</p>
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
      <div className="p-4 border-t border-gray-200 mt-auto">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Active Mentees</span>
            <span className="font-medium text-gray-900">{acceptedCandidates || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Pending Requests</span>
            <span className="font-medium text-gray-900">{pendingRequests || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Sessions This Month</span>
            <span className="font-medium text-gray-900">{sessionsThisMonth || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
