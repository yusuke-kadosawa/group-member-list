#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# .env.test を読み込む
set -a
source .env.test
set +a

# テスト用サービスをDocker Composeで起動
docker compose -f docker-compose.test.yml up -d --build

echo "サービス起動待ち..."
sleep 15

# テスト実行
npm test
TEST_EXIT=$?

# テスト用サービスを停止
docker compose -f docker-compose.test.yml down

exit $TEST_EXIT
