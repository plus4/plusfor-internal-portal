'use client';

import { useState } from "react";
import { Announcement } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AnnouncementDetailDialogProps = {
  announcement: (Announcement & { is_read: boolean }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead?: (announcementId: number) => void;
};

export function AnnouncementDetailDialog({ 
  announcement, 
  open, 
  onOpenChange,
  onMarkAsRead 
}: AnnouncementDetailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async () => {
    if (!announcement || announcement.is_read || !onMarkAsRead) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/announcements/${announcement.id}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('既読マークに失敗しました');
      }

      onMarkAsRead(announcement.id);
    } catch (error) {
      console.error('Error marking as read:', error);
      alert('既読マークに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {announcement?.title}
            {announcement && !announcement.is_read && (
              <Badge variant="destructive" className="text-xs">未読</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {announcement && new Date(announcement.created_at).toLocaleDateString('ja-JP')}
          </div>
          <div className="whitespace-pre-wrap">
            {announcement?.content}
          </div>
          {announcement && !announcement.is_read && onMarkAsRead && (
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
  );
}
