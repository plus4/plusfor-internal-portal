"use client";

import { useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";

// モジュールが読み込まれた時点でのログ
console.log("[AdminLayout] Module loaded");

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
  console.log("[AdminLayout] Component function called");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    console.log("[AdminLayout] Component mounted");
    return () => {
      console.log("[AdminLayout] Component unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("[AdminLayout] Checking authentication...");
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("[AdminLayout] Auth check result:", { 
        hasSession: !!session,
        error: error ? error.message : null
      });

      if (error || !session) {
        console.log("[AdminLayout] No valid session, redirecting to login...");
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
