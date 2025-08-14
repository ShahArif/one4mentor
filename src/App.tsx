import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OAuthCallback from "./pages/auth/OAuthCallback";
import CandidateOnboarding from "./pages/onboarding/CandidateOnboarding";
import MentorOnboarding from "./pages/onboarding/MentorOnboarding";
import PendingApproval from "./pages/onboarding/PendingApproval";
import CandidateDashboard from "./pages/dashboard/CandidateDashboard";
import MentorDashboard from "./pages/dashboard/MentorDashboard";
import MentorSearch from "./pages/mentors/MentorSearch";
import MentorProfile from "./pages/mentors/MentorProfile";
import SessionBooking from "./pages/booking/SessionBooking";
import BookingConfirmation from "./pages/booking/BookingConfirmation";
import SessionManagement from "./pages/sessions/SessionManagement";
import ChatInterface from "./pages/chat/ChatInterface";
import VideoCall from "./pages/video/VideoCall";
import SessionFeedback from "./pages/feedback/SessionFeedback";
import ReviewsRatings from "./pages/reviews/ReviewsRatings";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSetup from "./pages/admin/AdminSetup";
import AdminLogin from "./pages/admin/AdminLogin";
import RoleRedirect from "./pages/dashboard/RoleRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/mentors" element={<MentorSearch />} />
            <Route path="/mentor/:id" element={<MentorProfile />} />
            
            {/* Protected routes */}
            <Route path="/onboarding/candidate" element={
              <ProtectedRoute>
                <CandidateOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/onboarding/mentor" element={
              <ProtectedRoute>
                <MentorOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/onboarding/pending-approval" element={
              <ProtectedRoute>
                <PendingApproval />
              </ProtectedRoute>
            } />
            <Route path="/candidate/dashboard" element={
              <ProtectedRoute requiredRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/mentor/dashboard" element={
              <ProtectedRoute requiredRole="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/booking/:id" element={
              <ProtectedRoute>
                <SessionBooking />
              </ProtectedRoute>
            } />
            <Route path="/booking-confirmation/:id" element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/sessions" element={
              <ProtectedRoute>
                <SessionManagement />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            } />
            <Route path="/video-call" element={
              <ProtectedRoute>
                <VideoCall />
              </ProtectedRoute>
            } />
            <Route path="/session-feedback/:id" element={
              <ProtectedRoute>
                <SessionFeedback />
              </ProtectedRoute>
            } />
            <Route path="/reviews" element={
              <ProtectedRoute>
                <ReviewsRatings />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="super_admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/setup" element={<AdminSetup />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
