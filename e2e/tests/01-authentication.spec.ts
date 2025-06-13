import { test, expect } from '../helpers/test-utils';

test.describe('認証機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('新規ユーザー登録フロー', async ({ page }) => {
    // 登録ページへ移動
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL('/register');
    
    // 登録フォームの入力
    await page.fill('#username', 'newuser');
    await page.fill('#email', 'newuser@example.com');
    await page.fill('#password', 'SecurePass123!');
    await page.fill('#confirmPassword', 'SecurePass123!');
    
    // 利用規約に同意
    await page.check('#agreeTerms');
    
    // 登録ボタンクリック
    const [response] = await Promise.all([
      page.waitForResponse('/api/auth/register'),
      page.click('button[type="submit"]'),
    ]);
    
    // レスポンス確認
    expect(response.status()).toBe(201);
    
    // ダッシュボードへのリダイレクト確認
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('ダッシュボード');
  });

  test('ログインフロー', async ({ page }) => {
    // ログインページへ移動
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL('/login');
    
    // ログインフォームの入力
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Test123!@#');
    
    // ログインボタンクリック
    const [response] = await Promise.all([
      page.waitForResponse('/api/auth/login'),
      page.click('button[type="submit"]'),
    ]);
    
    // レスポンス確認
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('token');
    
    // ダッシュボードへのリダイレクト確認
    await expect(page).toHaveURL('/dashboard');
  });

  test('ログインエラー処理', async ({ page }) => {
    await page.goto('/login');
    
    // 誤ったパスワードでログイン試行
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'wrongpassword');
    
    const [response] = await Promise.all([
      page.waitForResponse('/api/auth/login'),
      page.click('button[type="submit"]'),
    ]);
    
    // エラーレスポンス確認
    expect(response.status()).toBe(401);
    
    // エラーメッセージ表示確認
    await expect(page.locator('.error-message')).toContainText('認証情報が正しくありません');
  });

  test('ログアウトフロー', async ({ authenticatedPage }) => {
    // 認証済みページでログアウトボタンをクリック
    await authenticatedPage.click('#logout-button');
    
    // 確認ダイアログ
    await authenticatedPage.click('button:has-text("ログアウト")');
    
    // ホームページへのリダイレクト確認
    await expect(authenticatedPage).toHaveURL('/');
    
    // 保護されたページにアクセス試行
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage).toHaveURL('/login');
  });

  test('セッションタイムアウト', async ({ page, context }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Test123!@#');
    await page.click('button[type="submit"]');
    
    // JWTトークンを無効化（セッションタイムアウトをシミュレート）
    await context.clearCookies();
    
    // 保護されたページへアクセス
    await page.goto('/dashboard');
    
    // ログインページへのリダイレクト確認
    await expect(page).toHaveURL('/login');
    await expect(page.locator('.info-message')).toContainText('セッションが期限切れです');
  });
});