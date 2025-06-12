"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    
    // 親ドメインのCookieを削除
    try {
      await fetch('/api/auth/remove-parent-cookie', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (cookieError) {
      console.warn('Failed to remove parent domain cookie:', cookieError);
    }

    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return <Button onClick={logout}>ログアウト</Button>;
} 
