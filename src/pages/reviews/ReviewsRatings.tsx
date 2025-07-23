import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  ThumbsUp, 
  Filter, 
  TrendingUp,
  Calendar,
  MessageCircle
} from "lucide-react";

const overallStats = {
  averageRating: 4.8,
  totalReviews: 156,
  responseRate: 98,
  repeatClients: 67
};

const ratingDistribution = [
  { stars: 5, count: 98, percentage: 63 },
  { stars: 4, count: 41, percentage: 26 },
  { stars: 3, count: 12, percentage: 8 },
  { stars: 2, count: 3, percentage: 2 },
  { stars: 1, count: 2, percentage: 1 }
];

const recentReviews = [
  {
    id: 1,
    candidate: "Alex Kumar",
    avatar: "/api/placeholder/40/40",
    rating: 5,
    date: "2 days ago",
    sessionType: "Mock Technical Interview",
    review: "Sarah was incredibly helpful in preparing me for my Google interview. Her feedback was detailed and actionable. I felt much more confident going into the real interview!",
    helpful: 12
  },
  {
    id: 2,
    candidate: "Priya Sharma",
    avatar: "/api/placeholder/40/40",
    rating: 5,
    date: "1 week ago",
    sessionType: "System Design Review",
    review: "Excellent mentor! Sarah's expertise in system design is outstanding. She helped me understand complex concepts with real-world examples.",
    helpful: 8
  },
  {
    id: 3,
    candidate: "David Chen",
    avatar: "/api/placeholder/40/40",
    rating: 4,
    date: "2 weeks ago",
    sessionType: "Career Guidance",
    review: "Great session! Sarah provided valuable insights about career progression in tech. Very knowledgeable about the industry.",
    helpful: 15
  },
  {
    id: 4,
    candidate: "Maria Garcia",
    avatar: "/api/placeholder/40/40",
    rating: 5,
    date: "3 weeks ago",
    sessionType: "Resume Review",
    review: "Sarah completely transformed my resume. The before and after difference was amazing. Highly recommend her services!",
    helpful: 20
  },
  {
    id: 5,
    candidate: "John Wilson",
    avatar: "/api/placeholder/40/40",
    rating: 4,
    date: "1 month ago",
    sessionType: "Mock Behavioral Interview",
    review: "Very structured approach to behavioral interviews. Sarah helped me craft compelling stories and improve my delivery.",
    helpful: 6
  }
];

const skills = [
  { name: "Technical Interviews", rating: 4.9, reviews: 89 },
  { name: "System Design", rating: 4.8, reviews: 67 },
  { name: "Career Guidance", rating: 4.7, reviews: 45 },
  { name: "Resume Review", rating: 4.9, reviews: 34 },
  { name: "Behavioral Interviews", rating: 4.6, reviews: 28 }
];

export default function ReviewsRatings() {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredReviews = recentReviews.filter(review => {
    if (filter === "all") return true;
    return review.rating === parseInt(filter);
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reviews & Ratings</h1>
          <p className="text-muted-foreground">See what candidates say about their mentoring experience</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">All Reviews</TabsTrigger>
            <TabsTrigger value="skills">Skills Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-3xl font-bold">{overallStats.averageRating}</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{overallStats.totalReviews}</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold">{overallStats.responseRate}%</p>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <ThumbsUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold">{overallStats.repeatClients}%</p>
                  <p className="text-sm text-muted-foreground">Repeat Clients</p>
                </CardContent>
              </Card>
            </div>

            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-sm font-medium">{item.stars}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                      <div className="w-12 text-sm text-muted-foreground text-right">
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Reviews</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentReviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>{review.candidate[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{review.candidate}</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {review.sessionType}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{review.review}</p>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {review.helpful}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filter by rating:</span>
                  </div>
                  <div className="flex space-x-2">
                    {["all", "5", "4", "3", "2", "1"].map((rating) => (
                      <Button
                        key={rating}
                        variant={filter === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(rating)}
                      >
                        {rating === "all" ? "All" : `${rating} ⭐`}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Reviews */}
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback>{review.candidate[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{review.candidate}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <Badge variant="outline">
                                {review.sessionType}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              {review.date}
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-3 leading-relaxed">{review.review}</p>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Helpful ({review.helpful})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{skill.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{skill.rating}</span>
                          <span className="text-sm text-muted-foreground">({skill.reviews} reviews)</span>
                        </div>
                      </div>
                      <Progress value={skill.rating * 20} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}