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
      preferredMentorshipAreas?: string[];
      availability?: string[];
      timezone?: string;
    };
  };
  requestMessage: string;
  requestDate: string;
  onAccept?: () => void;
  onReject?: () => void;
  onMessage?: () => void;
  initialExpanded?: boolean;
}

export default function CandidateProfileView({
  candidate,
  requestMessage,
  requestDate,
  onAccept,
  onReject,
  onMessage,
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
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Mentorship Request
          </h4>
          <p className="text-blue-800 leading-relaxed">{requestMessage}</p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Current Role:</span>
              <span className="ml-2 text-gray-700">
                {candidate.candidate_data?.currentRole || "Not specified"}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Company:</span>
              <span className="ml-2 text-gray-700">
                {candidate.candidate_data?.company || "Not specified"}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Location:</span>
              <span className="ml-2 text-gray-700">
                {candidate.candidate_data?.location || "Not specified"}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Experience:</span>
              <span className="ml-2 text-gray-700">
                {candidate.candidate_data?.experience || "Not specified"}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Education:</span>
              <span className="ml-2 text-gray-700">
                {candidate.candidate_data?.education || "Not specified"}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Timezone:</span>
              <span className="ml-2 text-gray-700">
                {candidate.candidate_data?.timezone || "Not specified"}
              </span>
            </div>
          </div>
        </div>

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
                {candidate.candidate_data?.skills && candidate.candidate_data.skills.length > 0 ? (
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
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Mentorship Goals
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.candidate_data?.goals && candidate.candidate_data.goals.length > 0 ? (
                  candidate.candidate_data.goals.map((goal, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {goal}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No goals specified</span>
                )}
              </div>
            </div>

            {/* Preferred Mentorship Areas */}
            {candidate.candidate_data?.preferredMentorshipAreas && candidate.candidate_data.preferredMentorshipAreas.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Preferred Mentorship Areas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.candidate_data.preferredMentorshipAreas.map((area, index) => (
                    <Badge key={index} variant="default" className="text-sm">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {candidate.candidate_data?.availability && candidate.candidate_data.availability.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Availability
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.candidate_data.availability.map((slot, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {candidate.candidate_data?.bio && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">About</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {candidate.candidate_data.bio}
                </p>
              </div>
            )}

            {/* Social Links */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Professional Links</h4>
              <div className="flex items-center space-x-3">
                {candidate.candidate_data?.linkedinProfile && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.candidate_data.linkedinProfile} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                
                {candidate.candidate_data?.githubProfile && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.candidate_data.githubProfile} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-1" />
                      GitHub
                    </a>
                  </Button>
                )}
                
                {candidate.candidate_data?.portfolioUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.candidate_data.portfolioUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-1" />
                      Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {onAccept && onReject && (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
