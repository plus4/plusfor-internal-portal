"use client";

import { useState, useEffect, useCallback } from "react";
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
import { TargetAudience } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Announcement = {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  target_audience: TargetAudience;
  created_at: string;
  updated_at: string;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("ALL");

  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/announcements");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "お知らせ一覧の取得に失敗しました");
      }
      
      const data = await response.json();
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      alert(error instanceof Error ? error.message : "お知らせ一覧の取得に失敗しました");
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          is_published: isPublished,
          target_audience: targetAudience,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "お知らせの作成に失敗しました");
      }

      setTitle("");
      setContent("");
      setIsPublished(false);
      setTargetAudience("ALL");
      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert(error instanceof Error ? error.message : "お知らせの作成に失敗しました");
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement) return;

    try {
      const response = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingAnnouncement.id,
          title,
          content,
          is_published: isPublished,
          target_audience: targetAudience,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "お知らせの更新に失敗しました");
      }

      setTitle("");
      setContent("");
      setIsPublished(false);
      setTargetAudience("ALL");
      setEditingAnnouncement(null);
      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error updating announcement:", error);
      alert(error instanceof Error ? error.message : "お知らせの更新に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このお知らせを削除してもよろしいですか？")) return;

    try {
      const response = await fetch(`/api/admin/announcements?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "お知らせの削除に失敗しました");
      }

      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert(error instanceof Error ? error.message : "お知らせの削除に失敗しました");
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setIsPublished(announcement.is_published);
    setTargetAudience(announcement.target_audience);
    setIsDialogOpen(true);
  };

  const handleTogglePublish = async (announcement: Announcement) => {
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: announcement.id,
          is_published: !announcement.is_published,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "公開状態の変更に失敗しました");
      }

      fetchAnnouncements();
    } catch (error) {
      console.error("Error toggling announcement publish status:", error);
      alert(error instanceof Error ? error.message : "公開状態の変更に失敗しました");
    }
  };

  return (
    <div className="container mx-auto py-8">
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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  タイトル
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="お知らせのタイトル"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  内容
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="お知らせの内容"
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="target_audience" className="text-sm font-medium">
                  対象
                </label>
                <Select
                  value={targetAudience}
                  onValueChange={(value: TargetAudience) => setTargetAudience(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="対象を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">全員</SelectItem>
                    <SelectItem value="EMPLOYEE">社員のみ</SelectItem>
                    <SelectItem value="BP">BPのみ</SelectItem>
                  </SelectContent>
                </Select>
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
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingAnnouncement(null);
                  setTitle("");
                  setContent("");
                  setIsPublished(false);
                  setTargetAudience("ALL");
                }}
              >
                キャンセル
              </Button>
              <Button
                onClick={editingAnnouncement ? handleUpdate : handleCreate}
                disabled={!title || !content}
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
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{announcement.title}</CardTitle>
                    <Badge 
                      variant={
                        announcement.target_audience === 'ALL' ? 'default' :
                        announcement.target_audience === 'EMPLOYEE' ? 'secondary' : 'outline'
                      }
                    >
                      {announcement.target_audience === 'ALL' ? '全員' :
                       announcement.target_audience === 'EMPLOYEE' ? '社員' : 'BP'}
                    </Badge>
                  </div>
                  <CardDescription>
                    作成日:{" "}
                    {format(new Date(announcement.created_at), "yyyy年MM月dd日 HH:mm", {
                      locale: ja,
                    })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePublish(announcement)}
                    title={announcement.is_published ? "非公開にする" : "公開する"}
                  >
                    {announcement.is_published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(announcement)}
                    title="編集"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(announcement.id)}
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
