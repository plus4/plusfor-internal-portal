# 社内ポータルサイト要件定義書

## プロジェクト概要
Next.jsを使用した社内向けポータルサイトの開発。会社関係者限定でアクセス可能で、ユーザー管理とお知らせ機能を持つWebアプリケーション。

## 技術スタック
- **Frontend**: Next.js 15+ (App Router)
- **UI Framework**: Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth
- **State Management**: React hooks (useState, useContext) + Zustand
- **Language**: TypeScript 5.x
- **Deployment**: Vercel

## データベース設計（Supabase）

### auth.users（Supabase標準）
Supabaseの認証システムが自動管理するテーブル
```sql
- id: uuid (Primary Key, Supabase管理)
- email: string (Unique, Supabase管理)
- created_at: timestamp (Supabase管理)
- updated_at: timestamp (Supabase管理)
```

### public.users テーブル（現在実装）
```sql
- id: uuid (Primary Key, Foreign Key to auth.users.id)
- email: string (Not null, Unique)
- name: string (Not null)
- role: enum ('ADMIN', 'USER') (Not null, Default: 'USER')
- user_type: enum ('EMPLOYEE', 'BP') (Not null)
- profile_image_url: string (Optional)
- department: string (Optional)
- position: string (Optional)
- phone_number: string (Optional)
- join_date: date (Optional)
- is_active: boolean (Not null, Default: true)
- created_at: timestamp with time zone (Default: now())
- updated_at: timestamp with time zone (Default: now())
```

### public.announcements テーブル
```sql
- id: uuid (Primary Key, Default: gen_random_uuid())
- title: string (Not null)
- content: text (Not null)
- target_audience: enum ('EMPLOYEE', 'BP', 'ALL') (Not null)
- author_id: uuid (Foreign Key to profiles.id, Not null)
- is_published: boolean (Not null, Default: false)
- published_at: timestamp with time zone (Optional)
- created_at: timestamp with time zone (Default: now())
- updated_at: timestamp with time zone (Default: now())
```

### public.announcement_reads テーブル
```sql
- id: uuid (Primary Key, Default: gen_random_uuid())
- announcement_id: uuid (Foreign Key to announcements.id, Not null)
- user_id: uuid (Foreign Key to users.id, Not null)
- read_at: timestamp with time zone (Default: now())
- UNIQUE(announcement_id, user_id)
```

### RLS (Row Level Security) ポリシー
```sql
-- users テーブル
- SELECT: 認証済みユーザーは全プロフィール閲覧可能
- INSERT: 管理者のみ
- UPDATE: 本人または管理者のみ
- DELETE: 管理者のみ

-- announcements テーブル
- SELECT: 認証済みユーザーかつ対象に含まれる場合のみ
- INSERT/UPDATE/DELETE: 管理者のみ

-- announcement_reads テーブル
- SELECT/INSERT: 認証済みユーザーは自分の既読情報のみ
- UPDATE/DELETE: 禁止
```

## 機能要件

### 1. 認証・認可システム（Supabase Auth）
- **ログイン機能**
  - Supabaseの標準認証フロー
  - メールアドレスとパスワードによる認証
  - 自動セッション管理
  - JWT トークンベース認証

- **ログアウト機能**
  - Supabaseクライアントの signOut()
  - 自動セッション破棄
  - リダイレクト処理

- **権限管理**
  - ADMIN: 全機能へのアクセス（usersテーブルのroleフィールド）
  - USER: 一般ユーザー機能のみ
  - Row Level Security (RLS) による細粒度アクセス制御

### 2. ユーザー管理機能（管理者のみ）

#### 2.1 ユーザー登録
- **入力項目**
  - 名前（必須）
  - メールアドレス（必須、ユニーク）
  - 初期パスワード（必須）
  - ユーザータイプ（必須）: 社員 or BP
  - 部署（任意）
  - 役職（任意）
  - 電話番号（任意）
  - 入社日/契約開始日（任意）

- **機能要件**
  - Supabase Auth での認証用アカウント作成
  - usersテーブルへの詳細情報登録
  - バリデーション実装
  - 重複メールアドレスチェック
  - 初期パスワード自動生成オプション
  - 登録完了時のメール通知（Supabase標準機能）

