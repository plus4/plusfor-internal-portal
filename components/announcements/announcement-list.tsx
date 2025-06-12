'use client';

import { useState } from "react";
import { Announcement } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AnnouncementDetailDialog } from "./announcement-detail-dialog";

type AnnouncementListProps = {
  announcements: (Announcement & { is_read: boolean })[];
  showLimit?: number;
};

export function AnnouncementList({ 
  announcements, 
  showLimit
}: AnnouncementListProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<(Announcement & { is_read: boolean }) | null>(null);
  const [announcementList, setAnnouncementList] = useState(announcements);

  const displayedAnnouncements = showLimit 
    ? announcementList.slice(0, showLimit)
    : announcementList;

  const handleAnnouncementClick = (announcement: Announcement & { is_read: boolean }) => {
    setSelectedAnnouncement(announcement);
  };

  const handleMarkAsRead = (announcementId: number) => {
    // Update the announcement list to mark as read
    setAnnouncementList(prev => 
      prev.map(ann => 
        ann.id === announcementId 
          ? { ...ann, is_read: true }
          : ann
      )
    );
    
    // Update the selected announcement
    setSelectedAnnouncement(prev => 
      prev && prev.id === announcementId 
        ? { ...prev, is_read: true } 
        : prev
    );
  };

  return (
    <>
      <div className="space-y-4">
        {displayedAnnouncements.length > 0 ? (
          displayedAnnouncements.map((announcement) => (
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
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            お知らせはありません
          </div>
        )}
      </div>

      <AnnouncementDetailDialog
        announcement={selectedAnnouncement}
        open={!!selectedAnnouncement}
        onOpenChange={(open) => !open && setSelectedAnnouncement(null)}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
}
