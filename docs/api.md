# Family Tree API Documentation

## Overview

Family Tree APIは、RESTfulな設計に基づいて構築されたWebAPIです。JSON形式でデータをやり取りし、標準的なHTTPステータスコードを使用します。

### Base URL

```
Development: http://localhost:8000/api
Production: https://api.familytree.example.com/api
```

### Authentication

APIへのアクセスにはJWT（JSON Web Token）による認証が必要です。

```http
Authorization: Bearer <your-jwt-token>
```

### Common Headers

```http
Content-Type: application/json
Accept: application/json
```

## Endpoints

### Authentication

#### Login

ユーザー認証を行い、JWTトークンを取得します。

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Register

新規ユーザーを登録します。

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Persons

#### Get All Persons

登録されている全ての人物を取得します。

```http
GET /persons
```

**Query Parameters:**
- `page` (number): ページ番号（デフォルト: 1）
- `limit` (number): 1ページあたりの件数（デフォルト: 20）
- `familyTreeId` (string): 家系図ID

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "太郎",
      "lastName": "田中",
      "birthDate": "1990-01-01",
      "gender": "male",
      "profileImage": "https://example.com/images/taro.jpg",
      "familyTreeId": "550e8400-e29b-41d4-a716-446655440002"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "limit": 20
  }
}
```

#### Get Person by ID

特定の人物の詳細情報を取得します。

```http
GET /persons/:id
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "firstName": "太郎",
  "lastName": "田中",
  "birthDate": "1990-01-01",
  "deathDate": null,
  "gender": "male",
  "profileImage": "https://example.com/images/taro.jpg",
  "bio": "会社員として働いています。",
  "familyTreeId": "550e8400-e29b-41d4-a716-446655440002",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Create Person

新しい人物を作成します。

```http
POST /persons
```

**Request Body:**
```json
{
  "firstName": "太郎",
  "lastName": "田中",
  "birthDate": "1990-01-01",
  "gender": "male",
  "familyTreeId": "550e8400-e29b-41d4-a716-446655440002"
}
```

#### Update Person

人物情報を更新します。

```http
PUT /persons/:id
```

**Request Body:**
```json
{
  "firstName": "太郎",
  "lastName": "田中",
  "bio": "更新されたプロフィール"
}
```

#### Delete Person

人物を削除します。

```http
DELETE /persons/:id
```

### Relationships

#### Get All Relationships

全ての関係性を取得します。

```http
GET /relationships
```

**Query Parameters:**
- `personId` (string): 特定の人物に関連する関係性のみ取得
- `type` (string): 関係性タイプでフィルタリング

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "person1Id": "550e8400-e29b-41d4-a716-446655440001",
      "person2Id": "550e8400-e29b-41d4-a716-446655440004",
      "relationshipType": "parent",
      "startDate": "1990-01-01",
      "endDate": null
    }
  ]
}
```

#### Create Relationship

新しい関係性を作成します。

```http
POST /relationships
```

**Request Body:**
```json
{
  "person1Id": "550e8400-e29b-41d4-a716-446655440001",
  "person2Id": "550e8400-e29b-41d4-a716-446655440004",
  "relationshipType": "parent"
}
```

**Relationship Types:**
- `parent`: 親
- `child`: 子
- `spouse`: 配偶者
- `sibling`: 兄弟姉妹
- `grandparent`: 祖父母
- `grandchild`: 孫
- `uncle_aunt`: 叔父・叔母
- `nephew_niece`: 甥・姪
- `cousin`: いとこ

### Family Trees

#### Get All Family Trees

全ての家系図を取得します。

```http
GET /family-trees
```

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "田中家の家系図",
      "description": "田中家の3世代にわたる家系図",
      "createdBy": "550e8400-e29b-41d4-a716-446655440000",
      "isPublic": false,
      "memberCount": 15
    }
  ]
}
```

#### Get Family Tree Details

