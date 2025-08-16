import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  TrendingUp,
  Settings,
  User,
  FileText,
  Calendar,
  Star,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface CandidateSidebarProps {
  className?: string;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export function CandidateSidebar({ 
  className = '', 
  isSidebarOpen = false, 
  setIsSidebarOpen 
}: CandidateSidebarProps) {
  const [isMentorshipsExpanded, setIsMentorshipsExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    if (setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 min-h-screen p-4 ${className}`}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
      </div>
      
      <nav className="space-y-2">
        {/* Main Navigation Items */}
        <Link
          to="/candidate/dashboard"
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            isActive('/candidate/dashboard')
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={handleLinkClick}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        
        <Link
          to="/mentors"
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            isActive('/mentors')
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={handleLinkClick}
        >
          <Users className="h-5 w-5" />
          <span>Find Mentors</span>
        </Link>
        
        <Link
          to="/chat"
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            isActive('/chat')
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={handleLinkClick}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Chat</span>
        </Link>
        

        
        <Link
          to="/analytics"
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            isActive('/analytics')
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={handleLinkClick}
        >
          <TrendingUp className="h-5 w-5" />
          <span>Analytics</span>
        </Link>
        
        {/* Settings Section */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
            className="flex items-center justify-between w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </div>
            {isSettingsExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {/* Child Menu Items */}
          {isSettingsExpanded && (
            <div className="ml-6 space-y-1 mt-2">
              <Link
                to="/profile/edit"
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                  isActive('/profile/edit')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={handleLinkClick}
              >
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </Link>
              
              <Link
                to="/settings"
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                  isActive('/settings')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={handleLinkClick}
              >
                <Settings className="h-4 w-4" />
                <span>General Settings</span>
              </Link>
            </div>
          )}
        </div>
        
        {/* My Mentorships Section */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsMentorshipsExpanded(!isMentorshipsExpanded)}
            className="flex items-center justify-between w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5" />
              <span className="font-medium">My Mentorships</span>
            </div>
            {isMentorshipsExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {/* Child Menu Items */}
          {isMentorshipsExpanded && (
            <div className="ml-6 space-y-1 mt-2">
              <Link
                to="/candidate/requests"
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                  isActive('/candidate/requests')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={handleLinkClick}
              >
                <FileText className="h-4 w-4" />
                <span>My Requests</span>
              </Link>
              
              <Link
                to="/candidate/roadmaps"
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                  isActive('/candidate/roadmaps')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={handleLinkClick}
              >
                <Calendar className="h-4 w-4" />
                <span>Learning Roadmaps</span>
              </Link>
              
              <Link
                to="/sessions"
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                  isActive('/sessions')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={handleLinkClick}
              >
                <Calendar className="h-4 w-4" />
                <span>Sessions</span>
              </Link>
              
              <Link
                to="/session-feedback"
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                  isActive('/session-feedback')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={handleLinkClick}
              >
                <Star className="h-4 w-4" />
                <span>Feedback</span>
              </Link>
              
              <Link
                to="/reviews"
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                  isActive('/reviews')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={handleLinkClick}
              >
                <Star className="h-4 w-4" />
                <span>Reviews</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
