export type Announcement = {
  id: number;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  created_at: string;
  updated_at: string;
}; 
