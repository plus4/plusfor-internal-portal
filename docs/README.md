# ドキュメント一覧

このディレクトリには、プロジェクトの各種ドキュメントが格納されています。

## 環境構築ガイド

### 📝 作成済み

- [ローカル Next.js + 本番 Supabase 環境](./setup-local-nextjs-prod-supabase.md)
  - ローカル PC で Next.js を動かし、本番の Supabase に接続する構成
  - 本番データを参照するため、取り扱いには注意が必要

### 📋 作成予定

- **ローカル Next.js + ローカル Supabase 環境 with Docker**

  - Docker Composeを使用してローカルにSupabaseを構築
  - 本番環境から完全に独立した開発環境
  - データベースマイグレーションの管理が可能
  - チーム間で環境を統一しやすい

- **ローカル Next.js + ローカル Supabase 環境 with DevContainer**

  - VS Code Dev Containerを使用した開発環境
  - 開発環境の自動セットアップ
  - 拡張機能や設定も含めた完全な開発環境の共有
  - GitHub Codespacesでも利用可能

- **個人用 Supabase + Vercel 環境**
  - 個人の Supabase プロジェクトを作成
  - Vercel にデプロイして独自の検証環境を構築
  - 本番環境に影響を与えずに機能検証が可能

## その他のドキュメント（予定）

- API 仕様書
- デプロイメントガイド
- トラブルシューティングガイド
- セキュリティガイドライン
