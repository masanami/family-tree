# GitHub Issues 一覧表

## 🎯 概要
家系図WEBアプリケーション開発のGitHub Issues一覧（作成日：2025-06-14）

## 📋 Issues一覧

### 🏗️ インフラストラクチャ
- #25: プロジェクト基本構造 - モノレポ構造の初期設定 [priority-high]
- #44: デプロイ設定・ドキュメント作成 - デプロイ準備と文書化 [priority-low]

### 🔧 バックエンド
- #26: バックエンド初期設定 - Express.js + TypeScript環境構築 [priority-high]
- #27: データベース環境構築 - SQLite + Prisma設定 [priority-high]
- #28: API基本構造実装 - APIの基本構造とミドルウェア設定 [priority-high]
- #29: 家系図APIエンドポイント実装 - FamilyTree CRUDエンドポイント [priority-high]
- #30: 人物APIエンドポイント実装 - Person CRUDエンドポイント [priority-high]
- #31: 関係性APIエンドポイント実装 - Relationship CRUDエンドポイント [priority-high]
- #32: バックエンド単体テスト実装 - Jest + Supertestによるテスト [priority-medium]

### 🎨 フロントエンド
- #33: フロントエンド初期設定 - React + Vite + TypeScript環境構築 [priority-high]
- #34: UIコンポーネント基盤構築 - 基本的なUIコンポーネントライブラリ [priority-high]
- #35: 状態管理とAPI通信層実装 - Zustand + Axios設定 [priority-high]
- #36: 家系図管理画面実装 - 家系図一覧・作成・編集画面 [priority-high]
- #37: 人物管理機能実装 - 人物の追加・編集・削除機能 [priority-high]
- #38: 家系図ビジュアライゼーション実装 - React Flowによる家系図表示 [priority-high]
- #39: 関係性管理機能実装 - 人物間の関係性定義UI [priority-medium]
- #40: 検索・フィルタリング機能実装 - 人物検索とフィルタリング [priority-medium]
- #41: フロントエンド単体テスト実装 - Vitest + React Testing Library [priority-medium]

### 🔗 統合・最適化
- #42: フロントエンド・バックエンド統合 - API接続と動作確認 [priority-high]
- #43: パフォーマンス最適化 - アプリケーション全体の最適化 [priority-medium]

### 🧪 E2Eテスト
- #45: E2Eテスト環境構築 - Playwrightセットアップ [priority-high]
- #46: E2Eテストシナリオ設計 - 主要ユーザーフロー [priority-high]
- #47: 家系図管理E2Eテスト実装 [priority-medium]
- #48: 人物・関係性管理E2Eテスト実装 [priority-medium]
- #49: E2Eテスト実行・修正 [priority-medium]

## 📊 統計
- 総Issue数: 25
- Priority High: 15
- Priority Medium: 9
- Priority Low: 1

## 🔄 依存関係の概要
1. **基盤構築フェーズ**: #25 → #26, #33
2. **バックエンド開発**: #26 → #27 → #28 → #29, #30, #31
3. **フロントエンド開発**: #33 → #34 → #35 → #36, #37, #38
4. **統合フェーズ**: バックエンド・フロントエンド完了 → #42
5. **テストフェーズ**: 各機能実装 → #32, #41, #45-49