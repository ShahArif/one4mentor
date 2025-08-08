import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CandidateOnboarding from "./pages/onboarding/CandidateOnboarding";
import MentorOnboarding from "./pages/onboarding/MentorOnboarding";
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
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/onboarding/candidate" element={<CandidateOnboarding />} />
          <Route path="/onboarding/mentor" element={<MentorOnboarding />} />
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentors" element={<MentorSearch />} />
          <Route path="/mentor/:id" element={<MentorProfile />} />
          <Route path="/booking/:id" element={<SessionBooking />} />
          <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
          <Route path="/sessions" element={<SessionManagement />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/session-feedback/:id" element={<SessionFeedback />} />
          <Route path="/reviews" element={<ReviewsRatings />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
