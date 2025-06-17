import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })

  describe('Multiplication (×) Operation', () => {
    it('should perform basic multiplication with positive numbers', () => {
      // 3 × 4 = 12
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('4')
      store.performOperation('×')

      expect(store.stack).toEqual([12])
    })

    it('should perform multiplication with positive and negative numbers', () => {
      // 3 × -4 = -12
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('4')
      store.toggleSign()
      store.performOperation('×')

      expect(store.stack).toEqual([-12])
    })

    it('should perform multiplication with negative and positive numbers', () => {
      // -3 × 4 = -12
      store.inputDigit('3')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('4')
      store.performOperation('×')

      expect(store.stack).toEqual([-12])
    })

    it('should perform multiplication with both negative numbers', () => {
      // -3 × -4 = 12
      store.inputDigit('3')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('4')
      store.toggleSign()
      store.performOperation('×')

      expect(store.stack).toEqual([12])
    })

    it('should perform multiplication with zero', () => {
      // 5 × 0 = 0
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('×')

      expect(store.stack).toEqual([0])
    })

    it('should perform multiplication with zero as first operand', () => {
      // 0 × 5 = 0
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('×')

      expect(store.stack).toEqual([0])
    })

    it('should perform multiplication with decimal numbers', () => {
      // 2.5 × 3.2 = 8.0
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('3')
      store.inputDecimal()
      store.inputDigit('2')
      store.performOperation('×')

      expect(store.stack).toEqual([8])
    })

    it('should perform multiplication with integer and decimal', () => {
      // 4 × 2.5 = 10
      store.inputDigit('4')
      store.enterNumber()
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.performOperation('×')

      expect(store.stack).toEqual([10])
    })

    it('should preserve decimal precision in multiplication', () => {
      // 1.1 × 1.1 = 1.21
      store.inputDigit('1')
      store.inputDecimal()
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('1')
      store.inputDecimal()
      store.inputDigit('1')
      store.performOperation('×')

      expect(store.stack[0]).toBeCloseTo(1.21)
    })

    it('should multiply by one (identity property)', () => {
      // 7 × 1 = 7
      store.inputDigit('7')
      store.enterNumber()
      store.inputDigit('1')
      store.performOperation('×')

      expect(store.stack).toEqual([7])
    })

    it('should multiply one by a number', () => {
      // 1 × 7 = 7
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('7')
      store.performOperation('×')

      expect(store.stack).toEqual([7])
    })

    it('should handle large number multiplication', () => {
      // 999 × 999 = 998001
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.enterNumber()
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.performOperation('×')

      expect(store.stack).toEqual([998001])
    })

    it('should handle very small number multiplication', () => {
      // 0.001 × 0.001 = 0.000001
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('1')
      store.performOperation('×')

      expect(store.stack[0]).toBeCloseTo(0.000001)
    })

    it('should follow correct RPN order (Y × X)', () => {
      // Test that 6 × 7 = 42, not 7 × 6 = 42 (same result but verify order)
      // More importantly: 10 × 2 vs 2 × 10 when order matters in context
      store.inputDigit('6')
      store.enterNumber()
      store.inputDigit('7')
      store.performOperation('×')

      expect(store.stack).toEqual([42])
    })

    it('should handle consecutive multiplications', () => {
      // 2 × 3 × 4 = 24
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('×')
      expect(store.stack).toEqual([6])

      store.inputDigit('4')
      store.performOperation('×')
      expect(store.stack).toEqual([24])
    })

    it('should do nothing with empty stack', () => {
      // No values in stack
      expect(store.stack).toEqual([])

      store.performOperation('×')
      expect(store.stack).toEqual([])
    })

    it('should do nothing with only one value in stack', () => {
      // Only one value in stack
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])

      store.performOperation('×')
      expect(store.stack).toEqual([5]) // Should remain unchanged
    })

    it('should automatically enter current input before multiplication', () => {
      // Test that current input is automatically entered
      store.inputDigit('5')
      store.enterNumber()

      // Start entering new number but don't press Enter
      store.inputDigit('6')
      expect(store.inputMode).toBe(true)
      expect(store.currentInput).toBe('6')

      // Perform multiplication - should auto-enter 6 first
      store.performOperation('×')
      expect(store.stack).toEqual([30]) // 5 × 6 = 30
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')
    })

    it('should handle area calculation', () => {
      // Calculate area: length × width
      // Example: 12 × 8 = 96
      store.inputDigit('1')
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('8')
      store.performOperation('×')

      expect(store.stack).toEqual([96])
    })

    it('should handle complex calculation with multiplication', () => {
      // Calculate: (3 + 2) × (4 + 1) = 5 × 5 = 25

      // First part: 3 + 2 = 5
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('+')
      expect(store.stack).toEqual([5])

      // Second part: 4 + 1 = 5
      store.inputDigit('4')
      store.enterNumber()
      store.inputDigit('1')
      store.performOperation('+')
      expect(store.stack).toEqual([5, 5])

      // Final multiplication: 5 × 5 = 25
      store.performOperation('×')
      expect(store.stack).toEqual([25])
    })

    it('should handle multiplication in compound calculation', () => {
      // Calculate: 2 × 3 + 4 = 10
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('×')
      expect(store.stack).toEqual([6])

      store.inputDigit('4')
      store.performOperation('+')
      expect(store.stack).toEqual([10])
    })

    it('should handle scientific notation results', () => {
      // Large multiplication that might result in scientific notation
      store.inputDigit('1')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('1')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.performOperation('×')

      expect(store.stack).toEqual([10000000000])
    })

    it('should handle fraction multiplication', () => {
      // 0.5 × 0.25 = 0.125
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('2')
      store.inputDigit('5')
      store.performOperation('×')

      expect(store.stack).toEqual([0.125])
    })
  })
})
