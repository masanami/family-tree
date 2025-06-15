# Family Tree Application

家族の系譜を管理・可視化するフルスタックWebアプリケーション

![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)
![React](https://img.shields.io/badge/React-v19.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌟 概要

Family Tree Applicationは、家族の系譜を直感的に管理・可視化するためのモダンなWebアプリケーションです。ドラッグ&ドロップによる関係性の設定、高度な検索・フィルタリング機能、美しいビジュアライゼーションを提供します。

### 主な機能

- 👥 **家族メンバー管理**: 個人情報の登録・編集・削除
- 🔗 **関係性管理**: ドラッグ&ドロップで直感的な関係設定
- 🔍 **高度な検索**: リアルタイム検索と7種類のフィルター
- 📊 **家系図可視化**: インタラクティブな家系図表示
- 🎨 **レスポンシブデザイン**: モバイル・タブレット対応
- ♿ **アクセシビリティ**: WCAG 2.1 Level AA準拠

## 🚀 クイックスタート

### 前提条件

- Node.js v20.x以上
- npm v10.x以上
- PostgreSQL v15以上（本番環境のみ。開発環境ではSQLiteを使用）

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/masanami/family-tree.git
cd family-tree

# フロントエンドの依存関係のインストール
cd frontend && npm install
cd ..

# バックエンドの依存関係のインストール
cd backend && npm install
cd ..

# データベースの初期化（SQLiteを使用）
cd backend
DATABASE_URL="file:./dev.db" npm run prisma:migrate
# マイグレーション名を聞かれたら「init」と入力してください

# シードデータの投入
DATABASE_URL="file:./dev.db" npm run seed
cd ..

# 開発サーバーの起動
# ターミナル1: バックエンドサーバー
cd backend && DATABASE_URL="file:./dev.db" npm run dev

# ターミナル2: フロントエンドサーバー
cd frontend && npm run dev
```

開発サーバーが起動したら、ブラウザで http://localhost:5173 にアクセスしてください。
バックエンドAPIは http://localhost:4000 で動作します。

## 📁 プロジェクト構成

```
family-tree/
├── frontend/               # Reactフロントエンド
│   ├── src/
│   │   ├── components/    # UIコンポーネント
│   │   ├── hooks/         # カスタムフック
│   │   ├── pages/         # ページコンポーネント
│   │   ├── services/      # APIサービス
│   │   ├── stores/        # 状態管理（Zustand）
│   │   ├── types/         # TypeScript型定義
│   │   └── utils/         # ユーティリティ関数
│   └── tests/             # テストファイル
├── backend/               # Express.js バックエンド
│   ├── src/
│   │   ├── controllers/   # コントローラー
│   │   ├── models/        # データベースモデル
│   │   ├── routes/        # APIルート
│   │   ├── services/      # ビジネスロジック
│   │   └── utils/         # ユーティリティ
│   └── tests/             # テストファイル
├── database/              # データベース関連
│   ├── migrations/        # マイグレーション
│   └── seeds/             # シードデータ
├── e2e-tests/            # E2Eテスト
└── docs/                 # ドキュメント
```

## 🛠️ 技術スタック

### フロントエンド
- **React 19.1**: UIライブラリ
- **TypeScript 5.8**: 型安全性
- **Vite**: 高速ビルドツール
- **Tailwind CSS**: スタイリング
- **Zustand**: 状態管理
- **React Flow**: 家系図可視化
- **Vitest**: テストフレームワーク

### バックエンド
- **Node.js**: ランタイム
- **Express.js**: Webフレームワーク
- **TypeScript**: 型安全性
- **SQLite**: データベース（開発環境）
- **Prisma**: ORM
- **Jest**: テストフレームワーク

### インフラ・ツール
- **Docker**: コンテナ化
- **GitHub Actions**: CI/CD
- **ESLint/Prettier**: コード品質
- **Playwright**: E2Eテスト

## 🔧 環境変数

開発環境では環境変数をコマンドライン引数で設定します。本番環境では`.env`ファイルを作成してください：

### 開発環境（SQLite使用）
```bash
# バックエンドディレクトリで以下のコマンドを使用
DATABASE_URL="file:./dev.db" npm run dev
DATABASE_URL="file:./dev.db" npm run prisma:migrate
DATABASE_URL="file:./dev.db" npm run seed
```

### 本番環境（PostgreSQL使用時）
`backend/.env`ファイルを作成：

```bash
# データベース設定
DATABASE_URL=postgresql://user:password@localhost:5432/family_tree

# API設定
PORT=4000
NODE_ENV=production

# その他
LOG_LEVEL=info
```

## 📝 開発ガイド

### 開発サーバーの起動

```bash
# バックエンドサーバーの起動（ターミナル1）
cd backend
DATABASE_URL="file:./dev.db" npm run dev

# フロントエンドサーバーの起動（ターミナル2）
cd frontend
npm run dev
```

### テストの実行

```bash
# 全てのテストを実行
npm test

# ユニットテストのみ
npm run test:unit

# 統合テストのみ
npm run test:integration

# E2Eテストのみ
npm run test:e2e

# カバレッジレポート
npm run test:coverage
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果の確認
npm run preview
```

### コード品質

```bash
# Lintチェック
npm run lint

# Lintエラーの自動修正
npm run lint:fix

# 型チェック
npm run type-check

# フォーマット
npm run format
```

## 🚢 デプロイ

### Docker を使用したデプロイ

```bash
# Dockerイメージのビルド
docker build -t family-tree .

# コンテナの起動
docker run -p 8000:8000 -p 5173:5173 family-tree
```

### 本番環境へのデプロイ

1. 環境変数を本番用に設定
2. データベースマイグレーションを実行
3. アプリケーションをビルド
4. プロセスマネージャー（PM2等）で起動

詳細は[デプロイガイド](./docs/deployment.md)を参照してください。

## 📚 API ドキュメント

APIの詳細なドキュメントは[APIドキュメント](./docs/api.md)を参照してください。

### 主なエンドポイント

- `GET /health` - ヘルスチェック（http://localhost:4000/health）
- `GET /api/persons` - 人物一覧取得
- `POST /api/persons` - 人物作成
- `GET /api/relationships` - 関係性一覧取得
- `POST /api/relationships` - 関係性作成
- `GET /api/family-trees` - 家系図一覧取得
- `GET /api/search/persons` - 人物検索

## 🧪 テスト戦略

本プロジェクトはTDD（テスト駆動開発）で構築されています：

- **単体テスト**: 個々のコンポーネント・関数のテスト
- **統合テスト**: API・データベース連携のテスト
- **E2Eテスト**: ユーザーシナリオのテスト

テストカバレッジ目標: 80%以上

## 🤝 コントリビューション

コントリビューションを歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

詳細は[コントリビューションガイド](./CONTRIBUTING.md)を参照してください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](./LICENSE)ファイルを参照してください。

## 👥 開発チーム

- **engineer-1**: UIコンポーネント・フロントエンド基盤
- **engineer-2**: 状態管理・検索機能・ドキュメント
- **engineer-3**: バックエンドAPI・データベース設計
- **qa-agent**: テスト戦略・品質保証

## 📞 サポート

問題や質問がある場合は、[Issues](https://github.com/masanami/family-tree/issues)でお知らせください。

---

Made with ❤️ by Family Tree Development Team