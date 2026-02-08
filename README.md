This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication Design Overview

### Current Implementation
- **Email Service:** 部分実装
  - 現在、開発用に `console.log` を使用して認証メールの URL を出力しています。
  - 本番環境では SendGrid などのメールサービスを導入する必要があります。
- **Email Template:** 実装済み
  - HTML テンプレートを使用して認証メールを送信します。
- **TypeScript Types Consideration:** 実装済み
  - `@types/nodemailer` を導入済みで、型安全性を確保しています。
- **Package JSON Consideration:** 実装済み
  - 必要な依存関係が `package.json` に正しく記載されています。

### 未実装の部分
- **環境変数の設定:** `.env.local` に必要な変数（例: `SENDGRID_API_KEY`）を追加する必要があります。
- **開発環境でのテスト:** `npm run dev:mail` を使用して MailDev を起動し、統合テストを実施する必要があります。
- **本番環境設定:** SendGrid API キーの設定と本番環境での動作確認が必要です。

### API Endpoints
- **`/api/login`**
  - **実装状況:** 実装済み
  - **説明:**
    - ユーザーがメールアドレスを送信すると、認証トークンを生成し、メールで送信します。
    - 古いトークンは削除され、新しいトークンのみが有効になります。
- **`/api/auth/verify`**
  - **実装状況:** 実装済み
  - **説明:**
    - トークンを検証し、セッションを作成します。
    - トークンが無効または期限切れの場合、エラーを返します。

### Pages
- **`/auth/verify`**
  - **実装状況:** 実装済み
  - **説明:**
    - トークンを検証し、成功した場合は `/home` にリダイレクトします。
    - トークンが無効または期限切れの場合、エラーメッセージを表示します。
- **`/auth/email-sent`**
  - **実装状況:** 実装済み
  - **説明:**
    - 認証メール送信後に表示される確認ページです。

### Security
- **セッション管理:** HttpOnly クッキーを使用してセッションを管理します。
- **トークンの有効期限:** 認証トークンの有効期限は 1 時間です。
