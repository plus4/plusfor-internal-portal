import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  console.log("[createClient] Starting to create Supabase client...");
  console.log("[createClient] Checking environment variables...");
  console.log("[createClient] NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("[createClient] NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const cookieStore = await cookies();
  console.log("[createClient] Cookie store created");

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.set({ name, value: "", ...options });
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  console.log("[createClient] Supabase client created successfully");
  return client;
}
