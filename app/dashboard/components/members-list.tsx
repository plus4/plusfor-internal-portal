'use client';

import { useState, useCallback } from 'react';
import { MembersGrid } from '@/components/shared/members-grid';
import { User } from '@/lib/types';

type MembersListProps = {
  initialUsers: User[];
  hasMore: boolean;
};

export function MembersList({ initialUsers, hasMore: initialHasMore }: MembersListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

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

  return (
    <MembersGrid
      members={users}
      showEmail={true}
      showSearch={false}
      showFilters={false}
      hasMore={hasMore}
      onLoadMore={loadMore}
      isLoading={isLoading}
    />
  );
} 
