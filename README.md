# Family Tree Visualization Module

Issue #4のビジュアライゼーション・外部連携機能実装が完了しました。

## 実装機能

### 1. D3.jsを使用した家系図ビジュアライゼーション
- 階層的な家系図の表示
- ズーム機能対応
- アニメーション効果
- インタラクティブなツールチップ表示

### 2. 高度なカスタマイズオプション
- カラースキーム（default, vintage, modern, custom）
- 写真表示機能
- 生年月日・没年月日の表示
- 職業・居住地情報の表示
- ノードサイズ・間隔の調整

### 3. エクスポート機能
- SVG形式でのエクスポート
- PNG形式でのエクスポート（html2canvas使用）
- PDF形式でのエクスポート（jsPDF使用）

### 4. TypeScriptサポート
- 完全な型定義
- インターフェース定義によるデータ構造の明確化

## 使用方法

```typescript
import { FamilyTreeVisualization } from './visualization';

// ビジュアライゼーションの初期化
const visualization = new FamilyTreeVisualization('container-id', {
  width: 1200,
  height: 800,
  colorScheme: 'modern',
  showPhotos: true,
  showDates: true,
  showOccupation: true,
  zoomEnabled: true
});

// データの読み込み
visualization.loadData(familyMembers);

// エクスポート
await visualization.exportAsPNG('family-tree.png');
await visualization.exportAsPDF('family-tree.pdf');
visualization.exportAsSVG('family-tree.svg');
```

## テスト実行

```bash
npm test
npm test:coverage
```

## ビルド

```bash
npm run build
```

## 今後の拡張案

1. より複雑な家族関係の表現（養子、再婚など）
2. タイムライン表示機能
3. 検索・フィルタリング機能
4. データインポート機能（CSV、JSON）
5. 3D表示オプション