# Performance Optimization Guide

Family Tree Applicationのパフォーマンス最適化に関するガイドです。

## 目次

1. [フロントエンド最適化](#フロントエンド最適化)
2. [バックエンド最適化](#バックエンド最適化)
3. [データベース最適化](#データベース最適化)
4. [キャッシング戦略](#キャッシング戦略)
5. [監視とプロファイリング](#監視とプロファイリング)

## フロントエンド最適化

### コードスプリッティング

```javascript
// 遅延読み込みの実装
const PersonDetail = lazy(() => import('./components/PersonDetail'));
const FamilyTreeView = lazy(() => import('./components/FamilyTreeView'));

// Suspenseでラップ
<Suspense fallback={<Loading />}>
  <PersonDetail />
</Suspense>
```

### バンドルサイズの最適化

```bash
# バンドルサイズの分析
npm run analyze

# 未使用コードの削除
npm run build -- --treeshake
```

### 画像最適化

- WebP形式の使用
- 遅延読み込みの実装
- レスポンシブ画像の提供

```tsx
// 画像の遅延読み込み
<img
  loading="lazy"
  src="image.jpg"
  srcSet="image-320w.jpg 320w,
          image-768w.jpg 768w,
          image-1024w.jpg 1024w"
  sizes="(max-width: 320px) 280px,
         (max-width: 768px) 720px,
         1024px"
  alt="Description"
/>
```

### React最適化

#### メモ化の活用

```typescript
// React.memoでコンポーネントをメモ化
export const PersonCard = memo(({ person }) => {
  // コンポーネントの実装
}, (prevProps, nextProps) => {
  return prevProps.person.id === nextProps.person.id;
});

// useCallbackで関数をメモ化
const handleSearch = useCallback((query: string) => {
  // 検索処理
}, [dependencies]);

// useMemoで計算結果をメモ化
const filteredPersons = useMemo(() => {
  return persons.filter(person => 
    person.name.includes(searchQuery)
  );
}, [persons, searchQuery]);
```

#### 仮想スクロール

```typescript
// 大量データの表示には仮想スクロールを使用
import { FixedSizeList } from 'react-window';

const PersonList = ({ persons }) => (
  <FixedSizeList
    height={600}
    itemCount={persons.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <PersonCard person={persons[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

### ネットワーク最適化

#### HTTPキャッシュヘッダー

```nginx
# 静的アセットのキャッシュ
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### Service Worker

```javascript
// キャッシュ戦略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## バックエンド最適化

### Node.js最適化

#### クラスタリング

```javascript
// PM2設定でクラスタリングを有効化
module.exports = {
  apps: [{
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster'
  }]
};
```

#### 非同期処理の最適化

```typescript
// Promise.allで並列処理
const [persons, relationships, familyTrees] = await Promise.all([
  getPersons(),
  getRelationships(),
  getFamilyTrees()
]);

// ストリーミングレスポンス
app.get('/api/export', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const stream = createReadStream();
  stream.pipe(res);
});
```

### API最適化

#### ページネーション

```typescript
// カーソルベースのページネーション
interface PaginationParams {
  cursor?: string;
  limit: number;
}

async function getPersons({ cursor, limit }: PaginationParams) {
  const query = cursor
    ? { where: { id: { gt: cursor } }, take: limit }
    : { take: limit };
    
  return await prisma.person.findMany(query);
}
```

#### GraphQLでのデータフェッチ最適化

```graphql
# 必要なフィールドのみ取得
query GetPerson($id: ID!) {
  person(id: $id) {
    id
    name
    relationships {
      id
      type
      relatedPerson {
        id
        name
      }
    }
  }
}
```

## データベース最適化

### インデックス設計

```sql
-- 頻繁に検索されるカラムにインデックスを作成
CREATE INDEX idx_persons_family_tree_id ON persons(family_tree_id);
CREATE INDEX idx_persons_last_name ON persons(last_name);
CREATE INDEX idx_relationships_persons ON relationships(person1_id, person2_id);

-- 複合インデックス
CREATE INDEX idx_persons_search ON persons(last_name, first_name, birth_date);
```

### クエリ最適化

```typescript
// N+1問題の回避
const personsWithRelationships = await prisma.person.findMany({
  include: {
    relationships: {
      include: {
        relatedPerson: true
      }
    }
  }
});

// 不要なデータの除外
const persons = await prisma.person.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    // 大きなフィールドは必要な時のみ
    bio: false
  }
});
```

### コネクションプール

```typescript
// Prismaでのコネクションプール設定
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // コネクションプールの設定
  connection_limit: 10,
  pool_timeout: 10,
});
```

## キャッシング戦略

### Redisキャッシュ

```typescript
// キャッシュの実装
class CacheService {
  private redis: Redis;
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.redis.set(
      key,
      JSON.stringify(value),
      ttl ? ['EX', ttl] : []
    );
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// 使用例
const cacheKey = `person:${id}`;
let person = await cache.get(cacheKey);

if (!person) {
  person = await prisma.person.findUnique({ where: { id } });
  await cache.set(cacheKey, person, 3600); // 1時間キャッシュ
}
```

### CDN設定

```yaml
# CloudFront設定例
Behaviors:
  - PathPattern: "/api/*"
    TargetOriginId: APIOrigin
    CachePolicyId: DISABLED
  - PathPattern: "*.js"
    TargetOriginId: S3Origin
    CachePolicyId: CACHING_OPTIMIZED
    Compress: true
```

## 監視とプロファイリング

### パフォーマンスメトリクス

```typescript
// パフォーマンス計測
import { performance } from 'perf_hooks';

export function measurePerformance(name: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await method.apply(this, args);
      const end = performance.now();
      
      logger.info(`${name} took ${end - start}ms`);
      
      return result;
    };
  };
}

// 使用例
@measurePerformance('SearchPersons')
async searchPersons(query: string) {
  // 検索処理
}
```

### APM (Application Performance Monitoring)

```typescript
// New Relic設定例
import newrelic from 'newrelic';

// カスタムメトリクス
newrelic.recordMetric('Custom/PersonSearch/Duration', searchDuration);
newrelic.recordCustomEvent('PersonSearched', {
  query,
  resultCount,
  duration: searchDuration
});
```

### ロードテスト

```bash
# k6を使用したロードテスト
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%が500ms以下
    http_req_failed: ['rate<0.1'], // エラー率10%以下
  },
};

export default function () {
  let res = http.get('https://api.example.com/persons');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## パフォーマンス目標

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5秒
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### APIレスポンスタイム

- 一覧取得: < 200ms
- 詳細取得: < 100ms
- 検索: < 300ms
- 作成/更新: < 500ms

### ページロード時間

- 初回ロード: < 3秒
- キャッシュ後: < 1秒

## チェックリスト

### デプロイ前のパフォーマンスチェック

- [ ] バンドルサイズが許容範囲内
- [ ] 画像が最適化されている
- [ ] キャッシュヘッダーが適切に設定されている
- [ ] データベースインデックスが作成されている
- [ ] N+1問題がない
- [ ] メモリリークがない
- [ ] ロードテストで目標を達成している

---

パフォーマンスに関する詳細な情報は、[監視ダッシュボード](https://monitoring.example.com)を参照してください。