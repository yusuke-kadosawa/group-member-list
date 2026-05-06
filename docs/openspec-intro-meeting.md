# openspec導入検討 議事録

## openspec導入の目的
- 仕様・要件・API定義を一元管理し、変更追跡・レビューを効率化する
- 仕様から型定義・ドキュメント等の自動生成を目指す

## 検討した仕様記述形式

### 1. OpenAPI Specification
- REST API仕様の事実上の標準。ツール・エコシステムが豊富。
- YAML/JSONで記述。型定義・ドキュメント・モック・テスト自動生成が容易。
- API設計中心。業務要件や画面仕様など非API領域は別途管理が必要。

### 2. AsyncAPI
- WebSocketやPub/Subなど非同期API向け。現状REST中心のため優先度低。

### 3. JSON Schema
- データ構造・型定義の標準。OpenAPIの一部としても利用。

### 4. Markdown/YAMLベース独自仕様
- 画面仕様・業務要件・ユースケース等を柔軟に記述可能。
- 既存の `docs/` ディレクトリ構成と親和性が高い。

### 5. OpenAPI + Markdownハイブリッド
- API仕様はOpenAPI、業務要件や画面仕様はMarkdown/YAMLで管理。

---

## 結論・推奨案
- **API仕様はOpenAPI (YAML) で管理**
  - `docs/api.yml` などに集約
  - 型定義・ドキュメント自動生成を活用
- **業務要件・画面仕様・ユースケース等はMarkdown/YAMLで管理**
  - 既存の `docs/` 配下の各種md/ymlファイルを活用
  - 必要に応じてOpenAPIと他仕様の連携も検討

---
