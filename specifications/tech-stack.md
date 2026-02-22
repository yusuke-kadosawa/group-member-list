# 技術スタック

## 採用技術

- **フロントエンド**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Headless UI
- **バックエンド**: Next.js API Routes, Prisma ORM
- **データベース**: PostgreSQL
- **デプロイ**: Vercel (Serverless)
- **認証**: メールベース認証（独自実装、セッションはHttpOnly Cookie）
- **開発ツール**: Git, GitHub, npm, ESLint, Prettier
- **テスト**: Jest, Playwright

## 開発環境のセットアップ

### 前提条件

- Node.js 18以上
- PostgreSQL 14以上
- Git

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd group-member-list
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、必要な環境変数を設定：

```bash
# データベース接続
DATABASE_URL="postgresql://user:password@localhost:5432/group_member_list"

# アプリケーション設定
APP_URL="http://localhost:3000"  # 認証メールのリンク生成に使用

# メール送信（開発環境）
EMAIL_FROM="noreply@example.com"
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"
```

### 4. データベースのセットアップ

```bash
# データベース作成
createdb group_member_list

# マイグレーション実行
npx prisma migrate dev

# Prisma Client生成
npx prisma generate
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

### 6. メール送信のテスト（開発環境）

開発環境ではMailDevを使用してメールをテストします：

```bash
# MailDevの起動
maildev
```

MailDevのWebインターフェース: [http://localhost:1080](http://localhost:1080)

## 主要なコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番モードで起動
npm start

# リンターチェック
npm run lint

# フォーマット
npm run format

# テスト実行
npm test

# E2Eテスト
npm run test:e2e

# Prisma Studio（データベースGUI）
npx prisma studio
```
