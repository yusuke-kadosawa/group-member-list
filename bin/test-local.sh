#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# .env.test を読み込む
set -a
source .env.test
set +a

# テスト用サービスをDocker Composeで起動
docker compose -f docker-compose.test.yml up -d --build


# appサービス（Next.js）が3000で起動するのを待つ
npx wait-on http://localhost:3000


# DBスキーマ反映・シード投入
npx prisma db push
npm run db:seed

# テスト実行
npm test
TEST_EXIT=$?

# テスト用サービスを停止
docker compose -f docker-compose.test.yml down

exit $TEST_EXIT
