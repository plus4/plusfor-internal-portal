import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail, Building, Briefcase, Calendar, Shield } from "lucide-react";

async function getUserProfile() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    throw new Error('プロフィール情報の取得に失敗しました');
  }

  return {
    authUser: user,
    profile
  };
}

export default async function ProfilePage() {
  const { profile } = await getUserProfile();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'destructive' : 'secondary';
  };

  const getUserTypeLabel = (userType: string) => {
    return userType === 'EMPLOYEE' ? '社員' : 'BP';
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">プロフィール</h1>
                <p className="text-muted-foreground">あなたのアカウント情報を確認できます。</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="" alt={profile.name} />
                        <AvatarFallback className="text-2xl">
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="flex justify-center gap-2">
                        <Badge variant={getRoleColor(profile.role)}>
                          {profile.role === 'ADMIN' ? '管理者' : 'ユーザー'}
                        </Badge>
                        <Badge variant="outline">
                          {getUserTypeLabel(profile.user_type)}
                        </Badge>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="outline" className="w-full">
                      プロフィール編集
                    </Button>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      アカウント情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        メールアドレス
                      </div>
                      <div className="font-medium">{profile.email}</div>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="w-4 h-4" />
                        部署
                      </div>
                      <div className="font-medium">{profile.department || '未設定'}</div>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        役職
                      </div>
                      <div className="font-medium">{profile.position || '未設定'}</div>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        登録日
                      </div>
                      <div className="font-medium">
                        {new Date(profile.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        権限
                      </div>
                      <div className="font-medium">
                        {profile.role === 'ADMIN' ? '管理者権限' : '一般ユーザー権限'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
