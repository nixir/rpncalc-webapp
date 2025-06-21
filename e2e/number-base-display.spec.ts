import { test, expect } from '@playwright/test'

test.describe('RPN Calculator - Number Base Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('初期状態ではDECキーがアクティブである', async ({ page }) => {
    // DECボタンがアクティブ状態で表示されることを確認
    const decButton = page.getByRole('button', { name: 'DEC' })
    await expect(decButton).toHaveClass(/active/)
    
    // 他のボタンはアクティブでないことを確認
    await expect(page.getByRole('button', { name: 'BIN' })).not.toHaveClass(/active/)
    await expect(page.getByRole('button', { name: 'OCT' })).not.toHaveClass(/active/)
    await expect(page.getByRole('button', { name: 'HEX' })).not.toHaveClass(/active/)
  })

  test('BINキーを押すと二進数表示に切り替わる', async ({ page }) => {
    // 数値をスタックに入力: 15
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // BINキーをクリック
    await page.getByRole('button', { name: 'BIN' }).click()

    // BINボタンがアクティブになることを確認
    await expect(page.getByRole('button', { name: 'BIN' })).toHaveClass(/active/)
    await expect(page.getByRole('button', { name: 'DEC' })).not.toHaveClass(/active/)

    // 15が二進数(0b1111)で表示されることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0b1111')
  })

  test('OCTキーを押すと八進数表示に切り替わる', async ({ page }) => {
    // 数値をスタックに入力: 64
    await page.getByRole('button', { name: '6' }).click()
    await page.getByRole('button', { name: '4' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // OCTキーをクリック
    await page.getByRole('button', { name: 'OCT' }).click()

    // OCTボタンがアクティブになることを確認
    await expect(page.getByRole('button', { name: 'OCT' })).toHaveClass(/active/)
    await expect(page.getByRole('button', { name: 'DEC' })).not.toHaveClass(/active/)

    // 64が八進数(0o100)で表示されることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0o100')
  })

  test('DECキーを押すと十進数表示に切り替わる', async ({ page }) => {
    // まず二進数表示にする
    await page.getByRole('button', { name: 'BIN' }).click()
    
    // 数値をスタックに入力: 42
    await page.getByRole('button', { name: '4' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // DECキーをクリック
    await page.getByRole('button', { name: 'DEC' }).click()

    // DECボタンがアクティブになることを確認
    await expect(page.getByRole('button', { name: 'DEC' })).toHaveClass(/active/)
    await expect(page.getByRole('button', { name: 'BIN' })).not.toHaveClass(/active/)

    // 42が十進数で表示されることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('42')
  })

  test('HEXキーを押すと十六進数表示に切り替わる', async ({ page }) => {
    // 数値をスタックに入力: 255
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // HEXキーをクリック
    await page.getByRole('button', { name: 'HEX' }).click()

    // HEXボタンがアクティブになることを確認
    await expect(page.getByRole('button', { name: 'HEX' })).toHaveClass(/active/)
    await expect(page.getByRole('button', { name: 'DEC' })).not.toHaveClass(/active/)

    // 255が十六進数(0xFF)で表示されることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0xFF')
  })

  test('複数の数値に対して表示モードが正しく適用される', async ({ page }) => {
    // 複数の数値をスタックに積む: 8, 16, 32
    await page.getByRole('button', { name: '8' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '6' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 二進数表示に切り替え
    await page.getByRole('button', { name: 'BIN' }).click()

    // すべての値が二進数で表示されることを確認
    await expect(page.locator('.stack-item').nth(1).locator('.stack-value')).toHaveText('0b1000')  // 8
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('0b10000') // 16
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0b100000') // 32
  })

  test('十六進数表示で大文字が正しく表示される', async ({ page }) => {
    // 数値をスタックに入力: 2748 (0xABC)
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '7' }).click()
    await page.getByRole('button', { name: '4' }).click()
    await page.getByRole('button', { name: '8' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // HEXキーをクリック
    await page.getByRole('button', { name: 'HEX' }).click()

    // 十六進数で大文字のA, B, Cが正しく表示されることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0xABC')
  })

  test('負の数値の表示モード切り替えが正しく動作する', async ({ page }) => {
    // 負の数値をスタックに入力: -8
    await page.getByRole('button', { name: '8' }).click()
    await page.getByRole('button', { name: '+/-' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 十進数表示での確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('-8')

    // 二進数表示に切り替え
    await page.getByRole('button', { name: 'BIN' }).click()

    // 負の数値が正しく二進数表示されることを確認 (2の補数表現)
    const stackValue = page.locator('.stack-item').nth(3).locator('.stack-value')
    await expect(stackValue).toHaveText('0b11111111111111111111111111111000')
  })

  test('ゼロの表示モード切り替えが正しく動作する', async ({ page }) => {
    // ゼロをスタックに入力
    await page.getByRole('button', { name: '0' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 各表示モードでゼロが正しく表示されることを確認
    await page.getByRole('button', { name: 'BIN' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0b0')

    await page.getByRole('button', { name: 'OCT' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0o0')

    await page.getByRole('button', { name: 'HEX' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0x0')

    await page.getByRole('button', { name: 'DEC' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0')
  })

  test('表示モード切り替え後も計算機能が正常に動作する', async ({ page }) => {
    // 数値をスタックに積む: 12, 8
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '8' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 二進数表示に切り替え
    await page.getByRole('button', { name: 'BIN' }).click()

    // 加算実行: 12 + 8 = 20
    await page.getByRole('button', { name: '+', exact: true }).click()

    // 結果が二進数で表示されることを確認 (20 = 0b10100)
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0b10100')

    // 十進数表示に戻して確認
    await page.getByRole('button', { name: 'DEC' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('20')
  })

  test('小数を含む数値は整数部分のみが変換される', async ({ page }) => {
    // 小数を含む数値をスタックに入力: 15.7
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: '.' }).click()
    await page.getByRole('button', { name: '7' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 二進数表示に切り替え
    await page.getByRole('button', { name: 'BIN' }).click()

    // 整数部分(15)のみが二進数変換されることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0b1111')

    // 十進数表示に戻すと元の値が表示される
    await page.getByRole('button', { name: 'DEC' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('15.7')
  })

  test('表示モードボタンの連続クリックで切り替わる', async ({ page }) => {
    // 数値をスタックに入力: 100
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '0' }).click()
    await page.getByRole('button', { name: '0' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // DEC → BIN → OCT → HEX → DEC の順で切り替え
    await expect(page.getByRole('button', { name: 'DEC' })).toHaveClass(/active/)
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('100')

    await page.getByRole('button', { name: 'BIN' }).click()
    await expect(page.getByRole('button', { name: 'BIN' })).toHaveClass(/active/)
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0b1100100')

    await page.getByRole('button', { name: 'OCT' }).click()
    await expect(page.getByRole('button', { name: 'OCT' })).toHaveClass(/active/)
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0o144')

    await page.getByRole('button', { name: 'HEX' }).click()
    await expect(page.getByRole('button', { name: 'HEX' })).toHaveClass(/active/)
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('0x64')

    await page.getByRole('button', { name: 'DEC' }).click()
    await expect(page.getByRole('button', { name: 'DEC' })).toHaveClass(/active/)
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('100')
  })
})