#### 2.2 ユーザー一覧・検索
- **表示項目**
  - 名前、メールアドレス、ユーザータイプ、部署、役職、ステータス
- **機能**
  - 名前・メールアドレスでの検索
  - ユーザータイプでのフィルタリング
  - ステータス（アクティブ/非アクティブ）でのフィルタリング
  - ページネーション

#### 2.3 ユーザー編集
- **編集可能項目**
  - 全プロフィール情報
  - ユーザータイプ変更
  - ステータス変更（アクティブ/非アクティブ）

#### 2.4 ユーザー削除
- **機能**
  - 論理削除（isActive = false）
  - 削除確認ダイアログ
  - 削除ログの記録

### 3. プロフィール管理機能

#### 3.1 プロフィール表示
- **表示項目**
  - 基本情報（名前、メールアドレス、ユーザータイプ）
  - 詳細情報（部署、役職、電話番号、入社日）
  - プロフィール画像

#### 3.2 プロフィール編集（一般ユーザー）
- **編集可能項目**
  - 名前
  - 電話番号
  - プロフィール画像
- **編集不可項目**
  - メールアドレス
  - ユーザータイプ
  - 部署、役職（管理者のみ編集可能）

### 4. 社員一覧機能
- **表示内容**
  - アクティブなユーザーのみ表示
  - 名前、部署、役職、ユーザータイプ
  - プロフィール画像
- **機能**
  - 名前検索
  - 部署・ユーザータイプでのフィルタリング
  - カード形式での表示

### 5. お知らせ機能

#### 5.1 お知らせ作成（管理者のみ）
- **入力項目**
  - タイトル（必須）
  - 内容（必須、リッチテキスト対応）
  - 対象（必須）: 社員のみ / BPのみ / 全員
  - 公開設定: 下書き / 公開

- **機能**
  - Markdownサポート
  - 画像添付機能
  - プレビュー機能
  - 下書き保存

#### 5.2 お知らせ一覧表示
- **表示ロジック**
  - ユーザーのuserTypeに基づいて表示するお知らせをフィルタリング
  - 公開済みのお知らせのみ表示
  - 新着順で表示

- **表示項目**
  - タイトル
  - 作成日時
  - 作成者名
  - 未読/既読ステータス

#### 5.3 お知らせ詳細表示
- **表示内容**
  - 全内容表示
  - 作成者情報
  - 作成日時
- **機能**
  - 既読フラグの自動更新
  - 既読日時の記録

#### 5.4 既読管理（管理者のみ）
- **機能**
  - お知らせごとの既読者一覧表示
  - 既読率の表示
  - 未読者一覧表示
  - CSVエクスポート機能

## UI/UX要件

### デザインシステム
- **カラーパレット**
  - Primary: Blue系
  - Secondary: Gray系
  - Success: Green
  - Warning: Yellow
  - Error: Red

### レスポンシブデザイン
- **ブレークポイント**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### ナビゲーション
- **ヘッダー**
  - ロゴ
  - ナビゲーションメニュー
  - ユーザーメニュー（プロフィール、ログアウト）

- **サイドバー（管理者のみ）**
  - ダッシュボード
  - ユーザー管理
  - お知らせ管理

### ページ構成
```
/
├── /login                    # ログインページ
├── /dashboard               # ダッシュボード（ホーム）
├── /profile                 # プロフィール
├── /members                 # 社員一覧
├── /announcements          # お知らせ一覧
├── /announcements/[id]     # お知らせ詳細
└── /admin                  # 管理者機能
    ├── /users              # ユーザー管理
    ├── /users/new          # ユーザー新規作成
    ├── /users/[id]/edit    # ユーザー編集
    ├── /announcements      # お知らせ管理
    ├── /announcements/new  # お知らせ作成
    └── /announcements/[id]/stats # 既読状況
```

## セキュリティ要件

### 認証・認可（Supabase Auth）
- JWT トークンベース認証
- 自動セッション管理とリフレッシュ
- Row Level Security (RLS) による細粒度アクセス制御
- Supabaseの標準セキュリティ機能

