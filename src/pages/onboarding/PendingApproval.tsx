import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalStatus {
  status: "pending" | "approved" | "rejected" | "not_found" | "incomplete";
  type: "candidate" | "mentor" | null;
  message: string;
}

export default function PendingApproval() {
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth/login");
          return;
        }

        // Check candidate onboarding requests
        const { data: candidateRequests, error: candidateError } = await supabase
          .from("candidate_onboarding_requests")
          .select("status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle to avoid "0 rows" error

        if (candidateError) {
          console.error("❌ Error checking candidate requests:", candidateError);
          setStatus({
            status: "not_found",
            type: null,
            message: "Error checking status. Please try again or contact support."
          });
          return;
        }

        if (candidateRequests) {
          const request = candidateRequests;
          if (request.status === "approved") {
            // Check if profile is complete
            const { data: profileData, error: profileError } = await supabase
              .from("candidate_onboarding_requests")
              .select("data")
              .eq("user_id", user.id)
              .eq("status", "approved")
              .maybeSingle(); // Use maybeSingle to avoid "0 rows" error
            
            if (profileError) {
              console.error("❌ Error checking profile data:", profileError);
              setStatus({
                status: "not_found",
                type: null,
                message: "Error checking profile status. Please try again or contact support."
              });
              return;
            }
            
            if (profileData?.data && Object.keys(profileData.data).length > 1) {
              // Profile complete, go to dashboard
              setStatus({
                status: "approved",
                type: "candidate",
                message: "Your candidate application has been approved and profile is complete! You can now access all platform features."
              });
              setTimeout(() => navigate("/candidate/dashboard"), 3000);
            } else {
              // Profile incomplete, go to onboarding
              setStatus({
                status: "incomplete",
                type: "candidate",
                message: "Your candidate application has been approved! Please complete your profile to continue."
              });
              setTimeout(() => navigate("/onboarding/candidate"), 2000);
            }
          } else if (request.status === "rejected") {
            setStatus({
              status: "rejected",
              type: "candidate",
              message: "Your candidate application was not approved. Please contact support for more information."
            });
          } else {
            setStatus({
              status: "pending",
              type: "candidate",
              message: "Your candidate application is under review. We'll notify you once it's approved."
            });
          }
          return;
        }

        // Check mentor onboarding requests
        const { data: mentorRequests, error: mentorError } = await supabase
          .from("mentor_onboarding_requests")
          .select("status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle to avoid "0 rows" error

        if (mentorError) {
          console.error("❌ Error checking mentor requests:", mentorError);
          setStatus({
            status: "not_found",
            type: null,
            message: "Error checking status. Please try again or contact support."
          });
          return;
        }

        if (mentorRequests) {
          const request = mentorRequests;
          if (request.status === "approved") {
            // Check if profile is complete
            const { data: profileData, error: profileError } = await supabase
              .from("mentor_onboarding_requests")
              .select("data")
              .eq("user_id", user.id)
              .eq("status", "approved")
              .maybeSingle(); // Use maybeSingle to avoid "0 rows" error
            
            if (profileError) {
              console.error("❌ Error checking profile data:", profileError);
              setStatus({
                status: "not_found",
                type: null,
                message: "Error checking profile status. Please try again or contact support."
              });
              return;
            }
            
            if (profileData?.data && Object.keys(profileData.data).length > 1) {
              // Profile complete, go to dashboard
              setStatus({
                status: "approved",
                type: "mentor",
                message: "Your mentor application has been approved and profile is complete! You can now access all platform features."
              });
              setTimeout(() => navigate("/mentor/dashboard"), 3000);
            } else {
              // Profile incomplete, go to onboarding
              setStatus({
                status: "incomplete",
                type: "mentor",
                message: "Your mentor application has been approved! Please complete your profile to continue."
              });
              setTimeout(() => navigate("/onboarding/mentor"), 2000);
            }
          } else if (request.status === "rejected") {
            setStatus({
              status: "rejected",
              type: "mentor",
              message: "Your mentor application was not approved. Please contact support for more information."
            });
          } else {
            setStatus({
              status: "pending",
              type: "mentor",
              message: "Your mentor application is under review. We'll notify you once it's approved."
            });
          }
          return;
        }

        // No application found
        setStatus({
          status: "not_found",
          type: null,
          message: "No application found. Please complete your onboarding process."
        });

      } catch (error) {
        console.error("Error checking approval status:", error);
        setStatus({
          status: "not_found",
          type: null,
          message: "Error checking status. Please try again or contact support."
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkApprovalStatus();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your application status...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case "pending":
        return <Clock className="h-16 w-16 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "rejected":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "incomplete":
        return <AlertCircle className="h-16 w-16 text-orange-500" />;
      default:
        return <AlertCircle className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case "pending":
        return "text-yellow-600";
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "incomplete":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {getStatusIcon()}
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {status.status === "pending" && "Application Under Review"}
            {status.status === "approved" && "Application Approved!"}
            {status.status === "rejected" && "Application Not Approved"}
            {status.status === "incomplete" && "Profile Incomplete"}
            {status.status === "not_found" && "No Application Found"}
          </h2>
          
          <p className={`mt-4 text-lg ${getStatusColor()}`}>
            {status.message}
          </p>
          
          {status.status === "pending" && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                Our team is reviewing your application. This usually takes 1-2 business days.
                You'll receive an email notification once the review is complete.
              </p>
            </div>
          )}
          
          {status.status === "approved" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                You'll be redirected to your dashboard shortly. Welcome to the platform!
              </p>
            </div>
          )}
          
          {status.status === "rejected" && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  If you have questions about this decision, please contact our support team.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/auth/login")}
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          )}
          
          {status.status === "incomplete" && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  Your profile is incomplete. Please complete your profile to continue.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/onboarding/candidate")}
                className="w-full"
              >
                Complete Profile
              </Button>
            </div>
          )}

          {status.status === "not_found" && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  It looks like you haven't completed the onboarding process yet.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/auth/register")}
                className="w-full"
              >
                Complete Registration
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
