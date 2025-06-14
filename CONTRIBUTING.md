# Contributing to Family Tree Application

Family Tree Applicationへの貢献を検討いただきありがとうございます！このドキュメントでは、プロジェクトへの貢献方法について説明します。

## 目次

1. [行動規範](#行動規範)
2. [貢献の方法](#貢献の方法)
3. [開発環境のセットアップ](#開発環境のセットアップ)
4. [開発フロー](#開発フロー)
5. [コーディング規約](#コーディング規約)
6. [コミットメッセージ](#コミットメッセージ)
7. [プルリクエスト](#プルリクエスト)
8. [テスト](#テスト)
9. [ドキュメント](#ドキュメント)

## 行動規範

このプロジェクトでは、すべての貢献者が以下の行動規範に従うことを期待しています：

- 敬意を持って他者と接する
- 建設的なフィードバックを提供する
- 多様性を尊重し、包括的な環境を維持する
- プロフェッショナルな態度を保つ

## 貢献の方法

### バグレポート

バグを発見した場合は、以下の手順でレポートしてください：

1. 既存のIssueを検索して、同じ問題が報告されていないか確認
2. 新しいIssueを作成し、以下の情報を含める：
   - バグの詳細な説明
   - 再現手順
   - 期待される動作
   - 実際の動作
   - 環境情報（OS、ブラウザ、Node.jsバージョンなど）
   - 可能であればスクリーンショット

### 機能リクエスト

新機能の提案は大歓迎です！

1. 既存のIssueを確認
2. 新しいIssueを作成し、以下を含める：
   - 機能の詳細な説明
   - ユースケース
   - 実装の提案（オプション）

### コードの貢献

1. Issueを選択または作成
2. リポジトリをフォーク
3. 機能ブランチを作成
4. 変更を実装
5. テストを作成・実行
6. プルリクエストを送信

## 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-username/family-tree.git
cd family-tree

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集

# データベースをセットアップ
npm run db:setup

# 開発サーバーを起動
npm run dev
```

## 開発フロー

### ブランチ戦略

- `main`: 本番環境のコード
- `develop`: 開発ブランチ
- `feature/*`: 新機能
- `fix/*`: バグ修正
- `docs/*`: ドキュメント更新
- `refactor/*`: リファクタリング

### ブランチ命名規則

```
feature/issue-123-add-user-authentication
fix/issue-456-fix-login-error
docs/update-api-documentation
refactor/improve-search-performance
```

## コーディング規約

### TypeScript/JavaScript

- ESLintとPrettierの設定に従う
- 型定義を必ず含める
- 関数には適切なJSDocコメントを追加

```typescript
/**
 * 人物を検索する
 * @param query - 検索クエリ
 * @param filters - フィルター条件
 * @returns 検索結果の配列
 */
export async function searchPersons(
  query: string,
  filters: SearchFilters
): Promise<Person[]> {
  // 実装
}
```

### React コンポーネント

- 関数コンポーネントを使用
- PropsにはTypeScriptの型定義を使用
- カスタムフックを活用

```tsx
interface PersonCardProps {
  person: Person;
  onEdit?: (person: Person) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person, onEdit }) => {
  // コンポーネントの実装
};
```

### CSS/スタイリング

- Tailwind CSSのユーティリティクラスを優先
- カスタムCSSは最小限に
- レスポンシブデザインを考慮

### ファイル構成

```
src/
├── components/     # 再利用可能なコンポーネント
│   └── PersonCard/
│       ├── PersonCard.tsx
│       ├── PersonCard.test.tsx
│       └── index.ts
├── pages/         # ページコンポーネント
├── hooks/         # カスタムフック
├── services/      # APIサービス
├── stores/        # 状態管理
├── types/         # 型定義
└── utils/         # ユーティリティ関数
```

## コミットメッセージ

### フォーマット

```
<type>(<scope>): <subject>

<body>

<footer>
```

### タイプ

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更
- `refactor`: バグ修正や機能追加を含まないコード変更
- `perf`: パフォーマンス改善
- `test`: テストの追加や修正
- `chore`: ビルドプロセスやツールの変更

### 例

```
feat(search): リアルタイム検索機能を追加

- デバウンス処理を実装
- 検索候補の表示を追加
- キーボードナビゲーションをサポート

Closes #123
```

## プルリクエスト

### プルリクエストのチェックリスト

- [ ] コードがプロジェクトのスタイルガイドに従っている
- [ ] 自己レビューを実施した
- [ ] コードにコメントを追加した（特に複雑な部分）
- [ ] ドキュメントを更新した
- [ ] 変更によって既存の機能が壊れていない
- [ ] テストを追加し、すべてパスしている
- [ ] 依存関係の変更がある場合は記載した

### プルリクエストのテンプレート

```markdown
## 概要
このPRで実装した内容の簡潔な説明

## 関連Issue
Closes #(issue番号)

## 変更内容
- 実装した機能や修正の詳細
- 主な変更点のリスト

## テスト方法
1. 機能をテストする手順
2. 期待される結果

## スクリーンショット（UIの変更がある場合）
変更前後のスクリーンショット

## チェックリスト
- [ ] テストを追加/更新した
- [ ] ドキュメントを更新した
- [ ] LintとTypeScriptのエラーがない
```

## テスト

### テストの実行

```bash
# すべてのテストを実行
npm test

# フロントエンドのテスト
npm run test:frontend

# バックエンドのテスト
npm run test:backend

# E2Eテスト
npm run test:e2e

# テストカバレッジ
npm run test:coverage
```

### テストの書き方

- すべての新機能にテストを追加
- エッジケースを考慮
- テストは読みやすく、保守しやすいように

```typescript
describe('PersonCard', () => {
  it('should display person information correctly', () => {
    const person = {
      id: '1',
      firstName: '太郎',
      lastName: '田中',
      birthDate: '1990-01-01'
    };

    render(<PersonCard person={person} />);

    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    expect(screen.getByText('1990-01-01')).toBeInTheDocument();
  });
});
```

## ドキュメント

### ドキュメントの更新

以下の場合はドキュメントの更新が必要です：

- 新機能の追加
- APIの変更
- 設定方法の変更
- 依存関係の更新

### ドキュメントの場所

- `README.md`: プロジェクトの概要
- `docs/`: 詳細なドキュメント
- コード内のコメント: 実装の詳細
- `CHANGELOG.md`: 変更履歴

## 質問とサポート

質問がある場合は：

1. [FAQ](./docs/faq.md)を確認
2. [Discussions](https://github.com/masanami/family-tree/discussions)で質問
3. [Issues](https://github.com/masanami/family-tree/issues)で問題を報告

## ライセンス

このプロジェクトへの貢献は、[MITライセンス](./LICENSE)の条件に従います。

---

ご協力ありがとうございます！🎉