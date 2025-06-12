'use client';

import { useState, useRef, useCallback } from 'react';
import { User } from '@/lib/types';
import { Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type MemberListProps = {
  initialUsers: User[];
  hasMore: boolean;
};

export function MemberList({ initialUsers, hasMore: initialHasMore }: MemberListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/members?page=${page + 1}`);
      const { data, hasMore: newHasMore } = await response.json();
      setUsers(prev => [...prev, ...data]);
      setHasMore(newHasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page]);

  const lastUserElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user, index) => (
          <div
            key={user.id}
            ref={index === users.length - 1 ? lastUserElementRef : null}
            className="bg-card rounded-lg border p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.name}</h3>
                    <Badge variant={user.user_type === 'EMPLOYEE' ? 'default' : 'secondary'} className="text-xs">
                      {user.user_type === 'EMPLOYEE' ? '社員' : 'BP'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.position}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="w-20 text-muted-foreground">部署</span>
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      {users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          メンバーが見つかりません
        </div>
      )}
    </div>
  );
}
