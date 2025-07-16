import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  ArrowRight, 
  Users, 
  MessageCircle, 
  Award, 
  Star,
  CheckCircle,
  Play,
  TrendingUp,
  Target,
  Clock
} from "lucide-react";

const Index = () => {
  const stats = [
    { label: "Active Mentors", value: "10,000+", icon: Users },
    { label: "Success Stories", value: "50,000+", icon: Award },
    { label: "Mock Interviews", value: "100,000+", icon: MessageCircle },
    { label: "Success Rate", value: "98%", icon: TrendingUp },
  ];

  const features = [
    {
      title: "1-on-1 Mentorship",
      description: "Connect with industry experts for personalized career guidance",
      icon: Users,
    },
    {
      title: "Mock Interviews",
      description: "Practice with real interviewers and get detailed feedback",
      icon: MessageCircle,
    },
    {
      title: "Skill Development",
      description: "Upskill with curated courses and learning paths",
      icon: Target,
    },
    {
      title: "Real-time Chat",
      description: "Stay connected with your mentors through instant messaging",
      icon: Clock,
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer at Google",
      content: "The mentorship I received helped me crack FAANG interviews. The mock interviews were incredibly valuable!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b2a17e4d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Arjun Patel",
      role: "Product Manager at Microsoft",
      content: "Preplaced transformed my career. The mentors here are amazing and truly care about your success.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Sneha Gupta",
      role: "Data Scientist at Amazon",
      content: "The structured learning path and mentor guidance helped me transition into data science seamlessly.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-hero overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6" variant="secondary">
              🚀 Trusted by 50,000+ professionals
            </Badge>
            
            <h1 className="hero-title mb-6">
              Launch Your Dream Career with Expert Mentorship
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with industry experts, ace your interviews, and upskill with personalized mentorship from top professionals at FAANG and unicorn companies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="btn-gradient text-lg px-8" asChild>
                <Link to="/auth/register">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/mentors">
                  <Play className="mr-2 h-5 w-5" />
                  Explore Mentors
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Preplaced?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to accelerate your career growth and land your dream job.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="card-hover border-0 shadow-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how Preplaced has helped thousands of professionals achieve their career goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have accelerated their careers with expert mentorship and guidance.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/auth/register">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
