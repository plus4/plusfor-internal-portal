"use client";

// モジュールが読み込まれた時点でのログ
console.log("[UsersPage] Module loaded");

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "../layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";

type User = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export default function UsersPage() {
  console.log("[UsersPage] Component function called");

  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const supabase = useSupabase();

  useEffect(() => {
    console.log("[UsersPage] Component mounted");
    return () => {
      console.log("[UsersPage] Component unmounted");
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    console.log("[UsersPage] Starting to fetch users...");
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("[UsersPage] Error fetching users:", error);
      return;
    }

    console.log("[UsersPage] Users fetched successfully:", {
      count: data?.length || 0,
      firstUser: data?.[0] || null
    });

    if (data) {
      setUsers(data);
    }
  }, [supabase]);

  useEffect(() => {
    console.log("[UsersPage] useEffect triggered, calling fetchUsers");
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async () => {
    console.log("[UsersPage] Starting to create user...");
    try {
      const { error } = await supabase.from("users").insert([
        {
          email,
          full_name: fullName,
        },
      ]).select();

      if (error) {
        console.log("[UsersPage] Error creating user:", error);
        alert(`ユーザーの作成に失敗しました: ${error.message}`);
        return;
      }

      console.log("[UsersPage] User created successfully");
      setEmail("");
      setFullName("");
      setIsDialogOpen(false);
      fetchUsers();
    } catch (err) {
      console.log("[UsersPage] Unexpected error creating user:", err);
      alert("予期せぬエラーが発生しました。もう一度お試しください。");
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    console.log("[UsersPage] Starting to update user:", editingUser.id);
    const { error } = await supabase
      .from("users")
      .update({
        email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingUser.id);

    if (error) {
      console.log("[UsersPage] Error updating user:", error);
      return;
    }

    console.log("[UsersPage] User updated successfully");
    setEmail("");
    setFullName("");
    setEditingUser(null);
    setIsDialogOpen(false);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このユーザーを削除してもよろしいですか？")) return;

    console.log("[UsersPage] Starting to delete user:", id);
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.log("[UsersPage] Error deleting user:", error);
      return;
    }

    console.log("[UsersPage] User deleted successfully");
    fetchUsers();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEmail(user.email);
    setFullName(user.full_name);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ユーザー管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>新規作成</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "ユーザーを編集" : "新規ユーザーを作成"}
              </DialogTitle>
              <DialogDescription>
                ユーザーのメールアドレスと名前を入力してください。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">名前</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={editingUser ? handleUpdate : handleCreate}
              >
                {editingUser ? "更新" : "作成"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{user.full_name}</CardTitle>
                  <CardDescription>
                    {user.email}
                    <br />
                    作成日:{" "}
                    {format(new Date(user.created_at), "yyyy年MM月dd日 HH:mm", {
                      locale: ja,
                    })}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
} 
