import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })

  describe('Addition (+) Operation', () => {
    it('should perform basic addition with positive numbers', () => {
      // 3 + 5 = 8
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+')

      expect(store.stack).toEqual([8])
    })

    it('should perform addition with positive and negative numbers', () => {
      // 10 + (-3) = 7
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('3')
      store.toggleSign()
      store.performOperation('+')

      expect(store.stack).toEqual([7])
    })

    it('should perform addition with negative and positive numbers', () => {
      // -10 + 3 = -7
      store.inputDigit('1')
      store.inputDigit('0')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('+')

      expect(store.stack).toEqual([-7])
    })

    it('should perform addition with both negative numbers', () => {
      // -5 + (-3) = -8
      store.inputDigit('5')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('3')
      store.toggleSign()
      store.performOperation('+')

      expect(store.stack).toEqual([-8])
    })

    it('should perform addition with decimal numbers', () => {
      // 2.5 + 3.7 = 6.2
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('3')
      store.inputDecimal()
      store.inputDigit('7')
      store.performOperation('+')

      expect(store.stack[0]).toBeCloseTo(6.2)
    })

    it('should perform addition with integer and decimal', () => {
      // 5 + 2.5 = 7.5
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.performOperation('+')

      expect(store.stack).toEqual([7.5])
    })

    it('should perform addition with decimal and integer', () => {
      // 3.5 + 4 = 7.5
      store.inputDigit('3')
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('4')
      store.performOperation('+')

      expect(store.stack).toEqual([7.5])
    })

    it('should add zero to a number (additive identity)', () => {
      // 5 + 0 = 5
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('+')

      expect(store.stack).toEqual([5])
    })

    it('should add a number to zero', () => {
      // 0 + 5 = 5
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+')

      expect(store.stack).toEqual([5])
    })

    it('should add same positive numbers', () => {
      // 7 + 7 = 14
      store.inputDigit('7')
      store.enterNumber()
      store.inputDigit('7')
      store.performOperation('+')

      expect(store.stack).toEqual([14])
    })

    it('should add opposite numbers (result zero)', () => {
      // 5 + (-5) = 0
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('5')
      store.toggleSign()
      store.performOperation('+')

      expect(store.stack).toEqual([0])
    })

    it('should demonstrate commutative property (Y + X = X + Y conceptually)', () => {
      // While RPN order is Y + X, addition is commutative so 3 + 5 = 8
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+')
      expect(store.stack).toEqual([8])

      // Reset and try reverse order (5 + 3 should also equal 8)
      store.clearAll()
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('+')
      expect(store.stack).toEqual([8])
    })

    it('should handle consecutive additions', () => {
      // 2 + 3 + 4 = 9
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('+')
      expect(store.stack).toEqual([5])

      store.inputDigit('4')
      store.performOperation('+')
      expect(store.stack).toEqual([9])
    })

    it('should handle multiple consecutive additions', () => {
      // 1 + 2 + 3 + 4 = 10
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('+')
      expect(store.stack).toEqual([3])

      store.inputDigit('3')
      store.performOperation('+')
      expect(store.stack).toEqual([6])

      store.inputDigit('4')
      store.performOperation('+')
      expect(store.stack).toEqual([10])
    })

    it('should handle large number addition', () => {
      // 999999 + 1 = 1000000
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.enterNumber()
      store.inputDigit('1')
      store.performOperation('+')

      expect(store.stack).toEqual([1000000])
    })

    it('should handle very small number addition', () => {
      // 0.000001 + 0.000002 = 0.000003
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('2')
      store.performOperation('+')

      expect(store.stack[0]).toBeCloseTo(0.000003)
    })

    it('should do nothing with empty stack', () => {
      // No values in stack
      expect(store.stack).toEqual([])

      store.performOperation('+')
      expect(store.stack).toEqual([])
    })

    it('should do nothing with only one value in stack', () => {
      // Only one value in stack
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])

      store.performOperation('+')
      expect(store.stack).toEqual([5]) // Should remain unchanged
    })

    it('should automatically enter current input before addition', () => {
      // Test that current input is automatically entered
      store.inputDigit('7')
      store.enterNumber()

      // Start entering new number but don't press Enter
      store.inputDigit('3')
      expect(store.inputMode).toBe(true)
      expect(store.currentInput).toBe('3')

      // Perform addition - should auto-enter 3 first
      store.performOperation('+')
      expect(store.stack).toEqual([10]) // 7 + 3 = 10
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')
    })

    it('should handle sum calculation', () => {
      // Calculate sum of multiple values: 12 + 8 + 5 = 25
      store.inputDigit('1')
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('8')
      store.performOperation('+')
      expect(store.stack).toEqual([20])

      store.inputDigit('5')
      store.performOperation('+')
      expect(store.stack).toEqual([25])
    })

    it('should handle complex calculation with addition', () => {
      // Calculate: (3 × 2) + (4 × 5) = 6 + 20 = 26

      // First part: 3 × 2 = 6
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('×')
      expect(store.stack).toEqual([6])

      // Second part: 4 × 5 = 20
      store.inputDigit('4')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('×')
      expect(store.stack).toEqual([6, 20])

      // Final addition: 6 + 20 = 26
      store.performOperation('+')
      expect(store.stack).toEqual([26])
    })

    it('should handle addition in compound calculation', () => {
      // Calculate: 5 + 3 × 2 = 5 + 6 = 11 (RPN order)
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('×')
      expect(store.stack).toEqual([5, 6])

      store.performOperation('+')
      expect(store.stack).toEqual([11])
    })

    it('should preserve precision with decimal addition', () => {
      // 0.1 + 0.2 should handle floating point precision
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('2')
      store.performOperation('+')

      expect(store.stack[0]).toBeCloseTo(0.3)
    })

    it('should handle running total calculation', () => {
      // Running total: start with 100, add 25, add 50, add 10 = 185
      store.inputDigit('1')
      store.inputDigit('0')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('2')
      store.inputDigit('5')
      store.performOperation('+')
      expect(store.stack).toEqual([125])

      store.inputDigit('5')
      store.inputDigit('0')
      store.performOperation('+')
      expect(store.stack).toEqual([175])

      store.inputDigit('1')
      store.inputDigit('0')
      store.performOperation('+')
      expect(store.stack).toEqual([185])
    })

    it('should handle score calculation', () => {
      // Calculate total score: 85 + 92 + 78 = 255
      store.inputDigit('8')
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('9')
      store.inputDigit('2')
      store.performOperation('+')
      expect(store.stack).toEqual([177])

      store.inputDigit('7')
      store.inputDigit('8')
      store.performOperation('+')
      expect(store.stack).toEqual([255])
    })

    it('should handle negative and positive balance calculation', () => {
      // Balance calculation: -50 + 100 + (-25) + 75 = 100
      store.inputDigit('5')
      store.inputDigit('0')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('1')
      store.inputDigit('0')
      store.inputDigit('0')
      store.performOperation('+')
      expect(store.stack).toEqual([50])

      store.inputDigit('2')
      store.inputDigit('5')
      store.toggleSign()
      store.performOperation('+')
      expect(store.stack).toEqual([25])

      store.inputDigit('7')
      store.inputDigit('5')
      store.performOperation('+')
      expect(store.stack).toEqual([100])
    })

    it('should handle addition with very large numbers', () => {
      // Test scientific notation handling
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.enterNumber()
      store.inputDigit('1')
      store.performOperation('+')

      expect(store.stack).toEqual([1000000000])
    })
  })
})
