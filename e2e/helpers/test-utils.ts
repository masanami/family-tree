import { test as base, expect } from '@playwright/test';

// テストデータ
export const testUser = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'Test123!@#',
};

export const testFamily = {
  father: {
    firstName: '太郎',
    lastName: '田中',
    birthDate: '1960-01-01',
    gender: 'male',
  },
  mother: {
    firstName: '花子',
    lastName: '田中',
    birthDate: '1962-03-15',
    gender: 'female',
  },
  child1: {
    firstName: '一郎',
    lastName: '田中',
    birthDate: '1990-05-20',
    gender: 'male',
  },
  child2: {
    firstName: '美香',
    lastName: '田中',
    birthDate: '1992-08-10',
    gender: 'female',
  },
};

// カスタムテストフィクスチャ
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // ログイン処理
    await page.goto('/login');
    await page.fill('#username', testUser.username);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');
    
    // ダッシュボードへのリダイレクトを待つ
    await page.waitForURL('/dashboard');
    
    // 認証済みページを使用
    await use(page);
  },
});

export { expect };

// API呼び出しヘルパー
export async function createTestUser(page: any) {
  const response = await page.request.post('/api/auth/register', {
    data: testUser,
  });
  return response;
}

export async function loginUser(page: any) {
  const response = await page.request.post('/api/auth/login', {
    data: {
      username: testUser.username,
      password: testUser.password,
    },
  });
  const data = await response.json();
  return data.token;
}

// 待機ヘルパー
export async function waitForAPIResponse(page: any, url: string) {
  return page.waitForResponse((response: any) => 
    response.url().includes(url) && response.status() === 200
  );
}