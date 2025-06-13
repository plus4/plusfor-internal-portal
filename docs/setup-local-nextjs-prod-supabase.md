# 開発環境構築手順（node.js on ローカル PC + 本番 Supabase）

ローカル PC にインストールした node.js で Next.js アプリケーションをホストし、本番 Supabase に接続させてアプリケーションを動かす手順です。
本番 Supabase を参照しているため注意が必要です。

## 前提条件

- Node.js（v18 以上）がインストールされていること
- GitHub リポジトリへのアクセス権があること
- 本番 Supabase プロジェクトの接続情報を持っていること

## 手順

### 1. リポジトリのクローン

```bash
git clone [リポジトリURL]
cd plusfor-internal-portal-sub
```

### 2. 依存関係のインストール

```bash
npm install
```

これにより、package.json に記載されているすべての依存関係がインストールされます。

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定します：

```bash
# .env.localファイルを作成
touch .env.local
```

以下の内容を`.env.local`に記載します：

```
NEXT_PUBLIC_SUPABASE_URL=https://[プロジェクトID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[匿名キー]
SUPABASE_SERVICE_ROLE_KEY=[サービスロールキー]
```

#### Supabase ダッシュボードでの確認方法：

1. **Project URL**の取得

   - [Project Settings > Configuration > General](https://supabase.com/dashboard/project/myxtnmomsegbqdvbpqgk/settings/general)
   - 「Project URL」の値をコピー

2. **Anon Key（匿名キー）**の取得

   - [Project Settings > API](https://supabase.com/dashboard/project/myxtnmomsegbqdvbpqgk/settings/api)
   - 「Project API keys」セクションの「anon public」の値をコピー

3. **Service Role Key（サービスロールキー）**の取得
   - 同じく「Project API keys」セクションの「service_role secret」
   - 「Reveal」ボタンをクリックして表示される値をコピー

⚠️ **重要**: サービスロールキーは秘密情報です。絶対に公開リポジトリにコミットしないでください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

正常に起動すると、以下のような出力が表示されます：

```
   ▲ Next.js 15.3.3 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in xxxms
```

### 5. アプリケーションへのアクセス

ブラウザで http://localhost:3000 を開きます。

### 6. 動作確認

- トップページが正常に表示されることを確認
- Supabase との接続が正常であることを確認（ログイン機能など）

## 注意事項

- 本番 Supabase に接続しているため、データの操作には十分注意してください
- 環境変数ファイル（.env.local）は Git にコミットしないでください
- `.gitignore`に`.env.local`が含まれていることを確認してください

## トラブルシューティング

### 環境変数が読み込まれない場合

- `.env.local`ファイルがプロジェクトルートに存在することを確認
- 開発サーバーを再起動（Ctrl+C で停止後、`npm run dev`を再実行）

### Supabase への接続エラーが発生する場合

- 環境変数の値が正しくコピーされているか確認
- Supabase プロジェクトが稼働中であることを確認
- ネットワーク接続を確認

### ポート 3000 が使用中の場合

```bash
# 別のポートで起動
npm run dev -- -p 3001
```