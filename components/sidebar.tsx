'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  isAdmin: boolean;
};

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();

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
    <aside className="w-64 bg-background border-r border-border">
      <div className="p-4">
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
  );
}