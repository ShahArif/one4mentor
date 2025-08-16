import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { CandidateSidebar } from './CandidateSidebar';

interface CandidateLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function CandidateLayout({ children, className = '' }: CandidateLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white shadow-lg"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Side Navigation */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <CandidateSidebar 
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>
        
        {/* Main Content */}
        <div className={`flex-1 p-4 md:p-8 ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
