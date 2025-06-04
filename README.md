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
