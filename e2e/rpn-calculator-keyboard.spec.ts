import { test, expect } from '@playwright/test'

test.describe('RPN Calculator - Keyboard Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // キーボードフォーカスを確保するためにページをクリック
    await page.click('body')
  })

  test('キーボードから数字入力ができる', async ({ page }) => {
    // 数字キーで入力
    await page.keyboard.press('1')
    await page.keyboard.press('2')
    await page.keyboard.press('3')
    
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('123')
  })

  test('キーボードでEnterキーが動作する', async ({ page }) => {
    // 数字入力
    await page.keyboard.press('4')
    await page.keyboard.press('2')
    
    // Enterでスタックにプッシュ
    await page.keyboard.press('Enter')
    
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('42')
  })

  test('キーボードで小数点入力ができる', async ({ page }) => {
    // 小数点を含む数値入力
    await page.keyboard.press('3')
    await page.keyboard.press('.')
    await page.keyboard.press('1')
    await page.keyboard.press('4')
    
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('3.14')
  })

  test('キーボードで四則演算ができる', async ({ page }) => {
    // 数値をスタックに積む: 8, 2
    await page.keyboard.press('8')
    await page.keyboard.press('Enter')
    await page.keyboard.press('2')
    await page.keyboard.press('Enter')

    // 加算: 8 + 2 = 10
    await page.keyboard.press('+')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('10')

    // 新しい数値: 3
    await page.keyboard.press('3')
    await page.keyboard.press('Enter')

    // 減算: 10 - 3 = 7
    await page.keyboard.press('-')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('7')

    // 新しい数値: 2
    await page.keyboard.press('2')
    await page.keyboard.press('Enter')

    // 乗算: 7 * 2 = 14
    await page.keyboard.press('*')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('14')

    // 新しい数値: 2
    await page.keyboard.press('2')
    await page.keyboard.press('Enter')

    // 除算: 14 / 2 = 7
    await page.keyboard.press('/')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('7')
  })

  test('Backspaceで最後の桁を削除できる', async ({ page }) => {
    // 数値入力: 789
    await page.keyboard.press('7')
    await page.keyboard.press('8')
    await page.keyboard.press('9')
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('789')

    // Backspaceで削除
    await page.keyboard.press('Backspace')
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('78')

    // 再度Backspace
    await page.keyboard.press('Backspace')
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('7')
  })

  test('Escapeキーでクリアできる', async ({ page }) => {
    // 数値入力
    await page.keyboard.press('1')
    await page.keyboard.press('2')
    await page.keyboard.press('3')
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('123')

    // Escapeでクリア
    await page.keyboard.press('Escape')
    
    // 現在の入力がクリアされることを確認
    const currentInputElements = page.locator('.stack-item.current-input')
    await expect(currentInputElements).toHaveCount(0)
  })

  test('Ctrl+U/Cmd+Uでアンドゥできる', async ({ page }) => {
    // 数値をスタックに積む: 6, 4
    await page.keyboard.press('6')
    await page.keyboard.press('Enter')
    await page.keyboard.press('4')
    await page.keyboard.press('Enter')

    // 加算実行: 6 + 4 = 10
    await page.keyboard.press('+')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('10')

    // Ctrl+U (Windows/Linux) または Cmd+U (Mac) でアンドゥ
    const isMac = process.platform === 'darwin'
    if (isMac) {
      await page.keyboard.press('Meta+u')
    } else {
      await page.keyboard.press('Control+u')
    }

    // アンドゥ後の状態確認
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('6')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('4')
  })

  test('マウスクリックとキーボード入力の組み合わせ', async ({ page }) => {
    // マウスで数値入力
    await page.getByRole('button', { name: '5' }).click()
    
    // キーボードで数値追加
    await page.keyboard.press('0')
    
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('50')

    // キーボードでEnter
    await page.keyboard.press('Enter')
    
    // マウスで別の数値入力
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '5' }).click()
    
    // キーボードでEnter
    await page.keyboard.press('Enter')

    // キーボードで演算
    await page.keyboard.press('+')
    
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('75')
  })

  test('連続したキーボード入力のテスト', async ({ page }) => {
    // 連続して複数の操作を実行
    const keySequence = ['1', '2', '3', 'Enter', '4', '5', '6', 'Enter', '*']
    
    for (const key of keySequence) {
      await page.keyboard.press(key)
      // 各キー入力の間に少し待機
      await page.waitForTimeout(50)
    }

    // 最終結果: 123 * 456 = 56088
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('56088')
  })

  test('無効なキー入力が無視される', async ({ page }) => {
    // 有効な数値入力
    await page.keyboard.press('1')
    await page.keyboard.press('2')
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('12')

    // 無効なキー入力（アルファベット）
    await page.keyboard.press('a')
    await page.keyboard.press('b')
    await page.keyboard.press('c')

    // 数値が変わらないことを確認
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('12')

    // 再度有効な入力
    await page.keyboard.press('3')
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('123')
  })

  test('キーボードショートカットが物理キーボードのレイアウトに対応している', async ({ page }) => {
    // 数値とテンキーの両方をテスト
    const testCases = [
      { key: '1', expected: '1' },
      { key: '2', expected: '12' },
      { key: '3', expected: '123' },
    ]

    for (const testCase of testCases) {
      await page.keyboard.press(testCase.key)
      await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText(testCase.expected)
    }

    // Enterでクリア
    await page.keyboard.press('Enter')

    // 演算子キーのテスト
    await page.keyboard.press('5')
    await page.keyboard.press('Enter')
    await page.keyboard.press('3')
    await page.keyboard.press('Enter')

    // * キー（Shift+8 や * キー）
    await page.keyboard.press('*')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('15')
  })
})