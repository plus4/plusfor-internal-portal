"use client";

import { useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";

// Supabaseクライアントのコンテキストを作成
const SupabaseContext = createContext<ReturnType<typeof createClient> | null>(null);

// カスタムフックを作成
export function useSupabase() {
  const supabase = useContext(SupabaseContext);
  if (!supabase) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return supabase;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <SupabaseContext.Provider value={supabase}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8">
          {children}
        </main>
      </div>
    </SupabaseContext.Provider>
  );
} 
