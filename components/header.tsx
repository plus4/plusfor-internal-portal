'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Menu } from 'lucide-react';
import { LogoutButton } from "@/components/auth/logout-button";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useLayout } from "@/lib/layout-context";

type UserProfile = {
  name: string;
  department: string;
  position: string;
  role: 'ADMIN' | 'USER';
  profile_image_url?: string;
};

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const { toggleSidebar } = useLayout();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // ユーザー情報をAPI経由で取得
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const userData = await response.json();
            setUserInfo({
              name: userData.name,
              department: userData.department,
              position: userData.position,
              role: userData.role,
              profile_image_url: userData.profile_image_url
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    getUser();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        <div className="mr-4 flex items-center">
          {/* Mobile hamburger button */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link className="mr-6 flex items-center space-x-2" href="/dashboard">
            <span className="font-bold">社内ポータル</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userInfo?.profile_image_url} alt={userInfo?.name || user.email} />
                      <AvatarFallback>
                        {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{userInfo?.name || user.email}</p>
                        {userInfo?.role === 'ADMIN' && (
                          <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                            管理者
                          </span>
                        )}
                      </div>
                      {userInfo && (
                        <p className="text-xs text-muted-foreground">
                          {userInfo.department} {userInfo.position && `/ ${userInfo.position}`}
                        </p>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" onClick={() => router.push("/auth/login")}>
                ログイン
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 
