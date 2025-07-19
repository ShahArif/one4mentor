import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Calendar, Clock, Users, BookOpen, Award } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Mock mentor data
const mentorData = {
  id: "1",
  name: "Sarah Johnson",
  title: "Senior Software Engineer at Google",
  image: "/placeholder.svg",
  rating: 4.9,
  reviewCount: 127,
  location: "San Francisco, CA",
  experience: "8+ years",
  about: "Passionate software engineer with extensive experience in full-stack development. I've mentored 50+ engineers and helped them land jobs at top tech companies including FAANG. My expertise spans React, Node.js, Python, and system design.",
  skills: ["React", "Node.js", "Python", "System Design", "AWS", "TypeScript"],
  achievements: ["Led team of 12 engineers", "Built systems serving 10M+ users", "Published 5 research papers"],
  pricing: {
    "30min": 50,
    "60min": 90,
    "90min": 120
  },
  availability: ["Mon 10:00-18:00", "Wed 14:00-20:00", "Fri 09:00-17:00"],
  menteeCount: 85,
  sessionsCompleted: 340,
  responseTime: "< 2 hours"
};

const MentorProfile = () => {
  const { id } = useParams();
  const [selectedDuration, setSelectedDuration] = useState<"30min" | "60min" | "90min">("60min");

  const handleBookSession = () => {
    // Navigate to booking page with mentor and duration info
    window.location.href = `/booking/${id}?duration=${selectedDuration}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Mentor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={mentorData.image} alt={mentorData.name} />
                  <AvatarFallback className="text-xl">{mentorData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-primary mb-2">{mentorData.name}</h1>
                  <p className="text-lg text-muted-foreground mb-3">{mentorData.title}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{mentorData.rating}</span>
                      <span className="text-muted-foreground">({mentorData.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{mentorData.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>{mentorData.experience}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {mentorData.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                    {mentorData.skills.length > 4 && (
                      <Badge variant="outline">+{mentorData.skills.length - 4} more</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{mentorData.menteeCount}</div>
                <div className="text-sm text-muted-foreground">Mentees</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{mentorData.sessionsCompleted}</div>
                <div className="text-sm text-muted-foreground">Sessions</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{mentorData.responseTime}</div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </Card>
            </div>

            {/* Detailed Info Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-6">{mentorData.about}</p>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Key Achievements</h4>
                      <ul className="space-y-2">
                        {mentorData.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Award className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="skills" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mentorData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="px-3 py-1">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <Card key={review}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">John Doe</h4>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">
                              Sarah provided excellent guidance on system design. Her explanations were clear and practical. Highly recommend!
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Book a Session
                </CardTitle>
                <CardDescription>Choose your session duration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Duration Selection */}
                <div className="space-y-3">
                  {Object.entries(mentorData.pricing).map(([duration, price]) => (
                    <div
                      key={duration}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDuration === duration
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedDuration(duration as "30min" | "60min" | "90min")}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{duration} session</span>
                        </div>
                        <span className="font-bold text-primary">₹{price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={handleBookSession} className="w-full" size="lg">
                  Book Session - ₹{mentorData.pricing[selectedDuration]}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Payment via bank transfer • Secure booking
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mentorData.availability.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>{slot}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MentorProfile;