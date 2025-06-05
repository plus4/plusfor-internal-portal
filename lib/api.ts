import { createClient } from "@/lib/supabase/server";
import { Announcement, Employee } from "./types";

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }

  return data;
}

export async function getEmployees(): Promise<Employee[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }

  return data;
} 