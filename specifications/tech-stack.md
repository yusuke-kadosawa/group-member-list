# 技術スタック

## 採用技術

### フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: React Server Components + Client Components

### バックエンド
- **ランタイム**: Next.js API Routes
- **言語**: TypeScript
- **ORM**: Prisma

### データベース
- **開発環境**: PostgreSQL (local)
- **本番環境**: Vercel Postgres

### デプロイメント
- **プラットフォーム**: Vercel
- **ドメイン**: group-member-list.vercel.app
- **デプロイ戦略**:
  - **Production環境**:
    - ブランチ: `main`
    - URL: `group-member-list.vercel.app`
    - トリガー: mainブランチへのPush後、手動承認
    - 承認: Vercel Production Deployment Approval必須
  - **Preview環境**:
    - 説明: Pull Request / feature branch毎に自動生成
    - URL: PR毎に一意のURL自動生成
    - トリガー: Pull Request作成時
  - **ワークフロー**:
    1. Feature branchで開発
    2. Pull Request作成（Preview環境自動生成）
    3. Preview環境で動作確認・レビュー
    4. PRマージ（mainブランチへPush、Production環境デプロイ待機）
    5. Vercelで手動承認→Production環境へデプロイ
  - **承認**:
    - Pull Requestレビュー必須（GitHub）
    - Production Deployment Approval必須（Vercel）

### メール送信
- **開発環境**:
  - サービス: MailDev
  - ホスト: localhost
  - ポート: 1025
  - Webインターフェース: http://localhost:1080
- **本番環境**:
  - ステータス: 未決定（サービス選定が必要）
  - 候補:
    - **Resend**: 開発者フレンドリーAPI、無料枠あり
    - **SendGrid**: 実績豊富、充実した機能
    - **Amazon SES**: 低コスト、AWS統合
  - 要件:
    - 信頼性の高い配送
    - SPF/DKIM/DMARC対応
    - 配送ステータス追跡
    - リトライ機能

### 開発ツール
- **バージョン管理**: Git, GitHub
- **パッケージマネージャー**: npm
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **メールテスト**: MailDev
- **テスティング**: Jest, Playwright

## アーキテクチャ

- **パターン**: Server-Side Rendering (SSR) + API Routes
- **認証**: メールベースマジックリンク（独自実装）
- **セッション管理**: Database (Session table)
- **状態管理**: React Server Components（サーバー側状態管理）
