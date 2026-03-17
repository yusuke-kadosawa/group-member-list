#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# .env.test を読み込む
set -a
source .env.test
set +a

# テストDBにスキーマ反映
npx prisma db push

# ビルドが未実施なら実施
if [ ! -d ".next" ]; then
  NODE_ENV=production npm run build
fi

# 既存テスト用サーバー・maildev停止
lsof -ti:${PORT:-3001} | xargs kill -9 2>/dev/null || true
lsof -ti:${MAILDEV_WEB_PORT:-1081} | xargs kill -9 2>/dev/null || true

# テスト用maildev起動（バックグラウンド）
maildev --smtp ${MAILDEV_SMTP_PORT:-1026} --web ${MAILDEV_WEB_PORT:-1081} &
MAILDEV_PID=$!
echo "maildev起動中... (PID: $MAILDEV_PID, SMTP:${MAILDEV_SMTP_PORT:-1026}, Web:${MAILDEV_WEB_PORT:-1081})"

# テスト用サーバー起動（バックグラウンド）
NODE_ENV=production PORT=${PORT:-3001} npm run start &
SERVER_PID=$!
echo "サーバー起動中... (PID: $SERVER_PID, PORT:${PORT:-3001})"
sleep 10

# テスト実行
npm test
TEST_EXIT=$?

# サーバー・maildev停止
kill $SERVER_PID 2>/dev/null || true
kill $MAILDEV_PID 2>/dev/null || true

exit $TEST_EXIT
