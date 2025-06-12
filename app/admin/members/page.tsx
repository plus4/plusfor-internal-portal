"use client";

import { useState, useEffect, useCallback } from "react";
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
import { UserType, UserRole } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type User = {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
  user_type: UserType;
  role: UserRole;
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
    user_type: "EMPLOYEE" as UserType,
    role: "USER" as UserRole,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/members");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ユーザー一覧の取得に失敗しました");
      }
      
      const data = await response.json();
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error instanceof Error) {
        if (error.message.includes("認証が必要です")) {
          router.push("/auth/login");
        } else {
          alert(error.message);
        }
      } else {
        alert("ユーザー一覧の取得に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/members", {
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
      setFormData({ name: "", department: "", position: "", email: "", user_type: "EMPLOYEE", role: "USER" });
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

      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedUser.id,
          name: formData.name,
          department: formData.department,
          position: formData.position,
          user_type: formData.user_type,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert("ユーザー情報を更新しました");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ name: "", department: "", position: "", email: "", user_type: "EMPLOYEE", role: "USER" });
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

      const response = await fetch(`/api/admin/members?id=${encodeURIComponent(userId)}`, {
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
      user_type: user.user_type,
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="p-8">
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
              <div>
                <Label htmlFor="user_type">ユーザー種別</Label>
                <Select
                  value={formData.user_type}
                  onValueChange={(value: UserType) =>
                    setFormData({ ...formData, user_type: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ユーザー種別を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">社員</SelectItem>
                    <SelectItem value="BP">BP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">ロール</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ロールを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">一般ユーザー</SelectItem>
                    <SelectItem value="ADMIN">管理者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreate}
                disabled={isLoading || !formData.name || !formData.department || !formData.position || !formData.email || !formData.user_type || !formData.role}
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
                種別
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ロール
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.user_type === 'EMPLOYEE' ? 'default' : 'secondary'}>
                    {user.user_type === 'EMPLOYEE' ? '社員' : 'BP'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'outline'}>
                    {user.role === 'ADMIN' ? '管理者' : '一般ユーザー'}
                  </Badge>
                </td>
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
            <div>
              <Label htmlFor="edit-user_type">ユーザー種別</Label>
              <Select
                value={formData.user_type}
                onValueChange={(value: UserType) =>
                  setFormData({ ...formData, user_type: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ユーザー種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">社員</SelectItem>
                  <SelectItem value="BP">BP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-role">ロール</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ロールを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">一般ユーザー</SelectItem>
                  <SelectItem value="ADMIN">管理者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleUpdate}
              disabled={isLoading || !formData.name || !formData.department || !formData.position || !formData.user_type || !formData.role}
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

