# E2Eテスト仕様書

## 概要
本E2Eテストスイートは、家系図管理システムの主要機能をユーザーシナリオベースで検証します。

## テストカバレッジ

### 1. 認証機能 (01-authentication.spec.ts)
- ✅ 新規ユーザー登録フロー
- ✅ ログインフロー
- ✅ ログインエラー処理
- ✅ ログアウトフロー
- ✅ セッションタイムアウト

### 2. 人物管理機能 (02-person-management.spec.ts)
- ✅ 人物の新規登録
- ✅ 人物情報の編集
- ✅ 家族関係の設定
- ✅ 人物の検索とフィルタリング
- ✅ 人物の削除
- ✅ 一括インポート機能

### 3. ビジュアライゼーション (03-visualization.spec.ts)
- ✅ 家系図の表示
- ✅ ノードのインタラクション
- ✅ ズームとパン操作
- ✅ レイアウト切り替え
- ✅ SVG/PNG/PDFエクスポート
- ✅ フィルター機能
- ✅ 検索とハイライト

### 4. 統合テスト (04-integration.spec.ts)
- ✅ 完全な家族登録から家系図表示までのフロー
- ✅ データの一貫性とエラー処理
- ✅ 同時編集の競合解決
- ✅ 大量データのパフォーマンステスト

## テスト実行方法

```bash
# 依存関係のインストール
npm install

# 全てのE2Eテストを実行
npm run test:e2e

# UIモードでテストを実行（デバッグ用）
npm run test:e2e:ui

# 特定のテストファイルのみ実行
npx playwright test e2e/tests/01-authentication.spec.ts

# テストレポートを表示
npm run test:e2e:report
```

## 前提条件
- Node.js v18以上
- アプリケーションがlocalhost:3000で起動していること
- PostgreSQLまたは互換性のあるデータベースが設定されていること

## CI/CD統合
CI環境では以下の環境変数を設定してください：
- `CI=true`
- `DATABASE_URL`
- `JWT_SECRET`