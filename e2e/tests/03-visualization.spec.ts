import { test, expect } from '../helpers/test-utils';

test.describe('家系図ビジュアライゼーション', () => {
  test.use({ storageState: 'e2e/fixtures/auth.json' });

  test('家系図の表示', async ({ authenticatedPage: page }) => {
    // 家系図ページへ移動
    await page.goto('/family-tree');
    
    // SVGが読み込まれるまで待機
    await page.waitForSelector('svg.family-tree-svg');
    
    // ノードの存在確認
    const nodes = page.locator('.person-node');
    await expect(nodes).toHaveCount(4); // 父、母、子供2人
    
    // リンク（関係線）の存在確認
    const links = page.locator('.relationship-link');
    await expect(links).toHaveCount(3); // 夫婦関係1、親子関係2
  });

  test('ノードのインタラクション', async ({ authenticatedPage: page }) => {
    await page.goto('/family-tree');
    await page.waitForSelector('svg.family-tree-svg');
    
    // ノードをクリック
    await page.click('.person-node:has-text("田中 太郎")');
    
    // 詳細パネルの表示確認
    await expect(page.locator('.person-detail-panel')).toBeVisible();
    await expect(page.locator('.person-detail-panel h2')).toContainText('田中 太郎');
    await expect(page.locator('.person-detail-panel')).toContainText('1960-01-01');
  });

  test('ズームとパン操作', async ({ authenticatedPage: page }) => {
    await page.goto('/family-tree');
    await page.waitForSelector('svg.family-tree-svg');
    
    // ズームイン
    await page.click('button[aria-label="ズームイン"]');
    await page.waitForTimeout(300); // アニメーション待機
    
    // transform属性の確認
    const transform = await page.locator('g.zoom-container').getAttribute('transform');
    expect(transform).toContain('scale(1.2');
    
    // ズームリセット
    await page.click('button[aria-label="リセット"]');
    await page.waitForTimeout(300);
    
    const resetTransform = await page.locator('g.zoom-container').getAttribute('transform');
    expect(resetTransform).toContain('scale(1)');
  });

  test('レイアウト切り替え', async ({ authenticatedPage: page }) => {
    await page.goto('/family-tree');
    
    // 横向きレイアウト
    await page.selectOption('#layoutType', 'horizontal');
    await page.waitForTimeout(500); // レイアウト変更アニメーション
    
    // ノード位置の確認（横向きの特徴を確認）
    const firstNode = await page.locator('.person-node').first().boundingBox();
    const secondNode = await page.locator('.person-node').nth(1).boundingBox();
    expect(firstNode!.x).toBeLessThan(secondNode!.x);
    
    // 縦向きレイアウトに戻す
    await page.selectOption('#layoutType', 'vertical');
    await page.waitForTimeout(500);
  });

  test('SVGエクスポート', async ({ authenticatedPage: page }) => {
    await page.goto('/family-tree');
    await page.waitForSelector('svg.family-tree-svg');
    
    // ダウンロードイベントの準備
    const downloadPromise = page.waitForEvent('download');
    
    // エクスポートボタンクリック
    await page.click('button:has-text("SVGでエクスポート")');
    
    // ダウンロード確認
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('family-tree');
    expect(download.suggestedFilename()).toContain('.svg');
  });

  test('PNGエクスポート', async ({ authenticatedPage: page }) => {
    await page.goto('/family-tree');
    await page.waitForSelector('svg.family-tree-svg');
    
    // ダウンロードイベントの準備
    const downloadPromise = page.waitForEvent('download');
    
    // エクスポートボタンクリック
    await page.click('button:has-text("PNGでエクスポート")');
    
    // ダウンロード確認
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('family-tree');
    expect(download.suggestedFilename()).toContain('.png');
  });

  test('PDFエクスポート', async ({ authenticatedPage: page }) => {
    await page.goto('/family-tree');
    await page.waitForSelector('svg.family-tree-svg');
    
    // エクスポート設定
    await page.click('button:has-text("PDFでエクスポート")');
    
    // 設定ダイアログ
    await page.selectOption('#paperSize', 'A3');
    await page.selectOption('#orientation', 'landscape');
    await page.check('#includeDetails');
    
    // ダウンロードイベントの準備
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("エクスポート実行")');
    
    // ダウンロード確認
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('family-tree');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('フィルター機能', async ({ authenticatedPage: page }) => {
    await page.goto('/family-tree');
    
    // 世代フィルター
    await page.selectOption('#generationFilter', '2'); // 第2世代のみ
    await page.waitForTimeout(300);
    
    const visibleNodes = page.locator('.person-node:visible');
    await expect(visibleNodes).toHaveCount(2); // 子供2人のみ
    
    // フィルターリセット
    await page.selectOption('#generationFilter', 'all');
    await expect(page.locator('.person-node')).toHaveCount(4);
  });

  test('検索とハイライト', async ({ authenticatedPage: page }) => {
    await page.goto('/family-tree');
    
    // 検索
    await page.fill('#searchPerson', '一郎');
    await page.press('#searchPerson', 'Enter');
    
    // ハイライトされたノードの確認
    await expect(page.locator('.person-node.highlighted')).toHaveCount(1);
    await expect(page.locator('.person-node.highlighted')).toContainText('一郎');
    
    // 他のノードが薄くなっていることを確認
    await expect(page.locator('.person-node:not(.highlighted)')).toHaveCSS('opacity', '0.3');
  });
});