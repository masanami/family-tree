# Family Tree Frontend

React + TypeScript + Vite + Tailwind CSS を使用したファミリーツリーアプリケーションのフロントエンド。

## 技術スタック

- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速な開発サーバーとビルドツール
- **Tailwind CSS** - ユーティリティファーストのCSSフレームワーク
- **ESLint** - コード品質管理

## ディレクトリ構造

```
src/
├── components/   # 再利用可能なUIコンポーネント
├── pages/       # ページコンポーネント
├── hooks/       # カスタムReactフック
├── services/    # APIクライアントとサービス
├── types/       # TypeScript型定義
└── utils/       # ユーティリティ関数
```

## 開発

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# リント
npm run lint
```

## 環境変数

`.env.local` ファイルを作成して環境変数を設定：

```
VITE_API_URL=http://localhost:8000
```