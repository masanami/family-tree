# 家系図作成WEBアプリケーション 技術設計書

## 1. 技術スタック選定

### 1.1 フロントエンド
- **フレームワーク**: React 18
  - コンポーネントベースの開発
  - 豊富なエコシステム
  - 高いパフォーマンス

- **状態管理**: Zustand
  - シンプルで軽量
  - TypeScript対応
  - React Hooksベース

- **UIライブラリ**: 
  - Tailwind CSS（スタイリング）
  - Framer Motion（アニメーション）
  - React Flow（家系図ビジュアライゼーション）

- **ビルドツール**: Vite
  - 高速な開発サーバー
  - 最適化されたビルド

### 1.2 バックエンド
- **フレームワーク**: Express.js (Node.js)
  - シンプルで柔軟
  - 豊富なミドルウェア
  - JavaScript/TypeScriptで統一

- **データベース**: SQLite
  - 軽量で設定不要
  - ファイルベースで扱いやすい
  - プロトタイプに最適

- **ORM**: Prisma
  - 型安全なデータベースアクセス
  - マイグレーション管理
  - 直感的なクエリAPI

### 1.3 共通技術
- **言語**: TypeScript
  - 型安全性
  - 開発効率の向上
  - エラーの早期発見

- **API仕様**: OpenAPI 3.0
  - RESTful API設計
  - 自動ドキュメント生成
  - 型定義の共有

## 2. システムアーキテクチャ

### 2.1 全体構成
```
┌─────────────────────────────────────────────────────┐
│                   クライアント (React)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   UI層      │  │  状態管理    │  │  API Client │ │
│  │ Components  │  │  (Zustand)   │  │   (Axios)   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────┬───────────────────────┘
                              │ HTTP/REST
┌─────────────────────────────┴───────────────────────┐
│                  バックエンド (Express)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Controllers │  │  Services    │  │ Middleware  │ │
│  │  (Routes)   │  │(Business Logic)│ │ (Validation)│ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                   ┌─────────────┐                   │
│                   │ Data Access │                   │
│                   │  (Prisma)   │                   │
│                   └──────┬──────┘                   │
└──────────────────────────┼──────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │   SQLite    │
                    │  Database   │
                    └─────────────┘
```

### 2.2 ディレクトリ構造
```
family-tree/
├── frontend/                 # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/      # UIコンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── stores/         # Zustand ストア
│   │   ├── services/       # API通信サービス
│   │   ├── types/          # TypeScript型定義
│   │   └── utils/          # ユーティリティ関数
│   └── package.json
│
├── backend/                 # バックエンドアプリケーション
│   ├── src/
│   │   ├── controllers/    # APIコントローラー
│   │   ├── services/       # ビジネスロジック
│   │   ├── models/         # データモデル
│   │   ├── middleware/     # Express ミドルウェア
│   │   └── utils/          # ユーティリティ関数
│   ├── prisma/
│   │   └── schema.prisma   # データベーススキーマ
│   └── package.json
│
└── shared/                  # 共有コード
    └── types/              # 共有型定義
```

## 3. データベース設計

### 3.1 ER図
```
┌─────────────────┐      ┌─────────────────┐
│     Person      │      │   Relationship  │
├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │
│ familyTreeId(FK)│      │ familyTreeId(FK)│
│ firstName       │      │ fromPersonId(FK)│
│ lastName        │      │ toPersonId (FK) │
│ birthDate       │      │ relationshipType│
│ deathDate       │      │ createdAt       │
│ gender          │      │ updatedAt       │
│ photoUrl        │      └─────────────────┘
│ occupation      │
│ location        │      ┌─────────────────┐
│ notes           │      │   FamilyTree    │
│ createdAt       │      ├─────────────────┤
│ updatedAt       │      │ id (PK)         │
└─────────────────┘      │ name            │
                         │ description     │
                         │ createdAt       │
                         │ updatedAt       │
                         └─────────────────┘
```

### 3.2 リレーション
- FamilyTree 1:N Person
- Person 1:N Relationship (from)
- Person 1:N Relationship (to)
- FamilyTree 1:N Relationship

## 4. API設計

### 4.1 エンドポイント一覧
```
# 家系図
GET    /api/family-trees          # 家系図一覧取得
POST   /api/family-trees          # 家系図作成
GET    /api/family-trees/:id      # 家系図詳細取得
PUT    /api/family-trees/:id      # 家系図更新
DELETE /api/family-trees/:id      # 家系図削除

# 人物
GET    /api/family-trees/:treeId/persons      # 人物一覧取得
POST   /api/family-trees/:treeId/persons      # 人物作成
GET    /api/persons/:id                       # 人物詳細取得
PUT    /api/persons/:id                       # 人物更新
DELETE /api/persons/:id                       # 人物削除

# 関係性
GET    /api/family-trees/:treeId/relationships # 関係性一覧取得
POST   /api/family-trees/:treeId/relationships # 関係性作成
PUT    /api/relationships/:id                  # 関係性更新
DELETE /api/relationships/:id                  # 関係性削除
```

### 4.2 データフォーマット
すべてのAPIレスポンスは以下の形式：
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## 5. セキュリティ設計
- CORS設定
- 入力値検証（バリデーション）
- SQLインジェクション対策（Prisma使用）
- XSS対策（React標準）
- エラーハンドリング

## 6. パフォーマンス最適化
- フロントエンド
  - React.memo使用によるレンダリング最適化
  - 遅延ローディング
  - バンドルサイズ最適化

- バックエンド
  - データベースインデックス
  - N+1問題の回避
  - 適切なキャッシュ戦略