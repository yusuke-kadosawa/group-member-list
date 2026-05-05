#!/bin/bash

# Node.jsバージョン指定（nvm使用時）
if [ -f .nvmrc ]; then
  nvm use
fi

# 依存関係クリーンアップ
rm -rf node_modules package-lock.json
npm cache clean --force

# prisma.config.ts一時退避
if [ -f prisma.config.ts ]; then
  mv prisma.config.ts prisma.config.ts.bak
fi

# 依存インストール
npm install

# prisma.config.ts復元
if [ -f prisma.config.ts.bak ]; then
  mv prisma.config.ts.bak prisma.config.ts
fi

# Prisma Client生成
npx prisma generate

echo "セットアップ完了！"
