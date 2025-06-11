"use client";

import { MembersGrid } from "@/components/shared/members-grid";
import { UserType, UserRole } from "@/lib/types";

type Member = {
  id: string;
  name: string;
  department: string;
  position: string;
  user_type: UserType;
  role: UserRole;
};

interface MembersListProps {
  members: Member[];
}

export function MembersList({ members }: MembersListProps) {
  return (
    <MembersGrid 
      members={members}
      showEmail={false}
      showSearch={true}
      showFilters={true}
      title="メンバー検索"
    />
  );
}