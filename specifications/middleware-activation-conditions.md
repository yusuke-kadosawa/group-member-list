# Middleware 有効化の条件

## 概要
NextAuth middleware を有効化しても不具合が発生しないための条件をまとめます。

## 前提条件
- Next.js 15.x
- NextAuth v4.x
- Prisma ORM
- PostgreSQL データベース

## 必須条件

### 1. NextAuth の基本設定
- `app/auth.ts` で NextAuth が正しく設定されている
- 以下の環境変数が `.env.local` に設定されている：
  - `NEXTAUTH_SECRET`: ランダムな秘密鍵（本番環境では強力なものを使用）
  - `NEXTAUTH_URL`: アプリケーションのURL（例: `http://localhost:3000`）

### 2. 認証プロバイダの設定
- 少なくとも1つの認証プロバイダが設定されている
- **メール認証の場合**、以下の環境変数が正しく設定されている：
  - `EMAIL_SERVER_HOST`: SMTPサーバーホスト（例: `smtp.gmail.com`）
  - `EMAIL_SERVER_PORT`: SMTPポート（例: `587`）
  - `EMAIL_SERVER_USER`: SMTPユーザー名
  - `EMAIL_SERVER_PASSWORD`: SMTPパスワード
  - `EMAIL_FROM`: 送信元メールアドレス

**注意**: ダミー値（`your-email@gmail.com` など）では不具合が発生します。

### 3. データベースアダプターの設定
- `@next-auth/prisma-adapter` がインストールされている
- `auth.ts` で `PrismaAdapter(prisma)` が設定されている
- Prisma スキーマに以下の NextAuth モデルが存在する：
  - `Account`
  - `Session`
  - `VerificationToken`
  - `User` （カスタムフィールドを含む）

### 4. セッション設定
- `auth.ts` で `session.strategy` が `"database"` に設定されている
- `maxAge` が適切に設定されている（例: 30日）

### 5. ルートとページの存在
- リダイレクト先のページが存在する（例: `app/home/page.tsx`）
- 認証ページが存在する：
  - `app/auth/signin/page.tsx`
  - `app/auth/error/page.tsx` （オプション）

### 6. Middleware 設定
- `middleware.ts` が以下の条件を満たす：
  - `auth()` 関数が正しくインポートされている
  - リダイレクト先のパスが正しい（例: `/home`）
  - `matcher` が適切に設定されている

## 確認手順

### 1. 環境変数の確認
```bash
# .env.local の内容を確認
cat .env.local
```

### 2. NextAuth 設定の確認
```typescript
// app/auth.ts の主要部分
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Email({...})],
  session: { strategy: "database" },
  // ...
})
```

### 3. Prisma スキーマの確認
```bash
# NextAuth モデルが存在するか確認
npx prisma db push --preview-feature
```

### 4. 開発サーバーの起動テスト
```bash
npm run dev
# ブラウザで localhost:3000 にアクセス
# middleware が正常にコンパイルされるか確認
```

## トラブルシューティング

### エラー: "Cannot read properties of undefined (reading 'custom')"
- 原因: 認証プロバイダの設定が不完全
- 解決: メールサーバーの環境変数を正しく設定

### エラー: "ENOENT: no such file or directory, open 'middleware.js'"
- 原因: .next キャッシュが古い
- 解決: `rm -rf .next` でキャッシュをクリア

### エラー: PrismaAdapter 関連
- 原因: Prisma スキーマが不完全
- 解決: NextAuth モデルを追加

## 注意事項
- 開発環境では `sendVerificationRequest` をカスタマイズしてコンソールログ出力可能
- 本番環境では必ず実際のメールサーバー設定を使用
- NextAuth v4 と Next.js 15 の互換性を確認