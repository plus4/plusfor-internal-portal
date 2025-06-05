'use client';

import Link from "next/link";
import { Announcement, Employee } from "@/lib/types";
import { EmployeeList } from "./employee-list";

type DashboardContentProps = {
  announcements: Announcement[];
  employees: Employee[];
  hasMoreEmployees: boolean;
};

export function DashboardContent({ 
  announcements, 
  employees, 
  hasMoreEmployees 
}: DashboardContentProps) {
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
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{announcement.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(announcement.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{announcement.content}</p>
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
            <EmployeeList 
              initialEmployees={employees} 
              hasMore={hasMoreEmployees} 
            />
          </section>
        </div>
      </main>
    </div>
  );
} 