特定の家系図の詳細情報を取得します。

```http
GET /family-trees/:id
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "田中家の家系図",
  "description": "田中家の3世代にわたる家系図",
  "createdBy": "550e8400-e29b-41d4-a716-446655440000",
  "isPublic": false,
  "members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "太郎",
      "lastName": "田中",
      "role": "root"
    }
  ],
  "relationships": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "person1Id": "550e8400-e29b-41d4-a716-446655440001",
      "person2Id": "550e8400-e29b-41d4-a716-446655440004",
      "relationshipType": "parent"
    }
  ]
}
```

### Search

#### Search Persons

人物を検索します。

```http
GET /search/persons
```

**Query Parameters:**
- `q` (string): 検索クエリ
- `gender` (string): 性別フィルター
- `ageMin` (number): 最小年齢
- `ageMax` (number): 最大年齢
- `birthDateStart` (string): 生年月日開始
- `birthDateEnd` (string): 生年月日終了
- `isAlive` (boolean): 生存状況
- `hasProfileImage` (boolean): プロフィール画像有無
- `sortBy` (string): ソート項目
- `sortOrder` (string): ソート順序（asc/desc）
- `limit` (number): 結果件数
- `offset` (number): オフセット

**Response:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "太郎",
      "lastName": "田中",
      "fullName": "田中太郎",
      "age": 34,
      "relevanceScore": 0.95,
      "matchedFields": ["firstName", "lastName"]
    }
  ],
  "totalCount": 150,
  "filteredCount": 3,
  "highlights": [
    {
      "itemId": "550e8400-e29b-41d4-a716-446655440001",
      "field": "fullName",
      "matches": [
        { "start": 0, "end": 2, "text": "田中" }
      ]
    }
  ]
}
```

#### Get Search Suggestions

検索候補を取得します。

```http
GET /search/suggestions
```

**Query Parameters:**
- `q` (string): 検索クエリ
- `limit` (number): 候補数（デフォルト: 10）

**Response:**
```json
{
  "suggestions": [
    "田中太郎",
    "田中花子",
    "田中一郎"
  ]
}
```

## Error Handling

APIは標準的なHTTPステータスコードを返します。

### Success Codes
- `200 OK`: リクエスト成功
- `201 Created`: リソース作成成功
- `204 No Content`: 削除成功

### Error Codes
- `400 Bad Request`: 不正なリクエスト
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: アクセス権限なし
- `404 Not Found`: リソースが見つからない
- `422 Unprocessable Entity`: バリデーションエラー
- `500 Internal Server Error`: サーバーエラー

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": {
      "firstName": "名前は必須です",
      "birthDate": "正しい日付形式で入力してください"
    }
  }
}
```

## Rate Limiting

APIには以下のレート制限が適用されます：

- 認証なし: 100リクエスト/15分
- 認証あり: 1000リクエスト/15分

レート制限の状態はレスポンスヘッダーで確認できます：

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

一覧取得系のエンドポイントは、ページネーションをサポートしています：

```http
GET /persons?page=2&limit=20
```

レスポンスにはメタ情報が含まれます：

```json
{
  "data": [...],
  "meta": {
    "currentPage": 2,
    "totalPages": 10,
    "totalCount": 200,
    "limit": 20,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

## Versioning

APIバージョンは、今後のアップデートに備えてURLパスで管理される予定です：

```
/api/v1/persons
/api/v2/persons
```

現在はv1がデフォルトで使用されます。

## CORS

開発環境では `http://localhost:5173` からのリクエストを許可しています。
本番環境では、適切なオリジンを設定してください。

## WebSocket Events (Future)

将来的に、リアルタイム更新のためのWebSocketサポートを追加予定です：

- `person.created`: 新しい人物が作成された
- `person.updated`: 人物情報が更新された
- `relationship.created`: 新しい関係性が作成された
- `familyTree.updated`: 家系図が更新された