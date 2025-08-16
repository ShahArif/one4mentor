import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Clock, 
  Target, 
  ExternalLink,
  MessageCircle,
  Calendar,
  Star,
  BookOpen,
  Code,
  Globe,
  Linkedin,
  Github
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface CandidateProfileViewProps {
  candidate: {
    id: string;
    email: string;
    display_name: string;
    candidate_data?: {
      fullName?: string;
      currentRole?: string;
      company?: string;
      experience?: string;
      skills?: string[];
      goals?: string[];
      bio?: string;
      education?: string;
      location?: string;
      linkedinProfile?: string;
      githubProfile?: string;
      portfolioUrl?: string;
    };
  };
  requestMessage: string;
  requestDate: string;
  selectedSkills?: string[];
  onAccept?: () => void;
  onReject?: () => void;
  onMessage?: () => void;
  onCreateRoadmap?: () => void;
  requestStatus?: string;
  initialExpanded?: boolean;
}

export default function CandidateProfileView({
  candidate,
  requestMessage,
  requestDate,
  selectedSkills,
  onAccept,
  onReject,
  onMessage,
  onCreateRoadmap,
  initialExpanded = false
}: CandidateProfileViewProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.display_name || candidate.email}`} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                {(candidate.display_name || candidate.email || "U")
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-xl">
                {candidate.candidate_data?.fullName || candidate.display_name || "Anonymous Candidate"}
              </CardTitle>
              <p className="text-gray-600 text-sm">
                {candidate.email}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Requested {formatDate(requestDate)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onMessage && (
              <Button size="sm" variant="outline" onClick={onMessage}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleExpansion}
              className="text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? "Show Less" : "Show More"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Request Message */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Request Message:</h4>
          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
            {requestMessage}
          </p>
        </div>

        {/* Selected Skills */}
        {selectedSkills && selectedSkills.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Skills the candidate wants to learn:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Full Name</Label>
            <p className="text-sm text-gray-900">
              {candidate.candidate_data?.fullName || "Not provided"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Current Role</Label>
            <p className="text-sm text-gray-900">
              {candidate.candidate_data?.currentRole || "Not provided"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Company</Label>
            <p className="text-sm text-gray-900">
              {candidate.candidate_data?.company || "Not provided"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Experience</Label>
            <p className="text-sm text-gray-900">
              {candidate.candidate_data?.experience || "Not provided"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Education</Label>
            <p className="text-sm text-gray-900">
              {candidate.candidate_data?.education || "Not provided"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Location</Label>
            <p className="text-sm text-gray-900">
              {candidate.candidate_data?.location || "Not provided"}
            </p>
          </div>
        </div>

        {/* Skills */}
        {candidate.candidate_data?.skills && Array.isArray(candidate.candidate_data.skills) && candidate.candidate_data.skills.length > 0 && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Skills</Label>
            <div className="flex flex-wrap gap-2">
              {candidate.candidate_data.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        {candidate.candidate_data?.goals && Array.isArray(candidate.candidate_data.goals) && candidate.candidate_data.goals.length > 0 && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Goals</Label>
            <div className="space-y-2">
              {candidate.candidate_data.goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{goal}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {candidate.candidate_data?.bio && (
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Bio</Label>
            <p className="text-sm text-gray-700">{candidate.candidate_data.bio}</p>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            {/* Skills */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Technical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.candidate_data?.skills && Array.isArray(candidate.candidate_data.skills) && candidate.candidate_data.skills.length > 0 ? (
                  candidate.candidate_data.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills specified</span>
                )}
              </div>
            </div>

            {/* Goals */}
            {candidate.candidate_data?.goals && Array.isArray(candidate.candidate_data.goals) && candidate.candidate_data.goals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.candidate_data.goals.map((goal, index) => (
                  <Badge key={index} variant="secondary">
                    {goal}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-gray-500 text-sm">No goals specified</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          {onAccept && onReject && (
            <>
              <Button
                variant="outline"
                onClick={onReject}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Reject Request
              </Button>
              <Button
                onClick={onAccept}
                className="bg-green-600 hover:bg-green-700"
              >
                Accept Request
              </Button>
            </>
          )}
          
          {onCreateRoadmap && (
            <Button
              onClick={onCreateRoadmap}
              className="btn-gradient"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Create Learning Roadmap
            </Button>
          )}
          
          {onMessage && (
            <Button
              variant="outline"
              onClick={onMessage}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
