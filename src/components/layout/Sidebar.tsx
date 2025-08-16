import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Video,
  Star,
  TrendingUp,
  Settings,
  LogOut,
  User,
  Shield,
  BookOpen,
  Target,
  Briefcase,
  GraduationCap,
  Bell,
  Search,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data: userRoleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } else {
        setUserRole(userRoleData?.role || null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was an issue signing you out.",
        variant: "destructive",
      });
    }
  };

  // Role-based navigation items
  const getRoleNavigation = () => {
    if (!userRole) return [];

    switch (userRole) {
      case 'candidate':
        return [
          { name: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
          { name: "My Requests", href: "/candidate/requests", icon: FileText },
          { name: "Sessions", href: "/sessions", icon: Calendar },
          { name: "Find Mentors", href: "/mentors", icon: Users },
          { name: "Chat", href: "/chat", icon: MessageSquare },
          { name: "Video Calls", href: "/video-call", icon: Video },
          { name: "Feedback", href: "/session-feedback", icon: Star },
          { name: "Reviews", href: "/reviews", icon: Star },
          { name: "Analytics", href: "/analytics", icon: TrendingUp },
          { name: "Help", href: "/help", icon: BookOpen },
        ];
      case 'mentor':
        return [
          { name: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
          { name: "Requests", href: "/mentor/requests", icon: FileText },
          { name: "Sessions", href: "/sessions", icon: Calendar },
          { name: "Chat", href: "/chat", icon: MessageSquare },
          { name: "Video Calls", href: "/video-call", icon: Video },
          { name: "Reviews", href: "/reviews", icon: Star },
          { name: "Analytics", href: "/analytics", icon: TrendingUp },
          { name: "Help", href: "/help", icon: BookOpen },
        ];
      case 'super_admin':
        return [
          { name: "Admin Dashboard", href: "/admin/dashboard", icon: Shield },
          { name: "User Management", href: "/admin/users", icon: Users },
          { name: "Analytics", href: "/analytics", icon: BarChart3 },
          { name: "Settings", href: "/admin/settings", icon: Settings },
          { name: "Help", href: "/help", icon: BookOpen },
        ];
      default:
        return [];
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = getRoleNavigation();

  if (!user || isLoading) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold text-lg">One4Mentor</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100",
                isActive(item.href) 
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                  : "text-gray-700"
              )}
            >
              <Icon className={cn("h-5 w-5", isCollapsed && "mx-auto")} />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* Quick Actions */}
        <div className="space-y-2">
          <Link
            to="/profile"
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 text-gray-700",
              isCollapsed && "justify-center"
            )}
          >
            <User className="h-5 w-5" />
            {!isCollapsed && <span className="font-medium">Profile</span>}
          </Link>
          
          <Link
            to="/settings"
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 text-gray-700",
              isCollapsed && "justify-center"
            )}
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span className="font-medium">Settings</span>}
          </Link>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-red-50 text-red-600 w-full",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
