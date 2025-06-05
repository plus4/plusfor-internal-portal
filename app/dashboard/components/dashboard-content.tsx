'use client';

import Link from "next/link";
import { Announcement, Employee } from "@/lib/types";

type DashboardContentProps = {
  announcements: Announcement[];
  employees: Employee[];
};

export function DashboardContent({ announcements, employees }: DashboardContentProps) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="w-20 text-muted-foreground">部署</span>
                        <span>{employee.department}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="w-20 text-muted-foreground">メール</span>
                        <span className="truncate">{employee.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
} 