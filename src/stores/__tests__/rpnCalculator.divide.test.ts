import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })

  describe('Division (÷) Operation', () => {
    it('should perform basic division with positive numbers', () => {
      // 8 ÷ 2 = 4
      store.inputDigit('8')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('÷')

      expect(store.stack).toEqual([4])
    })

    it('should perform division with negative and positive numbers', () => {
      // -8 ÷ 2 = -4
      store.inputDigit('8')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('÷')

      expect(store.stack).toEqual([-4])
    })

    it('should perform division with positive and negative numbers', () => {
      // 8 ÷ -2 = -4
      store.inputDigit('8')
      store.enterNumber()
      store.inputDigit('2')
      store.toggleSign()
      store.performOperation('÷')

      expect(store.stack).toEqual([-4])
    })

    it('should perform division with both negative numbers', () => {
      // -8 ÷ -2 = 4
      store.inputDigit('8')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('2')
      store.toggleSign()
      store.performOperation('÷')

      expect(store.stack).toEqual([4])
    })

    it('should perform division resulting in decimal', () => {
      // 5 ÷ 2 = 2.5
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('÷')

      expect(store.stack).toEqual([2.5])
    })

    it('should perform division with decimal numbers', () => {
      // 7.5 ÷ 2.5 = 3
      store.inputDigit('7')
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.performOperation('÷')

      expect(store.stack).toEqual([3])
    })

    it('should handle division by zero with positive number', () => {
      // 5 ÷ 0 = 0 (as implemented)
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('÷')

      expect(store.stack).toEqual([0])
    })

    it('should handle division by zero with negative number', () => {
      // -5 ÷ 0 = 0 (as implemented)
      store.inputDigit('5')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('÷')

      expect(store.stack).toEqual([0])
    })

    it('should handle zero divided by zero', () => {
      // 0 ÷ 0 = 0 (as implemented)
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('÷')

      expect(store.stack).toEqual([0])
    })

    it('should follow correct RPN order (Y ÷ X)', () => {
      // Test that 10 ÷ 2 = 5, not 2 ÷ 10 = 0.2
      // Stack before operation: [10, 2] (Y=10, X=2)
      // Result should be Y ÷ X = 10 ÷ 2 = 5

      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('÷')

      expect(store.stack).toEqual([5])
    })

    it('should verify RPN order with different numbers', () => {
      // 20 ÷ 4 = 5 (not 4 ÷ 20 = 0.2)
      store.inputDigit('2')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('4')
      store.performOperation('÷')

      expect(store.stack).toEqual([5])
    })

    it('should handle consecutive divisions', () => {
      // 100 ÷ 10 ÷ 2 = 5
      store.inputDigit('1')
      store.inputDigit('0')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('1')
      store.inputDigit('0')
      store.performOperation('÷')
      expect(store.stack).toEqual([10])

      store.inputDigit('2')
      store.performOperation('÷')
      expect(store.stack).toEqual([5])
    })

    it('should do nothing with empty stack', () => {
      // No values in stack
      expect(store.stack).toEqual([])

      store.performOperation('÷')
      expect(store.stack).toEqual([])
    })

    it('should do nothing with only one value in stack', () => {
      // Only one value in stack
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])

      store.performOperation('÷')
      expect(store.stack).toEqual([5]) // Should remain unchanged
    })

    it('should automatically enter current input before division', () => {
      // Test that current input is automatically entered
      store.inputDigit('1')
      store.inputDigit('2')
      store.enterNumber()

      // Start entering new number but don't press Enter
      store.inputDigit('3')
      expect(store.inputMode).toBe(true)
      expect(store.currentInput).toBe('3')

      // Perform division - should auto-enter 3 first
      store.performOperation('÷')
      expect(store.stack).toEqual([4]) // 12 ÷ 3 = 4
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')
    })

    it('should handle complex calculation with division', () => {
      // Calculate: (15 + 5) ÷ (8 - 4) = 20 ÷ 4 = 5

      // First part: 15 + 5 = 20
      store.inputDigit('1')
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+')
      expect(store.stack).toEqual([20])

      // Second part: 8 - 4 = 4
      store.inputDigit('8')
      store.enterNumber()
      store.inputDigit('4')
      store.performOperation('-')
      expect(store.stack).toEqual([20, 4])

      // Final division: 20 ÷ 4 = 5
      store.performOperation('÷')
      expect(store.stack).toEqual([5])
    })

    it('should handle division in real-world scenario', () => {
      // Calculate area: length × width ÷ conversion_factor
      // Example: 12 × 8 ÷ 3 = 32

      store.inputDigit('1')
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('8')
      store.performOperation('×')
      expect(store.stack).toEqual([96])

      store.inputDigit('3')
      store.performOperation('÷')
      expect(store.stack).toEqual([32])
    })

    it('should preserve precision with decimal division', () => {
      // 1 ÷ 3 should give precise decimal result
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('÷')

      // Should be approximately 0.3333333333333333
      expect(store.stack[0]).toBeCloseTo(0.3333333333333333)
    })

    it('should handle very small division results', () => {
      // 1 ÷ 1000000 = 0.000001
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('1')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.performOperation('÷')

      expect(store.stack[0]).toBeCloseTo(0.000001)
    })
  })
})
