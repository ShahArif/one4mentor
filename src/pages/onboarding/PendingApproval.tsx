import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Mail, 
  Home,
  RefreshCw
} from "lucide-react";

export default function PendingApproval() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [approvalStatus, setApprovalStatus] = useState<{
    mentorStatus?: string;
    candidateStatus?: string;
    isLoading: boolean;
  }>({ isLoading: true });

  const checkApprovalStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth/login");
        return;
      }

      // Check mentor onboarding status
      const { data: mentorData } = await supabase
        .from("mentor_onboarding_requests")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Check candidate onboarding status
      const { data: candidateData } = await supabase
        .from("candidate_onboarding_requests")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setApprovalStatus({
        mentorStatus: mentorData?.status,
        candidateStatus: candidateData?.status,
        isLoading: false
      });

      // If approved, check if roles are assigned and redirect accordingly
      if (mentorData?.status === "approved" || candidateData?.status === "approved") {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (roles && roles.length > 0) {
          // User has been approved and roles assigned
          const userRoles = roles.map(r => r.role);
          if (userRoles.includes("mentor")) {
            navigate("/mentor/dashboard");
          } else if (userRoles.includes("candidate")) {
            navigate("/candidate/dashboard");
          }
        }
      }

    } catch (error) {
      console.error("Error checking approval status:", error);
      setApprovalStatus({ isLoading: false });
    }
  };

  useEffect(() => {
    checkApprovalStatus();
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending Review
        </Badge>;
      case "approved":
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      default:
        return null;
    }
  };

  const hasAnyApplication = approvalStatus.mentorStatus || approvalStatus.candidateStatus;
  const isAnyApproved = approvalStatus.mentorStatus === "approved" || approvalStatus.candidateStatus === "approved";
  const isAnyRejected = approvalStatus.mentorStatus === "rejected" || approvalStatus.candidateStatus === "rejected";

  if (approvalStatus.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Checking approval status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container max-w-2xl py-16">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            {!hasAnyApplication ? (
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            ) : isAnyApproved ? (
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            ) : isAnyRejected ? (
              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            ) : (
              <Clock className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            )}
            
            <CardTitle className="text-2xl mb-2">
              {!hasAnyApplication ? "No Application Found" :
               isAnyApproved ? "Application Approved! 🎉" :
               isAnyRejected ? "Application Status Update" :
               "Application Under Review"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!hasAnyApplication ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  We couldn't find any application associated with your account. 
                  Please complete the onboarding process to get started.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild>
                    <a href="/onboarding/mentor">Apply as Mentor</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/onboarding/candidate">Apply as Candidate</a>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Application Status */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Application Status:</h3>
                  
                  {approvalStatus.mentorStatus && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Mentor Application</span>
                      {getStatusBadge(approvalStatus.mentorStatus)}
                    </div>
                  )}
                  
                  {approvalStatus.candidateStatus && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Candidate Application</span>
                      {getStatusBadge(approvalStatus.candidateStatus)}
                    </div>
                  )}
                </div>

                {/* Status-specific messages */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  {isAnyApproved ? (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Congratulations!</h4>
                      <p className="text-sm text-muted-foreground">
                        Your application has been approved by our admin team. You can now access all platform features.
                        If you're not automatically redirected, please refresh this page.
                      </p>
                    </div>
                  ) : isAnyRejected ? (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Application Update</h4>
                      <p className="text-sm text-muted-foreground">
                        Unfortunately, your application was not approved at this time. 
                        Please contact our support team for more information or to reapply.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">Review in Progress</h4>
                      <p className="text-sm text-muted-foreground">
                        Thank you for your application! Our admin team is currently reviewing your submission. 
                        This process typically takes 1-2 business days. You'll receive an email notification 
                        once your application has been reviewed.
                      </p>
                    </div>
                  )}
                </div>

                {/* Next Steps */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">What happens next?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      You'll receive an email notification about your application status
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Once approved, you'll gain access to all platform features
                    </li>
                    <li className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      You can bookmark this page to check your status anytime
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={checkApprovalStatus} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                  <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
