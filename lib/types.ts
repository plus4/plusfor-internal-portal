export type UserType = 'EMPLOYEE' | 'BP';
export type UserRole = 'ADMIN' | 'USER';
export type TargetAudience = 'EMPLOYEE' | 'BP' | 'ALL';

export type Announcement = {
  id: number;
  title: string;
  content: string;
  is_published: boolean;
  target_audience: TargetAudience;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  user_type: UserType;
  role: UserRole;
  created_at: string;
  updated_at: string;
}; 
