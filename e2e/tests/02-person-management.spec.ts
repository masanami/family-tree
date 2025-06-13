import { test, expect, testFamily } from '../helpers/test-utils';

test.describe('人物管理機能', () => {
  test.use({ storageState: 'e2e/fixtures/auth.json' });

  test('人物の新規登録', async ({ authenticatedPage: page }) => {
    // 人物管理ページへ移動
    await page.goto('/persons');
    await page.click('button:has-text("新規登録")');
    
    // フォーム入力
    await page.fill('#firstName', testFamily.father.firstName);
    await page.fill('#lastName', testFamily.father.lastName);
    await page.fill('#birthDate', testFamily.father.birthDate);
    await page.selectOption('#gender', testFamily.father.gender);
    
    // 保存
    const [response] = await Promise.all([
      page.waitForResponse('/api/persons'),
      page.click('button[type="submit"]'),
    ]);
    
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    
    // 一覧画面に戻る
    await expect(page).toHaveURL('/persons');
    await expect(page.locator(`text=${testFamily.father.lastName} ${testFamily.father.firstName}`)).toBeVisible();
  });

  test('人物情報の編集', async ({ authenticatedPage: page }) => {
    await page.goto('/persons');
    
    // 編集ボタンをクリック
    await page.click(`tr:has-text("${testFamily.father.lastName}") button:has-text("編集")`);
    
    // 情報を更新
    await page.fill('#occupation', 'エンジニア');
    await page.fill('#notes', '家族の大黒柱');
    
    // 保存
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/persons/') && res.request().method() === 'PUT'),
      page.click('button[type="submit"]'),
    ]);
    
    expect(response.status()).toBe(200);
    
    // 更新確認
    await page.goto('/persons');
    await page.click(`tr:has-text("${testFamily.father.lastName}") button:has-text("詳細")`);
    await expect(page.locator('#occupation')).toHaveValue('エンジニア');
  });

  test('家族関係の設定', async ({ authenticatedPage: page }) => {
    // 母親を追加
    await page.goto('/persons/new');
    await page.fill('#firstName', testFamily.mother.firstName);
    await page.fill('#lastName', testFamily.mother.lastName);
    await page.fill('#birthDate', testFamily.mother.birthDate);
    await page.selectOption('#gender', testFamily.mother.gender);
    await page.click('button[type="submit"]');
    
    // 関係設定ページへ
    await page.goto('/relationships');
    await page.click('button:has-text("関係を追加")');
    
    // 配偶者関係を設定
    await page.selectOption('#person1', `${testFamily.father.lastName} ${testFamily.father.firstName}`);
    await page.selectOption('#relationshipType', 'spouse');
    await page.selectOption('#person2', `${testFamily.mother.lastName} ${testFamily.mother.firstName}`);
    
    const [response] = await Promise.all([
      page.waitForResponse('/api/relationships'),
      page.click('button[type="submit"]'),
    ]);
    
    expect(response.status()).toBe(201);
  });

  test('人物の検索とフィルタリング', async ({ authenticatedPage: page }) => {
    await page.goto('/persons');
    
    // 名前で検索
    await page.fill('#searchName', '田中');
    await page.click('button:has-text("検索")');
    
    // 結果確認
    const results = page.locator('tbody tr');
    await expect(results).toHaveCount(2); // 父と母
    
    // 性別でフィルタ
    await page.selectOption('#filterGender', 'male');
    await page.click('button:has-text("適用")');
    
    await expect(results).toHaveCount(1);
    await expect(results.first()).toContainText(testFamily.father.firstName);
  });

  test('人物の削除', async ({ authenticatedPage: page }) => {
    await page.goto('/persons');
    
    // 削除確認ダイアログ
    page.on('dialog', dialog => dialog.accept());
    
    // 削除ボタンクリック
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/persons/') && res.request().method() === 'DELETE'),
      page.click(`tr:has-text("テスト削除用") button:has-text("削除")`),
    ]);
    
    expect(response.status()).toBe(204);
    
    // 削除確認
    await page.reload();
    await expect(page.locator('text=テスト削除用')).not.toBeVisible();
  });

  test('一括インポート機能', async ({ authenticatedPage: page }) => {
    await page.goto('/persons/import');
    
    // CSVファイルをアップロード
    const csvContent = `firstName,lastName,birthDate,gender
太郎,山田,1955-03-20,male
花子,山田,1957-06-15,female`;
    
    const buffer = Buffer.from(csvContent);
    await page.setInputFiles('#csvFile', {
      name: 'family_data.csv',
      mimeType: 'text/csv',
      buffer,
    });
    
    // プレビュー確認
    await page.click('button:has-text("プレビュー")');
    await expect(page.locator('.preview-table')).toBeVisible();
    await expect(page.locator('.preview-table tr')).toHaveCount(3); // ヘッダー + 2行
    
    // インポート実行
    const [response] = await Promise.all([
      page.waitForResponse('/api/persons/import'),
      page.click('button:has-text("インポート実行")'),
    ]);
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.imported).toBe(2);
  });
});