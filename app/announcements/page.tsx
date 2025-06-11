import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Announcement } from '@/lib/types';
import Link from 'next/link';

// データ取得とロジックを統合
async function getAnnouncementsData(): Promise<{
  announcements: Announcement[];
  user: User | null;
}> {
  const supabase = await createClient();
  
  // 認証チェック
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login");
  }

  // ユーザー情報取得
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !userProfile) {
    redirect("/auth/login");
  }

  // お知らせ取得（公開済み、かつユーザーの種別に応じた対象のもの）
  let query = supabase
    .from("announcements")
    .select("*")
    .eq("is_published", true);

  // 対象絞り込み
  if (userProfile.user_type === 'EMPLOYEE') {
    query = query.in('target_audience', ['ALL', 'EMPLOYEE']);
  } else if (userProfile.user_type === 'BP') {
    query = query.in('target_audience', ['ALL', 'BP']);
  }

  const { data: announcements, error: announcementsError } = await query
    .order("created_at", { ascending: false });

  if (announcementsError) {
    console.error("Error fetching announcements:", announcementsError);
    return {
      announcements: [],
      user: userProfile
    };
  }

  return {
    announcements: announcements || [],
    user: userProfile
  };
}

function getTargetBadgeVariant(target: string) {
  switch (target) {
    case 'ALL':
      return 'default';
    case 'EMPLOYEE':
      return 'secondary';
    case 'BP':
      return 'outline';
    default:
      return 'default';
  }
}

function getTargetLabel(target: string) {
  switch (target) {
    case 'ALL':
      return '全員';
    case 'EMPLOYEE':
      return '社員';
    case 'BP':
      return 'BP';
    default:
      return target;
  }
}

export default async function AnnouncementsPage() {
  const { announcements } = await getAnnouncementsData();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">お知らせ一覧</h1>
        <Link href="/dashboard">
          <Button variant="outline">ダッシュボードに戻る</Button>
        </Link>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">現在表示できるお知らせはありません。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTargetBadgeVariant(announcement.target_audience)}>
                        {getTargetLabel(announcement.target_audience)}
                      </Badge>
                      <CardDescription>
                        {new Date(announcement.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: announcement.content.replace(/\n/g, '<br>') }}
                />
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    最終更新: {new Date(announcement.updated_at || announcement.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}