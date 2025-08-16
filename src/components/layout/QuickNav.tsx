import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Search,
  MessageSquare,
  Calendar,
  FileText,
  Users,
  Star,
  TrendingUp,
  Settings,
  User,
  BookOpen,
  MessageCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { NavigationGuide } from "./NavigationGuide";

interface QuickNavProps {
  className?: string;
}

export function QuickNav({ className }: QuickNavProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [showNavigationGuide, setShowNavigationGuide] = useState(false);

  if (!user) return null;

  const quickActions = [
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
      description: "View your mentorship requests",
      role: "candidate"
    },
    {
      name: "Mentorship Requests",
      href: "/mentor/requests",
      icon: FileText,
      description: "Review incoming requests",
      role: "mentor"
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
      description: "Message mentors and candidates"
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
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg p-4", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          // Skip role-specific actions if user doesn't have that role
          if (action.role && action.role !== "candidate" && action.role !== "mentor") {
            return null;
          }
          
          return (
            <Link
              key={action.name}
              to={action.href}
              className={cn(
                "group p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                isActive(action.href)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive(action.href)
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-sm transition-colors",
                    isActive(action.href)
                      ? "text-blue-900"
                      : "text-gray-900 group-hover:text-blue-900"
                  )}>
                    {action.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/candidate/requests">
              <MessageCircle className="h-4 w-4 mr-2" />
              My Requests
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/candidate/roadmaps">
              <BookOpen className="h-4 w-4 mr-2" />
              Learning Roadmaps
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/profile/edit">
              <User className="h-4 w-4 mr-2" />
              My Profile
            </Link>
          </Button>
          
          <Button asChild size="sm" variant="outline">
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          
          <Button asChild size="sm" className="btn-gradient">
            <Link to="/mentors">
              <Plus className="h-4 w-4 mr-2" />
              Find Mentors
            </Link>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowNavigationGuide(!showNavigationGuide)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {showNavigationGuide ? "Hide Guide" : "Show All Pages"}
          </Button>
        </div>
      </div>
      
      {/* Navigation Guide */}
      {showNavigationGuide && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <NavigationGuide />
        </div>
      )}
    </div>
  );
}

