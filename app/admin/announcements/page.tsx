"use client";

// モジュールが読み込まれた時点でのログ
console.log("[AnnouncementsPage] Module loaded");

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Announcement = {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export default function AnnouncementsPage() {
  console.log("[AnnouncementsPage] Component function called");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const supabase = createClient();

  // コンポーネントのマウントを確認するためのuseEffect
  useEffect(() => {
    console.log("[AnnouncementsPage] Component mounted");
    return () => {
      console.log("[AnnouncementsPage] Component unmounted");
    };
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    console.log("[AnnouncementsPage] Starting to fetch announcements...");
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("[AnnouncementsPage] Error fetching announcements:", error);
      return;
    }

    console.log("[AnnouncementsPage] Announcements fetched successfully:", {
      count: data?.length || 0,
      firstAnnouncement: data?.[0] || null
    });

    if (data) {
      setAnnouncements(data);
    }
  }, [supabase]);

  useEffect(() => {
    console.log("[AnnouncementsPage] useEffect triggered, calling fetchAnnouncements");
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async () => {
    console.log("[AnnouncementsPage] Starting to create announcement...");
    try {
      const { error } = await supabase.from("announcements").insert([
        {
          title,
          content,
          is_published: isPublished,
        },
      ]).select();

      if (error) {
        console.log("[AnnouncementsPage] Error creating announcement:", error);
        alert(`お知らせの作成に失敗しました: ${error.message}`);
        return;
      }

      console.log("[AnnouncementsPage] Announcement created successfully");
      setTitle("");
      setContent("");
      setIsPublished(false);
      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (err) {
      console.log("[AnnouncementsPage] Unexpected error creating announcement:", err);
      alert("予期せぬエラーが発生しました。もう一度お試しください。");
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement) return;

    console.log("[AnnouncementsPage] Starting to update announcement:", editingAnnouncement.id);
    const { error } = await supabase
      .from("announcements")
      .update({
        title,
        content,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingAnnouncement.id);

    if (error) {
      console.log("[AnnouncementsPage] Error updating announcement:", error);
      return;
    }

    console.log("[AnnouncementsPage] Announcement updated successfully");
    setTitle("");
    setContent("");
    setIsPublished(false);
    setEditingAnnouncement(null);
    setIsDialogOpen(false);
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このお知らせを削除してもよろしいですか？")) return;

    console.log("[AnnouncementsPage] Starting to delete announcement:", id);
    const { error } = await supabase.from("announcements").delete().eq("id", id);

    if (error) {
      console.log("[AnnouncementsPage] Error deleting announcement:", error);
      return;
    }

    console.log("[AnnouncementsPage] Announcement deleted successfully");
    fetchAnnouncements();
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setIsPublished(announcement.is_published);
    setIsDialogOpen(true);
  };

  const handleTogglePublish = async (announcement: Announcement) => {
    const { error } = await supabase
      .from("announcements")
      .update({
        is_published: !announcement.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", announcement.id);

    if (error) {
      console.log("Error toggling announcement publish status:", error);
      return;
    }

    fetchAnnouncements();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">お知らせ管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>新規作成</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "お知らせを編集" : "新規お知らせを作成"}
              </DialogTitle>
              <DialogDescription>
                お知らせのタイトルと内容を入力してください。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="publish"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="publish">公開する</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={editingAnnouncement ? handleUpdate : handleCreate}
              >
                {editingAnnouncement ? "更新" : "作成"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{announcement.title}</CardTitle>
                  <CardDescription>
                    作成日:{" "}
                    {format(new Date(announcement.created_at), "yyyy年MM月dd日 HH:mm", {
                      locale: ja,
                    })}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePublish(announcement)}
                  >
                    {announcement.is_published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
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
