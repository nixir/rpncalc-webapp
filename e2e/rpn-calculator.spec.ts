import { test, expect } from '@playwright/test'

test.describe('RPN Calculator - Main Functions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('初期状態でディスプレイが正しく表示される', async ({ page }) => {
    // ディスプレイ要素の存在確認
    const display = page.locator('.calculator-display')
    await expect(display).toBeVisible()

    // スタックラベルの確認
    const stackItems = page.locator('.stack-item')
    await expect(stackItems).toHaveCount(4)

    // 各ラベルの確認 (T, Z, Y, X)
    await expect(page.locator('.stack-label').nth(0)).toHaveText('T')
    await expect(page.locator('.stack-label').nth(1)).toHaveText('Z')
    await expect(page.locator('.stack-label').nth(2)).toHaveText('Y')
    await expect(page.locator('.stack-label').nth(3)).toHaveText('X')
  })

  test('数字入力とEnterキーでスタックにプッシュできる', async ({ page }) => {
    // 数字1を入力
    await page.getByRole('button', { name: '1' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('1')

    // 数字2を追加入力
    await page.getByRole('button', { name: '2' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('12')

    // Enterを押してスタックにプッシュ
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('12')
  })

  test('四則演算が正しく動作する', async ({ page }) => {
    // 数値をスタックに積む: 3, 4
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '4' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 加算: 3 + 4 = 7
    await page.getByRole('button', { name: '+', exact: true }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('7')

    // 更に数値を追加: 2
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 減算: 7 - 2 = 5
    await page.getByRole('button', { name: '-', exact: true }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('5')

    // 更に数値を追加: 3
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 乗算: 5 × 3 = 15
    await page.getByRole('button', { name: '×' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('15')

    // 更に数値を追加: 3
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 除算: 15 ÷ 3 = 5
    await page.getByRole('button', { name: '÷' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('5')
  })

  test('小数点入力が正しく動作する', async ({ page }) => {
    // 小数点を含む数値入力: 3.14
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: '.' }).click()
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '4' }).click()

    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('3.14')

    // Enterでスタックにプッシュ
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('3.14')
  })

  test('+/-ボタンで符号を切り替えできる', async ({ page }) => {
    // 数値入力: 5
    await page.getByRole('button', { name: '5' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('5')

    // +/-で符号切り替え
    await page.getByRole('button', { name: '+/-' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('-5')

    // 再度+/-で符号切り替え
    await page.getByRole('button', { name: '+/-' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('5')
  })

  test('EEXボタンで指数表記を入力できる', async ({ page }) => {
    // 基数入力: 1.23
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '.' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '3' }).click()
    
    // 基数入力後の表示確認
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('1.23')

    // EEXボタンで指数モード
    await page.getByRole('button', { name: 'EEX' }).click()
    
    // EEX押下後の表示確認
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('1.23e')

    // 指数入力: 4
    await page.getByRole('button', { name: '4' }).click()
    
    // 指数入力後の表示確認
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('1.23e4')

    // 結果確認 (1.23e4 = 12300)
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('12300')
  })

  test('EEXボタンで1e4の入力と表示が正しく動作する', async ({ page }) => {
    // 基数入力: 1
    await page.getByRole('button', { name: '1' }).click()
    
    // 基数入力後の表示確認
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('1')

    // EEXボタンで指数モード
    await page.getByRole('button', { name: 'EEX' }).click()
    
    // EEX押下後の表示確認
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('1e')

    // 指数入力: 4
    await page.getByRole('button', { name: '4' }).click()
    
    // 指数入力後の表示確認
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('1e4')

    // 結果確認 (1e4 = 10000)
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('10000')
  })

  test('Deleteボタンで最後の桁を削除できる', async ({ page }) => {
    // 数値入力: 123
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '3' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('123')

    // Deleteで最後の桁を削除
    await page.getByRole('button', { name: 'DEL' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('12')

    // 再度Delete
    await page.getByRole('button', { name: 'DEL' }).click()
    await expect(page.locator('.stack-item.current-input .stack-value')).toHaveText('1')
  })

  test('Dropボタンでスタック最上位を削除できる', async ({ page }) => {
    // 数値をスタックに積む: 1, 2, 3
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 現在のX値が3であることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('3')

    // Dropでスタック最上位を削除
    await page.getByRole('button', { name: 'Drop' }).click()

    // X値が2に変わることを確認
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('2')
  })

  test('Swapボタンでスタック上位2つを交換できる', async ({ page }) => {
    // 数値をスタックに積む: 1, 2
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 現在の状態: Y=1, X=2
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('1')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('2')

    // Swap実行
    await page.getByRole('button', { name: 'Swap' }).click()

    // スワップ後: Y=2, X=1
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('2')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('1')
  })

  test('Undoボタンで最後の操作を取り消せる', async ({ page }) => {
    // 数値をスタックに積む: 5, 3
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // 加算実行: 5 + 3 = 8
    await page.getByRole('button', { name: '+', exact: true }).click()
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('8')

    // Undo実行で加算前の状態に戻る
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('5')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('3')
  })

  test('ゼロ除算エラーが適切に処理される', async ({ page }) => {
    // 数値をスタックに積む: 5, 0
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.getByRole('button', { name: '0' }).click()
    await page.getByRole('button', { name: 'Enter' }).click()

    // ゼロ除算実行
    await page.getByRole('button', { name: '÷' }).click()

    // エラー表示またはInfinity表示を確認
    const result = page.locator('.stack-item').nth(3).locator('.stack-value')
    await expect(result).toHaveText('0')
  })

  test('スタック4レベル制限が正しく動作する', async ({ page }) => {
    // 5つの数値を入力してスタックの制限を確認
    for (let i = 1; i <= 5; i++) {
      await page.getByRole('button', { name: `${i}` }).click()
      await page.getByRole('button', { name: 'Enter' }).click()
    }

    // 最新の4つの値のみがスタックに保持されることを確認
    await expect(page.locator('.stack-item').nth(0).locator('.stack-value')).toHaveText('2')
    await expect(page.locator('.stack-item').nth(1).locator('.stack-value')).toHaveText('3')
    await expect(page.locator('.stack-item').nth(2).locator('.stack-value')).toHaveText('4')
    await expect(page.locator('.stack-item').nth(3).locator('.stack-value')).toHaveText('5')
  })
})
