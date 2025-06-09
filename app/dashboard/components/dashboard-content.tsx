'use client';

import Link from "next/link";
import { Announcement, User } from "@/lib/types";
import { UserList } from "./user-list";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type DashboardContentProps = {
  announcements: (Announcement & { is_read: boolean })[];
  users: User[];
  hasMoreUsers: boolean;
};

export function DashboardContent({
  announcements,
  users,
  hasMoreUsers
}: DashboardContentProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<(Announcement & { is_read: boolean }) | null>(null);
  const [announcementList, setAnnouncementList] = useState(announcements);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleAnnouncementClick = (announcement: Announcement & { is_read: boolean }) => {
    setSelectedAnnouncement(announcement);
  };

  const handleMarkAsRead = async () => {
    if (!selectedAnnouncement || selectedAnnouncement.is_read) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/announcements/${selectedAnnouncement.id}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('既読マークに失敗しました');
      }

      // Update the announcement list to mark as read
      setAnnouncementList(prev => 
        prev.map(ann => 
          ann.id === selectedAnnouncement.id 
            ? { ...ann, is_read: true }
            : ann
        )
      );
      
      // Update the selected announcement
      setSelectedAnnouncement(prev => 
        prev ? { ...prev, is_read: true } : null
      );

    } catch (error) {
      console.error('Error marking as read:', error);
      alert('既読マークに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-8">ダッシュボード</h1>
          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className="block px-4 py-2 rounded-lg hover:bg-accent"
            >
              ホーム
            </Link>
            <Link 
              href="/dashboard/announcements" 
              className="block px-4 py-2 rounded-lg hover:bg-accent"
            >
              お知らせ
            </Link>
            <Link 
              href="/dashboard/employees" 
              className="block px-4 py-2 rounded-lg hover:bg-accent"
            >
              社員一覧
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* お知らせセクション */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">お知らせ</h2>
              <Link 
                href="/dashboard/announcements" 
                className="text-sm text-primary hover:underline"
              >
                すべて見る
              </Link>
            </div>
            <div className="space-y-4">
              {announcementList.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => handleAnnouncementClick(announcement)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{announcement.title}</h3>
                      {!announcement.is_read && (
                        <Badge variant="destructive" className="text-xs">未読</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(announcement.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{announcement.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 社員一覧セクション */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">社員一覧</h2>
              <Link 
                href="/dashboard/employees" 
                className="text-sm text-primary hover:underline"
              >
                すべて見る
              </Link>
            </div>
            <UserList 
              initialUsers={users} 
              hasMore={hasMoreUsers} 
            />
          </section>
        </div>
      </main>

      {/* お知らせ詳細ダイアログ */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAnnouncement?.title}
              {selectedAnnouncement && !selectedAnnouncement.is_read && (
                <Badge variant="destructive" className="text-xs">未読</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {selectedAnnouncement && new Date(selectedAnnouncement.created_at).toLocaleDateString('ja-JP')}
            </div>
            <div className="whitespace-pre-wrap">
              {selectedAnnouncement?.content}
            </div>
            {selectedAnnouncement && !selectedAnnouncement.is_read && (
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleMarkAsRead}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "処理中..." : "既読にする"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
