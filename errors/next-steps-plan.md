## Middleware エラー対応手順 - 実行計画

### 現在の状況
- エラー: `TypeError: Cannot read properties of undefined (reading 'custom')`
- 原因: NextAuth の PrismaAdapter 設定と環境変数不足
- 影響: middleware がコンパイルできず、サービスが正常起動しない

### 完了済み手順
1. ✅ auth.ts に PrismaAdapter を追加
2. ✅ Session strategy を 'database' に変更
3. ✅ 環境変数 (NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL) を設定
4. ✅ Next.js キャッシュ (.next) をクリア

### 未実行手順
5. 🔄 node_modules を削除して再インストール
   - コマンド: `cd /Users/lzr/Developments/group-member-list-dev-archive/group-member-list`
   - コマンド: `rm -rf node_modules`
   - コマンド: `npm install`
   - 目的: 依存関係の破損を修復

6. 🔄 開発サーバーを再起動
   - コマンド: `npm run dev`
   - 目的: 新しい依存関係でサーバーを起動
   - 期待結果: middleware が正常にコンパイルされる

7. 🔄 動作確認
   - ブラウザで http://localhost:3000 にアクセス
   - 確認事項:
     - middleware がエラーなくコンパイルされる
     - ページが正常に表示される
     - 認証フォームが表示される
   - 成功条件: エラーメッセージが表示されない

### 追加のトラブルシューティング (必要な場合)
- NextAuth バージョン確認: package.json で `next-auth: ^4.24.7` を確認
- Prisma スキーマ確認: NextAuth モデル (Account, Session, VerificationToken) の存在確認
- ログ確認: コンソールログで詳細なエラー情報を確認

### 実行時の注意点
- 各手順実行後に CSV チェックリストを更新
- エラーが発生したらすぐに停止して原因を調査
- 成功したら認証フローのテストを実施