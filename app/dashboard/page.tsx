import { DashboardContent } from "./components/dashboard-content";

// 仮のデータ型定義
type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
};

type Employee = {
  id: number;
  name: string;
  department: string;
  position: string;
  email: string;
};

// 仮のデータ
const announcements: Announcement[] = [
  {
    id: 1,
    title: "システムメンテナンスのお知らせ",
    content: "来週月曜日の深夜にシステムメンテナンスを実施します。",
    date: "2024-03-20",
  },
  {
    id: 2,
    title: "新入社員研修の開催",
    content: "4月1日より新入社員研修を開催します。",
    date: "2024-03-19",
  },
  {
    id: 3,
    title: "社内イベントの開催",
    content: "来月社内イベントを開催予定です。詳細は後日お知らせします。",
    date: "2024-03-18",
  },
];

const employees: Employee[] = [
  {
    id: 1,
    name: "山田 太郎",
    department: "開発部",
    position: "シニアエンジニア",
    email: "yamada@example.com",
  },
  {
    id: 2,
    name: "鈴木 花子",
    department: "営業部",
    position: "マネージャー",
    email: "suzuki@example.com",
  },
  {
    id: 3,
    name: "佐藤 次郎",
    department: "人事部",
    position: "部長",
    email: "sato@example.com",
  },
];

export default async function DashboardPage() {
  // TODO: 実際のデータフェッチング処理を実装
  // const announcements = await fetchAnnouncements();
  // const employees = await fetchEmployees();

  return <DashboardContent announcements={announcements} employees={employees} />;
} 