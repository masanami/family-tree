import { test, expect, testFamily } from '../helpers/test-utils';

test.describe('統合シナリオテスト', () => {
  test('完全な家族登録から家系図表示までのフロー', async ({ page }) => {
    // 1. ユーザー登録
    await page.goto('/register');
    const uniqueUser = `user_${Date.now()}`;
    await page.fill('#username', uniqueUser);
    await page.fill('#email', `${uniqueUser}@example.com`);
    await page.fill('#password', 'SecurePass123!');
    await page.fill('#confirmPassword', 'SecurePass123!');
    await page.check('#agreeTerms');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // 2. 家族メンバーの登録
    const familyMembers = [testFamily.father, testFamily.mother, testFamily.child1, testFamily.child2];
    const personIds: string[] = [];

    for (const member of familyMembers) {
      await page.goto('/persons/new');
      await page.fill('#firstName', member.firstName);
      await page.fill('#lastName', member.lastName);
      await page.fill('#birthDate', member.birthDate);
      await page.selectOption('#gender', member.gender);
      
      const [response] = await Promise.all([
        page.waitForResponse('/api/persons'),
        page.click('button[type="submit"]'),
      ]);
      
      const data = await response.json();
      personIds.push(data.id);
    }

    // 3. 家族関係の設定
    await page.goto('/relationships');
    
    // 夫婦関係
    await page.click('button:has-text("関係を追加")');
    await page.selectOption('#person1', `${testFamily.father.lastName} ${testFamily.father.firstName}`);
    await page.selectOption('#relationshipType', 'spouse');
    await page.selectOption('#person2', `${testFamily.mother.lastName} ${testFamily.mother.firstName}`);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // 親子関係（父→子供1）
    await page.click('button:has-text("関係を追加")');
    await page.selectOption('#person1', `${testFamily.father.lastName} ${testFamily.father.firstName}`);
    await page.selectOption('#relationshipType', 'parent');
    await page.selectOption('#person2', `${testFamily.child1.lastName} ${testFamily.child1.firstName}`);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // 親子関係（母→子供1）
    await page.click('button:has-text("関係を追加")');
    await page.selectOption('#person1', `${testFamily.mother.lastName} ${testFamily.mother.firstName}`);
    await page.selectOption('#relationshipType', 'parent');
    await page.selectOption('#person2', `${testFamily.child1.lastName} ${testFamily.child1.firstName}`);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // 4. 家系図表示
    await page.goto('/family-tree');
    await page.waitForSelector('svg.family-tree-svg');
    
    // 全メンバーが表示されていることを確認
    const nodes = page.locator('.person-node');
    await expect(nodes).toHaveCount(4);

    // 5. エクスポート
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("PDFでエクスポート")');
    await page.click('button:has-text("エクスポート実行")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('データの一貫性とエラー処理', async ({ authenticatedPage: page }) => {
    // 重複チェック
    await page.goto('/persons/new');
    await page.fill('#firstName', '重複');
    await page.fill('#lastName', 'テスト');
    await page.fill('#birthDate', '1990-01-01');
    await page.selectOption('#gender', 'male');
    await page.click('button[type="submit"]');
    
    // 同じ人物を再度登録試行
    await page.goto('/persons/new');
    await page.fill('#firstName', '重複');
    await page.fill('#lastName', 'テスト');
    await page.fill('#birthDate', '1990-01-01');
    await page.selectOption('#gender', 'male');
    
    const [response] = await Promise.all([
      page.waitForResponse('/api/persons'),
      page.click('button[type="submit"]'),
    ]);
    
    expect(response.status()).toBe(400);
    await expect(page.locator('.error-message')).toContainText('既に登録されています');
  });

  test('同時編集の競合解決', async ({ browser }) => {
    // 2つのブラウザコンテキストを作成
    const context1 = await browser.newContext({ storageState: 'e2e/fixtures/auth.json' });
    const context2 = await browser.newContext({ storageState: 'e2e/fixtures/auth.json' });
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // 両方のページで同じ人物を編集
    const personId = 'test-person-id';
    await page1.goto(`/persons/${personId}/edit`);
    await page2.goto(`/persons/${personId}/edit`);
    
    // ページ1で編集・保存
    await page1.fill('#occupation', '医師');
    await page1.click('button[type="submit"]');
    
    // ページ2で編集・保存試行
    await page2.fill('#occupation', '教師');
    const [response] = await Promise.all([
      page2.waitForResponse((res) => res.url().includes(`/api/persons/${personId}`)),
      page2.click('button[type="submit"]'),
    ]);
    
    // 競合エラーの確認
    expect(response.status()).toBe(409);
    await expect(page2.locator('.error-message')).toContainText('他のユーザーによって更新されています');
    
    await context1.close();
    await context2.close();
  });

  test('大量データのパフォーマンステスト', async ({ authenticatedPage: page }) => {
    // 100人の家族メンバーを含むCSVをインポート
    await page.goto('/persons/import');
    
    let csvContent = 'firstName,lastName,birthDate,gender\n';
    for (let i = 1; i <= 100; i++) {
      csvContent += `Member${i},TestFamily,${1920 + i}-01-01,${i % 2 === 0 ? 'male' : 'female'}\n`;
    }
    
    const buffer = Buffer.from(csvContent);
    await page.setInputFiles('#csvFile', {
      name: 'large_family.csv',
      mimeType: 'text/csv',
      buffer,
    });
    
    // インポート実行時間の計測
    const startTime = Date.now();
    await page.click('button:has-text("インポート実行")');
    await page.waitForResponse('/api/persons/import');
    const importTime = Date.now() - startTime;
    
    // 10秒以内に完了することを確認
    expect(importTime).toBeLessThan(10000);
    
    // 家系図表示のパフォーマンス
    const treeStartTime = Date.now();
    await page.goto('/family-tree');
    await page.waitForSelector('svg.family-tree-svg');
    const treeLoadTime = Date.now() - treeStartTime;
    
    // 5秒以内に表示されることを確認
    expect(treeLoadTime).toBeLessThan(5000);
  });
});