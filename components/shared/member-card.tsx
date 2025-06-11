"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { UserType, UserRole } from "@/lib/types";

type Member = {
  id: string;
  name: string;
  department: string;
  position: string;
  user_type: UserType;
  role?: UserRole;
  email?: string;
};

interface MemberCardProps {
  member: Member;
  showEmail?: boolean;
  className?: string;
}

export function MemberCard({ member, showEmail = false, className = "" }: MemberCardProps) {
  const getUserTypeLabel = (userType: UserType) => {
    switch (userType) {
      case "EMPLOYEE":
        return "社員";
      case "BP":
        return "BP";
      default:
        return userType;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "管理者";
      case "USER":
        return "一般ユーザー";
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split('')
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-none">
                {member.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {member.department}
              </p>
              <p className="text-sm text-muted-foreground">
                {member.position}
              </p>
              
              {showEmail && member.email && (
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-3">
              <Badge 
                variant={member.user_type === "EMPLOYEE" ? "default" : "secondary"} 
                className="text-xs"
              >
                {getUserTypeLabel(member.user_type)}
              </Badge>
              {member.role === "ADMIN" && (
                <Badge variant="default" className="text-xs">
                  {getRoleLabel(member.role)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}