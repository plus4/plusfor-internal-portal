'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';
import { LogoutButton } from "@/components/auth/logout-button";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

type User = {
  name: string;
  department: string;
  position: string;
};

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // ユーザー情報をAPI経由で取得
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const userData = await response.json();
            setUserInfo({
              name: userData.name,
              department: userData.department,
              position: userData.position
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
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
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
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userInfo?.name || user.email}</p>
                      {userInfo && (
                        <p className="text-xs text-muted-foreground">
                          {userInfo.department} / {userInfo.position}
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