### データ保護
- 入力値サニタイゼーション
- SQLインジェクション対策（SupabaseのRLSとクエリビルダー）
- ファイルアップロード制限（Supabase Storage）
- HTTPS強制通信

### アクセス制御
- RLSポリシーによる管理者機能制限
- APIルート保護（Supabase認証チェック）
- 不正アクセス監視（Supabaseログ）

## 非機能要件

### パフォーマンス
- ページ読み込み時間: < 3秒
- 画像最適化
- 静的ファイルキャッシュ

### 可用性
- 稼働率: 99%以上
- エラーハンドリング
- ログ記録

### 保守性
- コードの可読性
- テストコード作成
- ドキュメント整備

## 開発環境設定

### 必要なパッケージ
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-alert-dialog": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-button": "^0.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-form": "^0.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "lucide-react": "^0.400.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "date-fns": "^3.6.0",
    "zustand": "^4.5.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.4.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.5.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.3.0",
    "@tailwindcss/typography": "^0.5.0",
    "supabase": "^1.192.0"
  }
}
```

### 環境変数
```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Supabaseプロジェクト設定
```sql
-- 必要なENUM型を作成
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE user_type_enum AS ENUM ('EMPLOYEE', 'BP');
CREATE TYPE target_audience AS ENUM ('EMPLOYEE', 'BP', 'ALL');

-- トリガー関数（ユーザープロフィール自動作成用）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $
BEGIN
  INSERT INTO public.users (id, email, name, role, user_type)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''), 'USER', 'EMPLOYEE');
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー設定
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 現在の実装状況（2025年6月）

### ✅ 完了済み機能
- **基盤システム**
  - Next.js 15 + App Router プロジェクト構築
  - Supabase 認証・データベース設定
  - TypeScript 設定
  - Tailwind CSS + shadcn/ui コンポーネント導入
  - ESLint 設定

- **認証システム**
  - ログイン・ログアウト機能
  - ユーザー登録機能
  - パスワードリセット機能
  - セッション管理・ミドルウェア

- **レイアウト・ナビゲーション**
  - レスポンシブヘッダーコンポーネント
  - サイドバーナビゲーション（admin/user共通）
  - ダークモード・ライトモード切り替え
  - ユーザー認証状態に基づく条件表示

- **ユーザー管理（基本機能）**
  - ユーザープロフィール表示・編集
  - メンバー一覧表示（検索・フィルタリング）
  - 管理者用メンバー管理画面

- **お知らせ機能（基本機能）**
  - お知らせ一覧表示
  - お知らせ詳細表示
  - 管理者用お知らせ管理画面
  - お知らせ既読機能

- **データレイヤー**
  - Supabase クライアント設定（Client/Server/Admin/Middleware）
  - データ取得ロジックの集約（lib/data/）
  - TypeScript 型定義

### 🚧 進行中の機能
- **コンポーネント最適化**
  - 共通コンポーネントの抽象化
  - パフォーマンス最適化

### 📋 今後の実装予定

### Phase 1: 管理機能の強化
1. ユーザー新規作成・編集・削除機能
2. お知らせ作成・編集・削除機能
3. 既読状況管理・統計表示
4. バリデーション強化

### Phase 2: UI/UX改善
1. ローディング状態の改善
2. エラーハンドリングの強化
3. レスポンシブデザインの最適化
4. アクセシビリティ対応

### Phase 3: 高度な機能
1. ファイルアップロード機能
2. 通知システム
3. 検索機能の強化
4. CSVエクスポート機能

### Phase 4: 最適化・デプロイ
1. パフォーマンス最適化
2. セキュリティ監査
3. テストコード作成
4. 本番環境デプロイ

## 注意事項

- すべての機能は段階的に実装し、各Phase完了後に動作確認を行う
- セキュリティ要件は初期段階から考慮して実装する
- ユーザビリティテストを定期的に実施する
- コードレビューを必須とし、品質を担保する
- 本番環境デプロイ前に十分なテストを実施する
