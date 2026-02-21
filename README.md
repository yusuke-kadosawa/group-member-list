# Group Member List

Next.js で構築されたグループメンバー管理アプリケーションです。

## ドキュメント

### 開発プロセス
このプロジェクトで使用している開発プロセスのドキュメントです。他のプロジェクトでも使える汎用的なテンプレートとして公開しています。

- **[開発プロセス概要](specifications/process-overview.md)** - プロジェクト全体の流れ（1ページ版）
- **[標準開発プロセス](specifications/standard-development-process.md)** - プロジェクト計画からリリースまでの完全ガイド
- **[プロジェクト計画テンプレート](specifications/project-planning-template.md)** - プロジェクト開始時のチェックリスト

### ミドルウェア
- [ミドルウェア起動条件](specifications/middleware-activation-conditions.md) - Next.js ミドルウェアの動作条件

### 認証システム

メールベースの認証システムを実装しています。

**技術:**
- メール認証
- セッション管理（セキュアクッキー）
- トークンベース認証

詳細な仕様は内部ドキュメントを参照してください。

## 開発の始め方

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

### 3. 編集

`app/page.tsx` を編集すると、ページが自動更新されます。

## 参考リンク

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.js の機能と API
- [Next.js チュートリアル](https://nextjs.org/learn) - インタラクティブな学習コンテンツ
- [Vercel デプロイ](https://vercel.com/docs) - 本番環境へのデプロイ方法
