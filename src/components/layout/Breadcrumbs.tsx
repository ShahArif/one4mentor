import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Breadcrumbs() {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with home
    breadcrumbs.push({ label: "Home", href: "/", icon: Home });
    
    let currentPath = "";
    
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      
      // Convert path to readable label
      let label = name;
      if (name === "candidate") label = "Candidate";
      else if (name === "mentor") label = "Mentor";
      else if (name === "admin") label = "Admin";
      else if (name === "dashboard") label = "Dashboard";
      else if (name === "requests") label = "Requests";
      else if (name === "sessions") label = "Sessions";
      else if (name === "auth") label = "Authentication";
      else if (name === "login") label = "Login";
      else if (name === "register") label = "Register";
      else if (name === "onboarding") label = "Onboarding";
      else if (name === "pending-approval") label = "Pending Approval";
      else if (name === "booking") label = "Booking";
      else if (name === "chat") label = "Chat";
      else if (name === "video-call") label = "Video Call";
      else if (name === "session-feedback") label = "Session Feedback";
      else if (name === "reviews") label = "Reviews";
      else if (name === "analytics") label = "Analytics";
      else if (name === "settings") label = "Settings";
      else if (name === "profile") label = "Profile";
      else if (name === "users") label = "User Management";
      else if (name === "mentors") label = "Find Mentors";
      else {
        // Capitalize first letter and replace hyphens with spaces
        label = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
      }
      
      // Don't make the last item clickable
      const isLast = index === pathnames.length - 1;
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        icon: undefined
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = breadcrumb.icon;
        
        if (isLast) {
          return (
            <div key={breadcrumb.label} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
              <span className="text-gray-900 font-medium">{breadcrumb.label}</span>
            </div>
          );
        }
        
        return (
          <div key={breadcrumb.label} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
            <Link
              to={breadcrumb.href!}
              className={cn(
                "flex items-center space-x-1 hover:text-gray-700 transition-colors",
                Icon && "text-gray-600"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{breadcrumb.label}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
