# 準備
## プロジェクトのテンプレート
- https://github.com/vercel/next.js/blob/canary/examples/with-supabase

### 元々のREADME
- https://github.com/vercel/next.js/blob/canary/examples/with-supabase/README.md

## 認証・DBアクセスできるようになるまで		
- Supabaseの認証設定へ認証後のリダイレクトURLを指定	
- Supabaseでのテーブル作成・データ投入	
- Next.jsの環境変数へSupabaseとの接続設定を記載（ローカル環境用、商用環境は自動設定）	
- Next.jsのコードでSupabaseクライアントライブラリを利用してDBアクセス	

## 各環境の作成（ローカル開発環境の準備）		
### 商用環境	
- Vercelからテンプレートを指定してDeployするだけ
- ドメイン・環境変数は自動割り当て

### ローカル環境	
- 商用環境作成時にGitHubリポジトリが作成される
- GitHubリポジトリをClone後に以下を実行
- npm install
- npm run dev
- Supabaseは商用と共有

# 概要
## 1. 主要なディレクトリ：
- `app/`: Next.js 13以降のApp Routerを使用したページコンポーネントやルーティングが格納されています
- `components/`: 再利用可能なUIコンポーネントが格納されています
- `hooks/`: カスタムReactフックが格納されています
- `lib/`: ユーティリティ関数や共通のロジックが格納されています

## 2. 設定ファイル：
- `package.json`: プロジェクトの依存関係やスクリプトが定義されています
- `tsconfig.json`: TypeScriptの設定ファイル
- `next.config.ts`: Next.jsの設定ファイル
- `tailwind.config.ts`: Tailwind CSSの設定ファイル
- `postcss.config.mjs`: PostCSSの設定ファイル
- `eslint.config.mjs`: ESLintの設定ファイル

## 3. その他の重要なファイル：
- `middleware.ts`: Next.jsのミドルウェア（認証など）の設定
- `components.json`: コンポーネントの設定ファイル

## ディレクトリ詳細
### 1. `app/` ディレクトリの構造：
- `auth/`: 認証関連のページ
- `protected/`: 認証が必要な保護されたページ
- `layout.tsx`: アプリケーションの共通レイアウト
- `page.tsx`: トップページ
- `globals.css`: グローバルスタイル

### 2. `components/` ディレクトリの構造：
- `ui/`: 基本的なUIコンポーネント
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

## 特徴
### 1. **認証機能**: 
- Supabaseを使用した認証システムが実装されており、ログイン、サインアップ、パスワードリセットなどの機能があります。

### 2. **モダンな技術スタック**:
- Next.js 13以降のApp Router
- TypeScript
- Tailwind CSS
- Supabase

### 3. **UI/UX**:
- ダークモード/ライトモードの切り替え機能
- レスポンシブデザイン
- モダンなUIコンポーネント

### 4. **セキュリティ**:
- ミドルウェアによる保護されたルート
- 環境変数の適切な管理
