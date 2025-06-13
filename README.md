# 社内ポータル (Internal Portal)

社内向けポータルサイトの Next.js アプリケーションです。

## 🚀 開発環境構築

プロジェクトの環境構築には、以下のパターンがあります：

### 📖 環境構築ガイド

- **[ローカル Next.js + 本番 Supabase 環境](./docs/setup-local-nextjs-prod-supabase.md)** - 本番 Supabase に接続してローカル開発を行う場合
- ローカル Next.js + ローカル Supabase 環境 with Docker - _(準備中)_
- ローカル Next.js + ローカル Supabase 環境 with DevContainer - _(準備中)_
- 個人用 Supabase + Vercel 環境 - _(準備中)_

## 📋 クイックスタート

```bash
# リポジトリのクローン
git clone [リポジトリURL]
cd plusfor-internal-portal-sub

# 依存関係のインストール
npm install

# 環境変数の設定（詳細は開発環境構築ガイドを参照）
cp .env.example .env.local
# .env.localを編集して必要な値を設定

# 開発サーバーの起動
npm run dev
```

## 📚 ドキュメント

### 環境構築

- [ローカル Next.js + 本番 Supabase](./docs/setup-local-nextjs-prod-supabase.md) - 本番環境の Supabase を使用したローカル開発
- ローカル Next.js + ローカル Supabase with Docker - _(準備中)_
- ローカル Next.js + ローカル Supabase with DevContainer - _(準備中)_
- 個人用 Supabase + Vercel - _(準備中)_

### その他のドキュメント

- [REQUIREMENTS.md](./REQUIREMENTS.md) - システム要件定義書
- [CLAUDE.md](./CLAUDE.md) - Claude Code 用の開発ガイドライン

## 🛠️ 技術スタック

- **Framework**: Next.js 15+ (App Router)
- **Database/Auth**: Supabase (PostgreSQL + 認証)
- **UI**: Tailwind CSS + shadcn/ui
- **言語**: TypeScript
- **ホスティング**: Vercel

## 📁 プロジェクト構成

### 主要なディレクトリ

- `app/`: Next.js 13 以降の App Router を使用したページコンポーネントやルーティングが格納されています
- `components/`: 再利用可能な UI コンポーネントが格納されています
- `hooks/`: カスタム React フックが格納されています
- `lib/`: ユーティリティ関数や共通のロジックが格納されています

### 設定ファイル

- `package.json`: プロジェクトの依存関係やスクリプトが定義されています
- `tsconfig.json`: TypeScript の設定ファイル
- `next.config.ts`: Next.js の設定ファイル
- `tailwind.config.ts`: Tailwind CSS の設定ファイル
- `postcss.config.mjs`: PostCSS の設定ファイル
- `eslint.config.mjs`: ESLint の設定ファイル

### その他の重要なファイル

- `middleware.ts`: Next.js のミドルウェア（認証など）の設定
- `components.json`: コンポーネントの設定ファイル

### ディレクトリ詳細

#### `app/` ディレクトリの構造

- `auth/`: 認証関連のページ
- `protected/`: 認証が必要な保護されたページ
- `layout.tsx`: アプリケーションの共通レイアウト
- `page.tsx`: トップページ
- `globals.css`: グローバルスタイル

#### `components/` ディレクトリの構造

- `ui/`: 基本的な UI コンポーネント
- 認証関連コンポーネント：
- `auth-button.tsx`
- `login-form.tsx`
- `sign-up-form.tsx`
- `forgot-password-form.tsx`
- `update-password-form.tsx`
- その他の機能コンポーネント：
- `current-user-avatar.tsx`
- `theme-switcher.tsx`
- `hero.tsx`
- `deploy-button.tsx`

## 🌟 特徴

### 認証機能

- Supabase を使用した認証システムが実装されており、ログイン、サインアップ、パスワードリセットなどの機能があります。

### モダンな技術スタック

- Next.js 13 以降の App Router
- TypeScript
- Tailwind CSS
- Supabase

### UI/UX

- ダークモード/ライトモードの切り替え機能
- レスポンシブデザイン
- モダンな UI コンポーネント

### セキュリティ

- ミドルウェアによる保護されたルート
- 環境変数の適切な管理
