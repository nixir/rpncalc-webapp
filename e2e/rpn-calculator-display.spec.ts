import { test, expect } from '@playwright/test'

test.describe('RPN Calculator - Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('スタックラベルが正しい順序で表示される', async ({ page }) => {
    const stackLabels = page.locator('.stack-label')

    // スタックラベルが4つ存在することを確認
    await expect(stackLabels).toHaveCount(4)

    // 上からT, Z, Y, Xの順序で表示されることを確認
    await expect(stackLabels.nth(0)).toHaveText('T')
    await expect(stackLabels.nth(1)).toHaveText('Z')
    await expect(stackLabels.nth(2)).toHaveText('Y')
    await expect(stackLabels.nth(3)).toHaveText('X')
  })

  test('初期状態でスタック値が正しく表示される', async ({ page }) => {
    const stackValues = page.locator('.stack-value')

    // 初期状態では全てのスタック値が0または空であることを確認
    await expect(stackValues.nth(0)).toHaveText('')
    await expect(stackValues.nth(1)).toHaveText('')
    await expect(stackValues.nth(2)).toHaveText('')
    await expect(stackValues.nth(3)).toHaveText('')
  })

  test('数値入力時に現在入力がハイライトされる', async ({ page }) => {
    // 数値入力開始
    await page.getByRole('button', { name: '1' }).click()

    // 現在入力の要素が存在し、ハイライトされることを確認
    const currentInputItem = page.locator('.stack-item.current-input')
    await expect(currentInputItem).toBeVisible()
    await expect(currentInputItem.locator('.stack-value')).toHaveText('1')

    // 追加入力
    await page.getByRole('button', { name: '2' }).click()
    await expect(currentInputItem.locator('.stack-value')).toHaveText('12')
  })

  test('Enterキー後に現在入力のハイライトが解除される', async ({ page }) => {
    // 数値入力
    await page.getByRole('button', { name: '5' }).click()

    // 現在入力のハイライトを確認
    await expect(page.locator('.stack-item.current-input')).toBeVisible()

    // Enterキーを押す
    await page.getByRole('button', { name: 'Enter' }).click()

    // 現在入力のハイライトが解除されることを確認
    await expect(page.locator('.stack-item.current-input')).toHaveCount(0)

    // 値がスタックに移動していることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('5')
  })

  test('小数点を含む数値が正確に表示される', async ({ page }) => {
    // 小数点を含む数値入力
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: '.' }).click()
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '4' }).click()
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: '9' }).click()

    // 小数点が正確に表示されることを確認
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('3.14159')

    // Enterで確定
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('3.14159')
  })

  test('負の数値が正しく表示される', async ({ page }) => {
    // 数値入力
    await page.getByRole('button', { name: '4' }).click()
    await page.getByRole('button', { name: '2' }).click()

    // +/-ボタンで負数に変換
    await page.getByRole('button', { name: '+/-' }).click()

    // 負号が正しく表示されることを確認
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('-42')

    // Enterで確定
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('-42')
  })

  test('大きな数値が適切に表示される', async ({ page }) => {
    // EEXを使って大きな数値を入力 (1.5e6 = 1500000)
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '.' }).click()
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: 'EEX' }).click()
    await page.getByRole('button', { name: '6' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 大きな数値が適切に表示されることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('1500000')
  })

  test('ゼロの表示が正しい', async ({ page }) => {
    // ゼロを入力
    await page.getByRole('button', { name: '0' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('0')

    // 複数のゼロを入力しても先頭ゼロが削除されることを確認
    await page.getByRole('button', { name: '0' }).click()
    await page.getByRole('button', { name: '0' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('0')

    // 数値を追加すると先頭ゼロが削除される
    await page.getByRole('button', { name: '5' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('5')
  })

  test('スタックの値が正しい順序で移動する', async ({ page }) => {
    // 1, 2, 3, 4の順序で入力
    for (let i = 1; i <= 4; i++) {
      await page.getByRole('button', { name: `${i}` }).click()
      await page.getByRole('button', { name: 'Enter' }).click()
    }

    // スタックの値が正しい順序で表示されることを確認
    await expect(page.locator('.stack-item').nth(0).locator('.stack-value')).toHaveText('1') // T
    await expect(page.locator('.stack-item').nth(1).locator('.stack-value')).toHaveText('2') // Z
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('3') // Y
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('4') // X
  })

  test('スタック4レベル制限での表示が正しい', async ({ page }) => {
    // 5つの値を入力してスタック制限をテスト
    for (let i = 1; i <= 5; i++) {
      await page.getByRole('button', { name: `${i}` }).click()
      await page.getByRole('button', { name: 'Enter' }).click()
    }

    // 最新の4つの値のみが表示されることを確認
    await expect(page.locator('.stack-item').nth(0).locator('.stack-value')).toHaveText('2') // T
    await expect(page.locator('.stack-item').nth(1).locator('.stack-value')).toHaveText('3') // Z
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('4') // Y
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('5') // X
  })

  test('演算結果が正しく表示される', async ({ page }) => {
    // 計算: 15 + 25 = 40
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '+', exact: true }).click()

    // 演算結果が正しく表示されることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('40')
  })

  test('Drop操作後のスタック表示が正しい', async ({ page }) => {
    // 複数の値をスタックに積む
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // Drop操作
    await page.getByRole('button', { name: 'Drop' }).click()

    // Drop後のスタック表示が正しいことを確認
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('1') // Y
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('2') // X
  })

  test('Swap操作後のスタック表示が正しい', async ({ page }) => {
    // 2つの値をスタックに積む
    await page.getByRole('button', { name: '7' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '9' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // Swap操作前の状態確認
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('7') // Y
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('9') // X

    // Swap操作
    await page.getByRole('button', { name: 'Swap' }).click()

    // Swap後の表示が正しいことを確認
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('9') // Y
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('7') // X
  })

  test('レスポンシブデザインでの表示確認', async ({ page }) => {
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 })

    // ディスプレイ要素が正しく表示されることを確認
    const display = page.locator('.calculator-display')
    await expect(display).toBeVisible()

    // スタック項目が適切にサイズ調整されていることを確認
    const stackItems = page.locator('.stack-item')
    await expect(stackItems).toHaveCount(4)

    // タブレットサイズに変更
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(display).toBeVisible()
    await expect(stackItems).toHaveCount(4)

    // デスクトップサイズに変更
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(display).toBeVisible()
    await expect(stackItems).toHaveCount(4)
  })
})
