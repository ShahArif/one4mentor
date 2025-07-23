import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Calendar,
  Target,
  TrendingUp,
  FileText,
  Award
} from "lucide-react";

const sessionDetails = {
  id: 1,
  mentor: "Sarah Chen",
  mentorAvatar: "/api/placeholder/60/60",
  mentorRole: "Senior SDE at Google",
  type: "Mock Technical Interview",
  date: "December 15, 2024",
  duration: "60 minutes",
  status: "Completed"
};

const skillsEvaluated = [
  { skill: "Problem Solving", score: 85, feedback: "Strong analytical thinking and systematic approach" },
  { skill: "Code Quality", score: 78, feedback: "Clean code with good naming conventions, could improve comments" },
  { skill: "Communication", score: 92, feedback: "Excellent at explaining thought process and asking clarifying questions" },
  { skill: "Time Management", score: 70, feedback: "Managed time well but could optimize solution faster" },
  { skill: "Technical Knowledge", score: 88, feedback: "Solid understanding of data structures and algorithms" }
];

const actionItems = [
  "Practice more dynamic programming problems",
  "Work on optimizing solutions for time complexity",
  "Review system design basics for next round",
  "Practice explaining code while writing"
];

export default function SessionFeedback() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      setSubmitted(true);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Session Feedback</h1>
          <p className="text-muted-foreground">Review your performance and mentor feedback</p>
        </div>

        {/* Session Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Session Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={sessionDetails.mentorAvatar} />
                <AvatarFallback>{sessionDetails.mentor[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{sessionDetails.mentor}</h3>
                <p className="text-muted-foreground">{sessionDetails.mentorRole}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {sessionDetails.type}
                  </Badge>
                  <Badge variant="default">
                    <Award className="h-3 w-3 mr-1" />
                    {sessionDetails.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {sessionDetails.date}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {sessionDetails.duration}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {skillsEvaluated.map((skill, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{skill.skill}</h4>
                    <Badge variant={getScoreBadgeVariant(skill.score)}>
                      {skill.score}/100
                    </Badge>
                  </div>
                  <Progress value={skill.score} className="h-2" />
                  <p className="text-sm text-muted-foreground">{skill.feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Action Items & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rate Your Mentor */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rate Your Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">How would you rate this session?</h4>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Share your feedback (optional)</h4>
                  <Textarea
                    placeholder="Tell us about your experience with this mentor..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  className="bg-gradient-primary"
                >
                  Submit Feedback
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Thank you for your feedback!</h3>
                <p className="text-muted-foreground">
                  Your rating helps us improve the mentoring experience for everyone.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <div className="flex items-center w-full mb-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Schedule Follow-up</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Book your next session with Sarah Chen
                </p>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <div className="flex items-center w-full mb-2">
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Download Report</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Get a detailed PDF of your session feedback
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}