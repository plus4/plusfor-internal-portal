"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient();

type User = {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  created_at: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    position: "",
    email: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("ユーザー一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert(`ユーザーを作成しました。初期パスワード: ${data.initialPassword}`);
      setIsCreateDialogOpen(false);
      setFormData({ name: "", department: "", position: "", email: "" });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        if (error.message.includes("認証が必要です")) {
          router.push("/auth/login");
        } else {
          alert(error.message);
        }
      } else {
        alert("ユーザーの作成に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedUser.id,
          name: formData.name,
          department: formData.department,
          position: formData.position,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert("ユーザー情報を更新しました");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ name: "", department: "", position: "", email: "" });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error) {
        if (error.message.includes("認証が必要です")) {
          router.push("/auth/login");
        } else {
          alert(error.message);
        }
      } else {
        alert("ユーザー情報の更新に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("このユーザーを削除してもよろしいですか？")) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert("ユーザーを削除しました");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error instanceof Error) {
        if (error.message.includes("認証が必要です")) {
          router.push("/auth/login");
        } else {
          alert(error.message);
        }
      } else {
        alert("ユーザーの削除に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      department: user.department,
      position: user.position,
      email: user.email,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">ユーザー管理</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>新規ユーザー作成</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規ユーザー作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">名前</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="department">部署</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="position">役職</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={isLoading || !formData.name || !formData.department || !formData.position || !formData.email}
                className="w-full"
              >
                {isLoading ? "作成中..." : "作成"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                名前
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                部署
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                役職
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                メールアドレス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap text-foreground">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-foreground">{user.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-foreground">{user.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-foreground">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(user)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー情報の編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">名前</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="edit-department">部署</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="edit-position">役職</Label>
              <Input
                id="edit-position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">メールアドレス</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                disabled
              />
            </div>
            <Button
              onClick={handleUpdate}
              disabled={isLoading || !formData.name || !formData.department || !formData.position}
              className="w-full"
            >
              {isLoading ? "更新中..." : "更新"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
