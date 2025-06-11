import { redirect } from 'next/navigation';
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { createClient } from '@/lib/supabase/server';

// データ取得とロジックを統合
async function checkAdminAccess(): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return false;
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return false;
    }

    return profile.role === 'ADMIN';
  } catch {
    return false;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user has admin access
  const hasAdminAccess = await checkAdminAccess();
  
  if (!hasAdminAccess) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar isAdmin={true} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

