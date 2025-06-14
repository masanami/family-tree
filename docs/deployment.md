# Deployment Guide

Family Tree Applicationのデプロイメントガイドです。開発環境から本番環境まで、さまざまなデプロイ方法を説明します。

## 目次

1. [前提条件](#前提条件)
2. [開発環境](#開発環境)
3. [本番環境へのデプロイ](#本番環境へのデプロイ)
4. [Docker を使用したデプロイ](#docker-を使用したデプロイ)
5. [CI/CD パイプライン](#cicd-パイプライン)
6. [トラブルシューティング](#トラブルシューティング)

## 前提条件

### システム要件

- **OS**: Linux (Ubuntu 20.04+ 推奨) / macOS / Windows (WSL2)
- **Node.js**: v20.x 以上
- **PostgreSQL**: v15 以上
- **メモリ**: 最小 2GB RAM
- **ディスク**: 最小 10GB の空き容量

### 必要なツール

```bash
# Node.js のインストール確認
node --version  # v20.x 以上

# npm のインストール確認
npm --version   # v10.x 以上

# PostgreSQL のインストール確認
psql --version  # v15 以上

# Git のインストール確認
git --version   # v2.x 以上
```

## 開発環境

### 1. リポジトリのクローン

```bash
git clone https://github.com/masanami/family-tree.git
cd family-tree
```

### 2. 環境変数の設定

```bash
# 環境変数ファイルのコピー
cp .env.example .env

# 必要に応じて .env ファイルを編集
vim .env
```

### 3. データベースのセットアップ

```bash
# PostgreSQL データベースの作成
createdb family_tree
createdb family_tree_test

# マイグレーションの実行
cd backend
npm run migrate:dev
npm run seed:dev  # 開発用のシードデータを投入
cd ..
```

### 4. 依存関係のインストールと起動

```bash
# 全ての依存関係をインストール
npm install

# 開発サーバーの起動
npm run dev
```

アプリケーションは以下のURLでアクセス可能です：
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8000

## 本番環境へのデプロイ

### 1. サーバーの準備

#### Ubuntu/Debian の場合

```bash
# システムの更新
sudo apt update && sudo apt upgrade -y

# Node.js のインストール (NodeSource リポジトリ使用)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL のインストール
sudo apt install -y postgresql postgresql-contrib

# Nginx のインストール (リバースプロキシ用)
sudo apt install -y nginx

# PM2 のインストール (プロセスマネージャー)
sudo npm install -g pm2
```

### 2. アプリケーションのデプロイ

```bash
# アプリケーションディレクトリの作成
sudo mkdir -p /opt/family-tree
sudo chown $USER:$USER /opt/family-tree

# コードのデプロイ
cd /opt/family-tree
git clone https://github.com/masanami/family-tree.git .

# 本番用環境変数の設定
cp .env.example .env.production
vim .env.production  # 本番環境の値を設定
```

### 3. データベースのセットアップ

```bash
# PostgreSQL ユーザーとデータベースの作成
sudo -u postgres psql <<EOF
CREATE USER familytree WITH PASSWORD 'your_secure_password';
CREATE DATABASE family_tree OWNER familytree;
GRANT ALL PRIVILEGES ON DATABASE family_tree TO familytree;
EOF

# マイグレーションの実行
NODE_ENV=production npm run migrate:deploy
```

### 4. アプリケーションのビルドと起動

```bash
# 依存関係のインストール
npm ci --production

# アプリケーションのビルド
npm run build

# PM2 でアプリケーションを起動
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # システム起動時の自動起動設定
```

### 5. Nginx の設定

```nginx
# /etc/nginx/sites-available/family-tree
server {
    listen 80;
    server_name your-domain.com;

    # フロントエンドの静的ファイル
    location / {
        root /opt/family-tree/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # APIプロキシ
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Nginx 設定の有効化
sudo ln -s /etc/nginx/sites-available/family-tree /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL/TLS の設定 (Let's Encrypt)

```bash
# Certbot のインストール
sudo apt install -y certbot python3-certbot-nginx

# SSL証明書の取得
sudo certbot --nginx -d your-domain.com
```

## Docker を使用したデプロイ

### 1. Dockerfile

```dockerfile
# マルチステージビルド
FROM node:20-alpine AS builder

WORKDIR /app

# 依存関係のコピーとインストール
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm ci

# ソースコードのコピーとビルド
COPY . .
RUN npm run build

# 本番イメージ
FROM node:20-alpine

WORKDIR /app

# 本番用依存関係のみインストール
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm ci --production

# ビルド成果物のコピー
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist

# 環境変数
ENV NODE_ENV=production

# ポート公開
EXPOSE 8000

# アプリケーション起動
CMD ["node", "backend/dist/server.js"]
```

### 2. docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://familytree:password@db:5432/family_tree
    depends_on:
      - db
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=familytree
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=family_tree
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  uploads:
```

### 3. デプロイコマンド

```bash
# イメージのビルド
docker-compose build

# コンテナの起動
docker-compose up -d

# ログの確認
docker-compose logs -f

# コンテナの停止
docker-compose down
```

## CI/CD パイプライン

### GitHub Actions の設定

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/family-tree
            git pull origin main
            npm ci --production
            npm run build
            pm2 restart family-tree
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. データベース接続エラー

```bash
# PostgreSQL サービスの状態確認
sudo systemctl status postgresql

# PostgreSQL の再起動
sudo systemctl restart postgresql

# 接続設定の確認
psql -h localhost -U familytree -d family_tree
```

#### 2. ポート競合

```bash
# 使用中のポートを確認
sudo lsof -i :8000
sudo lsof -i :5173

# プロセスの終了
kill -9 <PID>
```

#### 3. メモリ不足

```bash
# PM2 のメモリ制限設定
pm2 start app.js --max-memory-restart 1G

# Node.js のヒープサイズ増加
node --max-old-space-size=4096 server.js
```

#### 4. ビルドエラー

```bash
# キャッシュのクリア
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

### ログの確認

```bash
# PM2 ログ
pm2 logs family-tree

# Nginx ログ
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# アプリケーションログ
tail -f /opt/family-tree/logs/app.log
```

### パフォーマンスチューニング

#### 1. PostgreSQL の最適化

```sql
-- 接続プールの設定
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';

-- インデックスの作成
CREATE INDEX idx_persons_family_tree ON persons(family_tree_id);
CREATE INDEX idx_relationships_persons ON relationships(person1_id, person2_id);
```

#### 2. Node.js の最適化

```javascript
// PM2 エコシステムファイル
module.exports = {
  apps: [{
    name: 'family-tree',
    script: './backend/dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

#### 3. Nginx キャッシュ設定

```nginx
# 静的ファイルのキャッシュ
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API レスポンスのキャッシュ
location /api {
    proxy_cache_valid 200 302 10m;
    proxy_cache_valid 404 1m;
}
```

## セキュリティ対策

### 1. ファイアウォール設定

```bash
# UFW の設定
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 2. 環境変数の保護

```bash
# .env ファイルの権限設定
chmod 600 .env.production

# 環境変数の暗号化 (例: dotenv-vault)
npx dotenv-vault local build
```

### 3. セキュリティヘッダー

```nginx
# Nginx セキュリティヘッダー
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## バックアップとリストア

### データベースバックアップ

```bash
# バックアップスクリプト
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/family-tree"
mkdir -p $BACKUP_DIR

# データベースバックアップ
pg_dump -U familytree family_tree > $BACKUP_DIR/db_backup_$DATE.sql

# 古いバックアップの削除（30日以上）
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
```

### リストア手順

```bash
# データベースのリストア
psql -U familytree family_tree < backup_file.sql

# アップロードファイルのリストア
tar -xzf uploads_backup.tar.gz -C /opt/family-tree/uploads/
```

## 監視とアラート

### 1. ヘルスチェックエンドポイント

```bash
# ヘルスチェック
curl http://localhost:8000/health
```

### 2. 監視ツールの設定

- **Prometheus + Grafana**: メトリクス監視
- **Sentry**: エラー監視
- **New Relic**: APM (Application Performance Monitoring)

---

詳細な質問や問題がある場合は、[Issues](https://github.com/masanami/family-tree/issues) で報告してください。