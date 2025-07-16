import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserCircle, 
  Users, 
  GraduationCap,
  CheckCircle,
  MessageCircle,
  Calendar,
  TrendingUp,
  Award
} from "lucide-react";

export type UserRole = "candidate" | "mentor" | "admin";

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
}

export function RoleSelector({ selectedRole, onRoleSelect }: RoleSelectorProps) {
  const roles = [
    {
      id: "candidate" as UserRole,
      title: "I'm a Job Seeker",
      subtitle: "Looking for mentorship and career guidance",
      description: "Get personalized mentorship, practice interviews, and upskill with industry experts.",
      icon: UserCircle,
      features: [
        "1-on-1 mentorship sessions",
        "Mock interview practice",
        "Skill development courses",
        "Career guidance & roadmaps",
        "Resume reviews"
      ],
      popular: true
    },
    {
      id: "mentor" as UserRole,
      title: "I'm a Professional",
      subtitle: "Want to mentor and share my expertise",
      description: "Share your knowledge, help others grow, and earn while making an impact.",
      icon: GraduationCap,
      features: [
        "Flexible scheduling",
        "Set your own rates",
        "Build your reputation",
        "Impact careers",
        "Earn additional income"
      ],
      popular: false
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Choose your role</h3>
        <p className="text-muted-foreground text-sm">
          Select how you want to use Preplaced
        </p>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <Card 
              key={role.id}
              className={`cursor-pointer transition-spring hover:shadow-card ${
                isSelected 
                  ? "ring-2 ring-primary border-primary/50 bg-primary/5" 
                  : "hover:border-primary/30"
              }`}
              onClick={() => onRoleSelect(role.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-smooth ${
                    isSelected 
                      ? "bg-gradient-primary text-white" 
                      : "bg-muted"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{role.title}</h4>
                      {role.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Most Popular
                        </Badge>
                      )}
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {role.subtitle}
                    </p>
                    
                    <p className="text-sm mb-4">
                      {role.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      {role.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-accent" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {role.features.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{role.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">10,000+</span>
          </div>
          <div className="text-xs text-muted-foreground">Active Users</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">98%</span>
          </div>
          <div className="text-xs text-muted-foreground">Success Rate</div>
        </div>
      </div>
    </div>
  );
}