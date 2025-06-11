import { createClient } from '@/lib/supabase/server';

/**
 * Check if the current user has admin role
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
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
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}


/**
 * Check if user has admin access and throw error if not
 * @throws Error if user is not admin
 */
export async function requireAdmin(): Promise<void> {
  const adminStatus = await isAdmin();
  
  if (!adminStatus) {
    throw new Error('管理者権限が必要です');
  }
}
