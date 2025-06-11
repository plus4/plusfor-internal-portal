"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { MemberCard } from "./member-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Users, Filter } from "lucide-react";
import { UserType, UserRole } from "@/lib/types";

type Member = {
  id: string;
  name: string;
  department: string;
  position: string;
  user_type: UserType;
  role?: UserRole;
  email?: string;
};

interface MembersGridProps {
  members: Member[];
  showEmail?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  title?: string;
  className?: string;
  // 無限スクロール用のプロパティ
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
  isLoading?: boolean;
}

export function MembersGrid({ 
  members, 
  showEmail = false, 
  showSearch = true,
  showFilters = true,
  title = "メンバー検索",
  className = "",
  hasMore = false,
  onLoadMore,
  isLoading = false
}: MembersGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // 部署一覧を取得
  const departments = useMemo(() => {
    const uniqueDepartments = Array.from(
      new Set(members.map(member => member.department))
    ).sort();
    return uniqueDepartments;
  }, [members]);

  // フィルタリングされたメンバー一覧
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = 
        departmentFilter === "all" || member.department === departmentFilter;
      
      const matchesUserType = 
        userTypeFilter === "all" || member.user_type === userTypeFilter;

      return matchesSearch && matchesDepartment && matchesUserType;
    });
  }, [members, searchTerm, departmentFilter, userTypeFilter]);

  // 無限スクロール用の ref コールバック
  const lastMemberElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        onLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, onLoadMore]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 検索・フィルター */}
      {(showSearch || showFilters) && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {title}
              </CardTitle>
              {showFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  フィルター
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 検索ボックス */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="名前、部署、役職で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* フィルター */}
            {showFilters && showFilterPanel && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">部署</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="部署を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての部署</SelectItem>
                      {departments.map(department => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">種別</label>
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="種別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての種別</SelectItem>
                      <SelectItem value="EMPLOYEE">社員</SelectItem>
                      <SelectItem value="BP">BP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* 検索結果カウント */}
            <div className="text-sm text-muted-foreground">
              {filteredMembers.length} 件のメンバーが見つかりました
            </div>
          </CardContent>
        </Card>
      )}

      {/* メンバー一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member, index) => (
          <div
            key={member.id}
            ref={
              hasMore && onLoadMore && index === filteredMembers.length - 1
                ? lastMemberElementRef
                : null
            }
          >
            <MemberCard member={member} showEmail={showEmail} />
          </div>
        ))}
      </div>

      {/* ローディング表示 */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* 結果が0件の場合 */}
      {filteredMembers.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">メンバーが見つかりません</h3>
            <p className="text-muted-foreground">
              検索条件を変更してみてください。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}