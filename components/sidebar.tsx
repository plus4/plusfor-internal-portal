'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useLayout } from "@/lib/layout-context";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();
  const { isSidebarOpen, setSidebarOpen } = useLayout();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'ADMIN');
      }
    };

    checkAdminStatus();
  }, [supabase]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) => {
    const baseClass = "block px-4 py-2 rounded-lg hover:bg-accent transition-colors";
    const activeClass = "bg-accent text-accent-foreground";
    
    return isActive(href) 
      ? `${baseClass} ${activeClass}`
      : baseClass;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4">
          {/* Mobile close button */}
          <div className="flex justify-end lg:hidden mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="space-y-2">
          <Link 
            href="/dashboard" 
            className={linkClass("/dashboard")}
          >
            ホーム
          </Link>
          <Link 
            href="/announcements" 
            className={linkClass("/announcements")}
          >
            お知らせ
          </Link>
          <Link 
            href="/members" 
            className={linkClass("/members")}
          >
            メンバー一覧
          </Link>
          <Link 
            href="/profile" 
            className={linkClass("/profile")}
          >
            プロフィール
          </Link>
          
          {/* 管理者のみ表示 */}
          {isAdmin && (
            <>
              <div className="border-t border-border my-4"></div>
              <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                管理機能
              </div>
              <Link 
                href="/admin/announcements" 
                className={`${linkClass("/admin/announcements")} text-sm`}
              >
                お知らせ管理
              </Link>
              <Link 
                href="/admin/members" 
                className={`${linkClass("/admin/members")} text-sm`}
              >
                メンバー管理
              </Link>
            </>
          )}
          </nav>
        </div>
      </aside>
    </>
  );
}
