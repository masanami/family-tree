# 家系図作成WEBアプリケーション 要件定義書（プロトタイプ版）

## 1. プロジェクト概要

### 1.1 目的
家族の関係性を視覚的に表現し、家系情報を管理できるスタイリッシュなWEBアプリケーションのプロトタイプを開発する。

### 1.2 背景
- 家系情報の整理・保存のニーズ
- 親族関係の視覚化による理解促進
- 家族の歴史の記録・継承

### 1.3 プロトタイプの特徴
- 認証機能なしのシンプルな構成
- バックエンドAPIとSQLiteデータベースによるデータ管理
- スタイリッシュでモダンなUI/UX
- フルスタックアプリケーションとしての実装

## 2. 機能要件

### 2.1 家系図管理機能
- **家系図の作成・編集**
  - 新規家系図の作成
  - 既存家系図の編集
  - 複数の家系図の管理

- **人物情報管理**
  - 人物の追加・編集・削除
  - 基本情報（名前、生年月日、性別、写真など）
  - 詳細情報（職業、居住地、メモなど）
  - 存命/死亡の状態管理

- **関係性定義**
  - 親子関係の設定
  - 配偶者関係の設定
  - 兄弟姉妹の自動判定
  - 養子関係の対応

### 2.2 表示・ビジュアライゼーション機能（重点機能）
- **家系図の視覚表現**
  - スタイリッシュなツリー形式での表示
  - 世代別の階層表示
  - スムーズなズーム・パン機能
  - 人物情報のエレガントなポップアップ表示
  - アニメーション効果の実装

- **表示カスタマイズ**
  - 表示する世代数の調整
  - 特定の人物を中心とした表示
  - 表示/非表示の切り替え
  - ダークモード/ライトモード対応

### 2.3 検索・フィルタリング機能
- **人物検索**
  - 名前での検索
  - 生年での絞り込み
  - 関係性での検索

## 3. 非機能要件

### 3.1 性能要件
- 100人規模の家系図でも快適に操作可能
- ページ読み込み時間：2秒以内
- レスポンシブデザイン対応
- スムーズなアニメーション（60fps）

### 3.2 ユーザビリティ要件
- 直感的でスタイリッシュなUI/UX
- ドラッグ&ドロップでの人物配置
- ツールチップによる操作ガイド
- キーボードショートカット対応

### 3.3 デザイン要件
- モダンでミニマルなデザイン
- 美しいカラーパレット
- 洗練されたタイポグラフィ
- 適切な余白とレイアウト

### 3.4 データ管理
- SQLiteデータベースでの永続化
- RESTful APIによるデータ操作
- データの自動保存機能
- データ整合性の保証
- トランザクション管理

## 4. 制約事項
- モダンブラウザ（Chrome, Firefox, Safari, Edge）対応
- モバイル端末での表示対応
- JavaScriptが有効な環境

## 5. 優先順位
1. **必須機能（プロトタイプ）**
   - バックエンドAPI実装
   - SQLiteデータベース連携
   - 家系図の作成・編集
   - 人物情報の管理
   - スタイリッシュな家系図表示

2. **重要機能**
   - 検索機能
   - 表示カスタマイズ
   - アニメーション効果

3. **将来的な拡張**
   - 認証機能
   - データインポート/エクスポート
   - 共有機能

## 6. 今後の確認事項
- 具体的なデザインイメージ
- 優先順位の最終確認
- 技術的な制約や希望
- 予算・納期の確認