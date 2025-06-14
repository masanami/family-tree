# TDD実装戦略・単体テスト設計方針

## 1. テスト駆動開発（TDD）戦略

### 1.1 基本方針
- **Red-Green-Refactor サイクル**の徹底
  1. Red: 失敗するテストを書く
  2. Green: テストを通す最小限のコードを書く
  3. Refactor: コードを改善する

### 1.2 テストファースト原則
- 実装前に必ずテストを書く
- テストが仕様書の役割を果たす
- テストがドキュメントとして機能

## 2. テストカバレッジ基準

### 2.1 目標カバレッジ
- **全体**: 80%以上
- **ビジネスロジック**: 90%以上
- **APIエンドポイント**: 100%
- **ユーティリティ関数**: 100%

### 2.2 除外対象
- 設定ファイル
- 型定義ファイル
- 自動生成コード

## 3. バックエンド単体テスト設計

### 3.1 テスト対象と方針

#### コントローラーテスト
```typescript
// 例: FamilyTreeController
describe('FamilyTreeController', () => {
  // HTTPステータスコードの確認
  // レスポンス形式の検証
  // エラーハンドリングの確認
  // 入力値検証の確認
});
```

#### サービステスト
```typescript
// 例: FamilyTreeService
describe('FamilyTreeService', () => {
  // ビジネスロジックの検証
  // データベース操作のモック
  // 例外処理の確認
  // トランザクション処理の検証
});
```

#### バリデーションテスト
```typescript
// 例: PersonValidator
describe('PersonValidator', () => {
  // 正常系: 有効な入力値
  // 異常系: 必須項目の欠落
  // 境界値: 日付の妥当性
  // 形式チェック: メールアドレス等
});
```

### 3.2 モック・スタブ利用方針
- **データベース**: Prismaのモッククライアント使用
- **外部API**: MSWによるモック
- **ファイルシステム**: メモリ内での操作

## 4. フロントエンド単体テスト設計

### 4.1 コンポーネントテスト
```typescript
// 例: PersonCard Component
describe('PersonCard', () => {
  // レンダリングテスト
  // プロパティの表示確認
  // イベントハンドラーの動作確認
  // 条件付きレンダリングの検証
});
```

### 4.2 カスタムフックテスト
```typescript
// 例: useFamilyTree Hook
describe('useFamilyTree', () => {
  // 状態管理の検証
  // API呼び出しの確認
  // エラー状態の処理
  // ローディング状態の管理
});
```

### 4.3 ストアテスト（Zustand）
```typescript
// 例: FamilyTreeStore
describe('FamilyTreeStore', () => {
  // 状態の初期値確認
  // アクションの動作検証
  // 状態の更新確認
  // 副作用の検証
});
```

## 5. API仕様テスト

### 5.1 エンドポイントテスト構造
```typescript
describe('POST /api/family-trees/:treeId/persons', () => {
  describe('正常系', () => {
    it('有効なデータで人物を作成できる', async () => {
      // 201 Created
      // 作成されたデータの確認
      // レスポンス形式の検証
    });
  });

  describe('異常系', () => {
    it('必須項目が欠落している場合400エラー', async () => {
      // 400 Bad Request
      // エラーメッセージの確認
    });

    it('存在しない家系図IDの場合404エラー', async () => {
      // 404 Not Found
    });
  });

  describe('境界値', () => {
    it('生年月日が未来の場合エラー', async () => {
      // バリデーションエラー
    });
  });
});
```

## 6. テストツール選定

### 6.1 バックエンド
- **テストランナー**: Jest
- **APIテスト**: Supertest
- **モック**: jest-mock-extended
- **データベース**: Prisma Mock

### 6.2 フロントエンド
- **テストランナー**: Vitest
- **コンポーネントテスト**: React Testing Library
- **モック**: MSW (Mock Service Worker)
- **カバレッジ**: c8

## 7. CI/CD統合

### 7.1 自動テスト実行
- プルリクエスト時に全テスト実行
- カバレッジレポートの自動生成
- テスト失敗時のマージブロック

### 7.2 品質ゲート
- カバレッジ基準を下回った場合の警告
- パフォーマンステストの実行
- セキュリティテストの実施

## 8. テスト命名規則

### 8.1 テストファイル
- `*.test.ts` または `*.spec.ts`
- コンポーネント: `ComponentName.test.tsx`
- サービス: `ServiceName.test.ts`

### 8.2 テストケース命名
- 日本語での記述を推奨
- 「〜の場合、〜する」形式
- 期待される結果を明確に記述

## 9. テストデータ管理

### 9.1 フィクスチャ
```typescript
// fixtures/person.ts
export const validPerson = {
  firstName: '太郎',
  lastName: '山田',
  gender: 'male',
  birthDate: '1990-01-01'
};

export const invalidPerson = {
  firstName: '', // 必須項目欠落
  lastName: '山田'
};
```

### 9.2 ファクトリー関数
```typescript
// factories/familyTree.ts
export const createFamilyTree = (overrides = {}) => ({
  name: 'テスト家系図',
  description: 'テスト用の家系図',
  ...overrides
});
```

## 10. 実装の進め方

### 10.1 機能単位でのTDD
1. API仕様からテストケース作成
2. エンドポイントテスト作成（Red）
3. コントローラー実装（Green）
4. サービステスト作成（Red）
5. サービス実装（Green）
6. リファクタリング（Refactor）

### 10.2 統合テストの追加
- 主要なユーザーシナリオをカバー
- E2Eテストは最小限に留める
- APIとUIの結合部分を重点的にテスト