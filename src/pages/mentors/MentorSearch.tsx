import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock,
  Heart,
  MessageCircle,
  Briefcase
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const skillFilters = [
  "JavaScript", "Python", "React", "Node.js", "Java", "Data Science",
  "Machine Learning", "UI/UX Design", "Product Management", "DevOps"
];

const mentors = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior Software Engineer",
    company: "Google",
    experience: "8",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 2500,
    skills: ["JavaScript", "React", "System Design"],
    location: "San Francisco, CA",
    availability: "Available",
    bio: "Experienced full-stack developer with expertise in modern web technologies and cloud architecture.",
    avatar: "/api/placeholder/60/60",
    isBookmarked: false
  },
  {
    id: 2,
    name: "Raj Patel",
    role: "Product Manager",
    company: "Microsoft",
    experience: "6",
    rating: 4.8,
    reviews: 89,
    hourlyRate: 2000,
    skills: ["Product Management", "Strategy", "Analytics"],
    location: "Seattle, WA",
    availability: "Available",
    bio: "Product management leader with experience scaling products from 0 to millions of users.",
    avatar: "/api/placeholder/60/60",
    isBookmarked: true
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "ML Engineer",
    company: "OpenAI",
    experience: "5",
    rating: 4.9,
    reviews: 156,
    hourlyRate: 3000,
    skills: ["Machine Learning", "Python", "Data Science"],
    location: "Remote",
    availability: "Busy",
    bio: "Machine learning expert specializing in NLP and computer vision applications.",
    avatar: "/api/placeholder/60/60",
    isBookmarked: false
  },
  {
    id: 4,
    name: "Alex Johnson",
    role: "DevOps Engineer",
    company: "AWS",
    experience: "7",
    rating: 4.7,
    reviews: 98,
    hourlyRate: 2200,
    skills: ["DevOps", "AWS", "Kubernetes"],
    location: "Austin, TX",
    availability: "Available",
    bio: "Cloud infrastructure specialist with extensive experience in containerization and CI/CD.",
    avatar: "/api/placeholder/60/60",
    isBookmarked: false
  },
  {
    id: 5,
    name: "Emma Wilson",
    role: "UX Designer",
    company: "Figma",
    experience: "4",
    rating: 4.8,
    reviews: 134,
    hourlyRate: 1800,
    skills: ["UI/UX Design", "Figma", "Design Systems"],
    location: "New York, NY",
    availability: "Available",
    bio: "User experience designer focused on creating intuitive and accessible digital products.",
    avatar: "/api/placeholder/60/60",
    isBookmarked: false
  },
  {
    id: 6,
    name: "David Kim",
    role: "Data Scientist",
    company: "Netflix",
    experience: "6",
    rating: 4.9,
    reviews: 76,
    hourlyRate: 2800,
    skills: ["Data Science", "Python", "Machine Learning"],
    location: "Los Angeles, CA",
    availability: "Available",
    bio: "Data scientist with expertise in recommendation systems and predictive analytics.",
    avatar: "/api/placeholder/60/60",
    isBookmarked: true
  }
];

export default function MentorSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [experienceFilter, setExperienceFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [filteredMentors, setFilteredMentors] = useState(mentors);

  // Filter mentors based on all criteria
  useEffect(() => {
    let filtered = mentors;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(mentor =>
        selectedSkills.some(skill => mentor.skills.includes(skill))
      );
    }

    // Price range filter
    filtered = filtered.filter(mentor =>
      mentor.hourlyRate >= priceRange[0] && mentor.hourlyRate <= priceRange[1]
    );

    // Experience filter
    if (experienceFilter) {
      filtered = filtered.filter(mentor => {
        const mentorYears = parseInt(mentor.experience);
        switch (experienceFilter) {
          case "2-5":
            return mentorYears >= 2 && mentorYears <= 5;
          case "5-10":
            return mentorYears >= 5 && mentorYears <= 10;
          case "10+":
            return mentorYears >= 10;
          default:
            return true;
        }
      });
    }

    // Availability filter
    if (availabilityFilter) {
      filtered = filtered.filter(mentor =>
        mentor.availability.toLowerCase() === availabilityFilter.toLowerCase()
      );
    }

    setFilteredMentors(filtered);
  }, [searchQuery, selectedSkills, priceRange, experienceFilter, availabilityFilter]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleBookmark = (mentorId: number) => {
    setFilteredMentors(prev => 
      prev.map(mentor => 
        mentor.id === mentorId 
          ? { ...mentor, isBookmarked: !mentor.isBookmarked }
          : mentor
      )
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
    setPriceRange([0, 5000]);
    setExperienceFilter("");
    setAvailabilityFilter("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Your Perfect Mentor</h1>
          <p className="text-muted-foreground">Connect with industry experts to accelerate your career</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search mentors by name, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills Filter */}
                <div>
                  <h4 className="font-semibold mb-3">Skills</h4>
                  <div className="space-y-2">
                    {skillFilters.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <label htmlFor={skill} className="text-sm">{skill}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Filter */}
                <div>
                  <h4 className="font-semibold mb-3">Experience</h4>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any experience</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold mb-3">Hourly Rate (₹)</h4>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={5000}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="font-semibold mb-3">Availability</h4>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any availability</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Mentor Cards */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}
              </p>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filteredMentors.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No mentors found matching your criteria</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mentor.avatar} />
                        <AvatarFallback>{mentor.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{mentor.name}</h3>
                            <div className="flex items-center text-muted-foreground mb-2">
                              <Briefcase className="h-4 w-4 mr-1" />
                              <span>{mentor.role} at {mentor.company}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{mentor.location}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold">₹{mentor.hourlyRate}</p>
                            <p className="text-sm text-muted-foreground">per hour</p>
                            <Badge 
                              variant={mentor.availability === "Available" ? "default" : "secondary"}
                              className="mt-2"
                            >
                              {mentor.availability}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-3">
                          <div className="flex items-center mr-4">
                            <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                            <span className="font-semibold">{mentor.rating}</span>
                            <span className="text-muted-foreground ml-1">({mentor.reviews} reviews)</span>
                          </div>
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{mentor.experience} years experience</span>
                            </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{mentor.bio}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {mentor.skills.map((skill) => (
                            <Badge key={skill} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Button className="bg-gradient-primary">
                            Book Session
                          </Button>
                          <Button variant="outline">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleBookmark(mentor.id)}
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                mentor.isBookmarked ? 'fill-red-500 text-red-500' : ''
                              }`} 
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}