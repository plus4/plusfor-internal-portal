import { redirect } from 'next/navigation';
import { Header } from "@/components/header";
import { isAdmin } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user has admin access
  const hasAdminAccess = await isAdmin();
  
  if (!hasAdminAccess) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
    </div>
  );
}
