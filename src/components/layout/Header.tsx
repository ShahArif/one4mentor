import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  Search,
  Bell,
  User,
  BookOpen,
  Users,
  MessageCircle,
  Settings,
  LogOut,
  Calendar,
  FileText,
  BarChart3,
  Shield,
  GraduationCap,
  Briefcase,
  Target,
  MessageSquare,
  Video,
  Star,
  TrendingUp
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
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

  // Public navigation items
  const publicNavigation = [
    { name: "Find Mentors", href: "/mentors", icon: Users },
    { name: "About", href: "/about" },
    { name: "Help", href: "/help", icon: BookOpen },
  ];

  // Role-based navigation items
  const getRoleNavigation = () => {
    if (!userRole) return [];

    switch (userRole) {
      case 'candidate':
        return [
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

  const currentNavigation = userRole ? getRoleNavigation() : publicNavigation;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-bold text-xl">One4Mentor</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {currentNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 text-sm font-medium transition-smooth hover:text-primary ${
                  isActive(item.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-4 w-4" />
          </Button>

          {user && !isLoading ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  0
                </Badge>
              </Button>

              {/* Profile Dropdown */}
              <div className="relative group">
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
                
                {/* Profile Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile/edit"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </div>
                    
                    <div className="border-t py-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Auth buttons */}
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link to="/auth/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button className="btn-gradient" asChild>
                <Link to="/auth/register">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Now
                </Link>
              </Button>
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-6">
                {/* User Info */}
                {user && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                  </div>
                )}

                {/* Navigation Items */}
                {currentNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-smooth ${
                        isActive(item.href) 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                
                {!user ? (
                  <>
                    <div className="border-t pt-4 space-y-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                          <LogIn className="h-4 w-4 mr-2" />
                          Login
                        </Link>
                      </Button>
                      <Button className="w-full btn-gradient" asChild>
                        <Link to="/auth/register" onClick={() => setIsOpen(false)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join Now
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-t pt-4 space-y-2">
                      <Link
                        to="/profile/edit"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="flex items-center w-full p-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}