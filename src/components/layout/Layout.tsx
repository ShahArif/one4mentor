import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function Layout({ children, showSidebar = false, className }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar - only show for authenticated users when showSidebar is true */}
        {user && showSidebar && <Sidebar />}
        
        {/* Main Content */}
        <main className={className || "flex-1 p-6"}>
          {children}
        </main>
      </div>
    </div>
  );
}
