# Authentication API Documentation

## Overview
This is a RESTful authentication API built with Node.js, Express, and TypeScript following TDD principles.

## Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "unique-id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-12-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "unique-id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-12-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z"
  }
}
```

### GET /api/auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "user": {
    "id": "unique-id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-12-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/logout
Logout and invalidate token (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on login (5 attempts per 15 minutes) and registration (3 per hour)
- Input sanitization and validation
- Type-safe implementation with TypeScript

## Running the API

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`

3. Run in development mode:
```bash
npm run dev
```

4. Run tests:
```bash
npm test
```

5. Build for production:
```bash
npm run build
npm start
```