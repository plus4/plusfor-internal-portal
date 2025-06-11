"use client";

import { useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserType, UserRole } from "@/lib/types";

type UserProfile = {
  id: string;
  name: string;
  department: string;
  position: string;
  user_type: UserType;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

interface ProfileFormProps {
  user: SupabaseUser;
  userProfile: UserProfile | null;
}

export function ProfileForm({ user, userProfile }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    department: userProfile?.department || "",
    position: userProfile?.position || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新に失敗しました");
      }

      setSuccess("プロフィールを更新しました");
      setIsEditing(false);
      
      // ページを再読み込みして最新情報を表示
      window.location.reload();
    } catch (error) {
      setError(error instanceof Error ? error.message : "更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || "",
      department: userProfile?.department || "",
      position: userProfile?.position || "",
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "管理者";
      case "USER":
        return "一般ユーザー";
      default:
        return role;
    }
  };

  const getUserTypeLabel = (userType: UserType) => {
    switch (userType) {
      case "EMPLOYEE":
        return "社員";
      case "BP":
        return "BP";
      default:
        return userType;
    }
  };

  return (
    <div className="space-y-6">
      {/* 基本情報カード */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>
            アカウントの基本情報を表示・編集します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* メールアドレス（読み取り専用） */}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={user.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              メールアドレスは変更できません。
            </p>
          </div>

          <hr className="border-t" />

          {/* 編集可能な項目 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">氏名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">部署</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">役職</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>

            {/* 権限情報（読み取り専用） */}
            <div className="space-y-2">
              <Label>権限・種別</Label>
              <div className="flex gap-2">
                <Badge variant={userProfile?.role === "ADMIN" ? "default" : "secondary"}>
                  {getRoleLabel(userProfile?.role || "USER")}
                </Badge>
                <Badge variant="outline">
                  {getUserTypeLabel(userProfile?.user_type || "EMPLOYEE")}
                </Badge>
              </div>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* 成功メッセージ */}
          {success && (
            <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                編集
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="min-w-[80px]"
                >
                  {isLoading ? "保存中..." : "保存"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* アカウント情報カード */}
      <Card>
        <CardHeader>
          <CardTitle>アカウント情報</CardTitle>
          <CardDescription>
            アカウントの詳細情報を表示します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">アカウント作成日</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {userProfile?.created_at
                  ? new Date(userProfile.created_at).toLocaleDateString("ja-JP")
                  : "不明"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">最終更新日</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {userProfile?.updated_at
                  ? new Date(userProfile.updated_at).toLocaleDateString("ja-JP")
                  : "不明"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}