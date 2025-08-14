import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  MessageCircle
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Mock authentication state - will be replaced with real auth
  const isAuthenticated = false;
  const userRole = "candidate"; // candidate | mentor | admin

  const navigation = [
    { name: "Find Mentors", href: "/mentors", icon: Users },
    { name: "Mock Interviews", href: "/interviews", icon: MessageCircle },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "About", href: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-xl">Preplaced</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-1 text-sm font-medium transition-smooth hover:text-primary ${
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

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>

              {/* Dashboard Link */}
              <Button variant="ghost" asChild>
                <Link to={userRole === "mentor" ? "/mentor/dashboard" : "/candidate/dashboard"} className="hidden md:flex">
                  Dashboard
                </Link>
              </Button>

              {/* Profile */}
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
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
                {navigation.map((item) => {
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
                
                {!isAuthenticated && (
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
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}