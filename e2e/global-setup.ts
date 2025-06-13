import { chromium, FullConfig } from '@playwright/test';
import { testUser } from './helpers/test-utils';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // テスト用ユーザーの作成と認証状態の保存
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // APIが起動しているか確認
    await page.goto(baseURL!);
    
    // テストユーザーを登録
    await page.goto(`${baseURL}/register`);
    await page.fill('#username', testUser.username);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', testUser.password);
    await page.check('#agreeTerms');
    await page.click('button[type="submit"]');
    
    // ダッシュボードへのリダイレクトを待つ
    await page.waitForURL(`${baseURL}/dashboard`, { timeout: 10000 });
    
    // 認証状態を保存
    await page.context().storageState({ path: 'e2e/fixtures/auth.json' });
    
    console.log('✅ グローバルセットアップ完了');
  } catch (error) {
    console.error('❌ グローバルセットアップ失敗:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;