# Monitoring and Logging Guide

Family Tree Applicationの監視とログ管理に関するガイドです。

## 目次

1. [ログ管理](#ログ管理)
2. [メトリクス監視](#メトリクス監視)
3. [エラー監視](#エラー監視)
4. [アラート設定](#アラート設定)
5. [ダッシュボード](#ダッシュボード)

## ログ管理

### ログレベル

```typescript
// ログレベルの定義
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// 環境別のログレベル設定
const logLevel = {
  production: LogLevel.INFO,
  staging: LogLevel.DEBUG,
  development: LogLevel.TRACE
}[process.env.NODE_ENV];
```

### Winston Logger設定

```typescript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// ログフォーマット
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// トランスポート設定
const transports = [
  // コンソール出力
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // ファイル出力（日次ローテーション）
  new DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
  }),
  
  // エラーログ専用ファイル
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: logFormat
  })
];

// Logger作成
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});
```

### 構造化ログ

```typescript
// リクエストログミドルウェア
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      requestId: req.id,
      // セキュリティのため、センシティブな情報は除外
      query: sanitizeQuery(req.query),
      body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined
    });
  });
  
  next();
};

// エラーログ
export const logError = (error: Error, context?: any) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
};
```

### ログ集約

```yaml
# Fluentd設定例
<source>
  @type tail
  path /var/log/family-tree/*.log
  pos_file /var/log/td-agent/family-tree.pos
  tag family-tree.*
  <parse>
    @type json
  </parse>
</source>

<match family-tree.**>
  @type elasticsearch
  host elasticsearch.example.com
  port 9200
  index_name family-tree
  type_name logs
  logstash_format true
  logstash_prefix family-tree
</match>
```

## メトリクス監視

### Prometheusメトリクス

```typescript
import { register, Counter, Histogram, Gauge } from 'prom-client';

// HTTPリクエストカウンター
export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// レスポンスタイムヒストグラム
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// アクティブユーザー数
export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

// データベースコネクション数
export const dbConnections = new Gauge({
  name: 'database_connections',
  help: 'Number of active database connections'
});

// メトリクスエンドポイント
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

### カスタムメトリクス

```typescript
// ビジネスメトリクス
export class BusinessMetrics {
  private searchCounter = new Counter({
    name: 'searches_total',
    help: 'Total number of searches performed',
    labelNames: ['type']
  });
  
  private personCreatedCounter = new Counter({
    name: 'persons_created_total',
    help: 'Total number of persons created'
  });
  
  private relationshipCreatedCounter = new Counter({
    name: 'relationships_created_total',
    help: 'Total number of relationships created',
    labelNames: ['type']
  });
  
  recordSearch(type: string) {
    this.searchCounter.inc({ type });
  }
  
  recordPersonCreated() {
    this.personCreatedCounter.inc();
  }
  
  recordRelationshipCreated(type: string) {
    this.relationshipCreatedCounter.inc({ type });
  }
}
```

## エラー監視

### Sentry統合

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

// Sentry初期化
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 0.1,
  beforeSend(event, hint) {
    // センシティブな情報をフィルタリング
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  }
});

// エラーハンドリングミドルウェア
export const sentryErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Sentry.captureException(err, {
    tags: {
      url: req.url,
      method: req.method
    },
    user: {
      id: req.user?.id,
      email: req.user?.email
    },
    extra: {
      query: req.query,
      body: req.body
    }
  });
  
  next(err);
};
```

### エラー分類

```typescript
// カスタムエラークラス
export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// エラータイプ別の処理
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApplicationError) {
    // 予期されたエラー
    logger.warn('Operational Error', {
      code: err.code,
      message: err.message,
      url: req.url
    });
    
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  } else {
    // 予期しないエラー
    logger.error('Unexpected Error', {
      error: err.message,
      stack: err.stack,
      url: req.url
    });
    
    Sentry.captureException(err);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
};
```

## アラート設定

### Prometheusアラートルール

```yaml
# prometheus-rules.yml
groups:
  - name: family-tree-alerts
    interval: 30s
    rules:
      # 高エラー率
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for the last 5 minutes"
      
      # レスポンスタイム遅延
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow response time"
          description: "95th percentile response time is {{ $value }}s"
      
      # データベースコネクション枯渇
      - alert: DatabaseConnectionExhaustion
        expr: database_connections / database_connection_limit > 0.8
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool near exhaustion"
          description: "{{ $value | humanizePercentage }} of connections are in use"
      
      # メモリ使用率
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / node_memory_total_bytes > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

### 通知設定

```yaml
# alertmanager.yml
global:
  smtp_from: 'alerts@familytree.com'
  smtp_smarthost: 'smtp.example.com:587'
  smtp_auth_username: 'alerts@familytree.com'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: default
  routes:
    - match:
        severity: critical
      receiver: pagerduty
    - match:
        severity: warning
      receiver: slack

receivers:
  - name: default
    email_configs:
      - to: 'team@example.com'
        
  - name: pagerduty
    pagerduty_configs:
      - service_key: 'your-pagerduty-key'
        
  - name: slack
    slack_configs:
      - api_url: 'your-slack-webhook-url'
        channel: '#alerts'
        title: 'Family Tree Alert'
```

## ダッシュボード

### Grafanaダッシュボード設定

```json
{
  "dashboard": {
    "title": "Family Tree Application Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [{
          "expr": "rate(http_requests_total[5m])"
        }]
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
        }]
      },
      {
        "title": "Response Time (p95)",
        "targets": [{
          "expr": "histogram_quantile(0.95, http_request_duration_seconds)"
        }]
      },
      {
        "title": "Active Users",
        "targets": [{
          "expr": "active_users"
        }]
      },
      {
        "title": "Database Connections",
        "targets": [{
          "expr": "database_connections"
        }]
      },
      {
        "title": "Memory Usage",
        "targets": [{
          "expr": "process_resident_memory_bytes"
        }]
      }
    ]
  }
}
```

### ヘルスチェックダッシュボード

```typescript
// ヘルスチェックエンドポイント
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      memory: checkMemory(),
      disk: await checkDisk()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  
  res.status(isHealthy ? 200 : 503).json(health);
});

// 詳細なヘルスチェック
async function checkDatabase() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    
    return {
      status: 'ok',
      duration,
      connections: await getConnectionCount()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}
```

## 監視のベストプラクティス

### 1. ログの構造化

- JSON形式で出力
- 一貫したフィールド名を使用
- コンテキスト情報を含める

### 2. メトリクスの設計

- ビジネスメトリクスを含める
- 適切な粒度で収集
- カーディナリティに注意

### 3. アラートの設計

- アクション可能なアラートのみ
- 適切な閾値設定
- エスカレーションルールの定義

### 4. ダッシュボードの構成

- 重要なメトリクスを上部に配置
- 関連するメトリクスをグループ化
- ドリルダウン可能な構成

---

監視に関する詳細な情報は、[運用マニュアル](./operations.md)を参照してください。