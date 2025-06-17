import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })
  describe('Subtraction (-) Operation', () => {
    it('should perform basic subtraction with positive numbers', () => {
      // 10 - 3 = 7
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('-')

      expect(store.stack).toEqual([7])
    })

    it('should perform subtraction with positive number and negative number', () => {
      // 10 - (-3) = 13
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('3')
      store.toggleSign()
      store.performOperation('-')

      expect(store.stack).toEqual([13])
    })

    it('should perform subtraction with negative number and positive number', () => {
      // -10 - 3 = -13
      store.inputDigit('1')
      store.inputDigit('0')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('-')

      expect(store.stack).toEqual([-13])
    })

    it('should perform subtraction with both negative numbers', () => {
      // -10 - (-3) = -7
      store.inputDigit('1')
      store.inputDigit('0')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('3')
      store.toggleSign()
      store.performOperation('-')

      expect(store.stack).toEqual([-7])
    })

    it('should perform subtraction with decimal numbers', () => {
      // 5.5 - 2.3 = 3.2
      store.inputDigit('5')
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('3')
      store.performOperation('-')

      expect(store.stack[0]).toBeCloseTo(3.2)
    })

    it('should perform subtraction with integer and decimal', () => {
      // 10 - 2.5 = 7.5
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.performOperation('-')

      expect(store.stack).toEqual([7.5])
    })

    it('should perform subtraction with decimal and integer', () => {
      // 7.5 - 2 = 5.5
      store.inputDigit('7')
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('-')

      expect(store.stack).toEqual([5.5])
    })

    it('should subtract from zero', () => {
      // 0 - 5 = -5
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('-')

      expect(store.stack).toEqual([-5])
    })

    it('should subtract zero from a number', () => {
      // 5 - 0 = 5
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('-')

      expect(store.stack).toEqual([5])
    })

    it('should subtract same numbers (result zero)', () => {
      // 5 - 5 = 0
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('-')

      expect(store.stack).toEqual([0])
    })

    it('should follow correct RPN order (Y - X)', () => {
      // Critical test: 10 - 3 = 7 (not 3 - 10 = -7)
      // Stack before operation: [10, 3] (Y=10, X=3)
      // Result should be Y - X = 10 - 3 = 7
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('-')

      expect(store.stack).toEqual([7])
    })

    it('should verify RPN order with different numbers', () => {
      // 20 - 8 = 12 (not 8 - 20 = -12)
      store.inputDigit('2')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('8')
      store.performOperation('-')

      expect(store.stack).toEqual([12])
    })

    it('should demonstrate order importance with negative result', () => {
      // 5 - 10 = -5 (order matters)
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('1')
      store.inputDigit('0')
      store.performOperation('-')

      expect(store.stack).toEqual([-5])
    })

    it('should handle consecutive subtractions', () => {
      // 20 - 5 - 3 = 12
      store.inputDigit('2')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('-')
      expect(store.stack).toEqual([15])

      store.inputDigit('3')
      store.performOperation('-')
      expect(store.stack).toEqual([12])
    })

    it('should handle consecutive subtractions with different order', () => {
      // Show how RPN handles: (10 - 3) - 2 = 5
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('-')
      expect(store.stack).toEqual([7])

      store.inputDigit('2')
      store.performOperation('-')
      expect(store.stack).toEqual([5])
    })

    it('should do nothing with empty stack', () => {
      // No values in stack
      expect(store.stack).toEqual([])

      store.performOperation('-')
      expect(store.stack).toEqual([])
    })

    it('should do nothing with only one value in stack', () => {
      // Only one value in stack
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])

      store.performOperation('-')
      expect(store.stack).toEqual([5]) // Should remain unchanged
    })

    it('should automatically enter current input before subtraction', () => {
      // Test that current input is automatically entered
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()

      // Start entering new number but don't press Enter
      store.inputDigit('3')
      expect(store.inputMode).toBe(true)
      expect(store.currentInput).toBe('3')

      // Perform subtraction - should auto-enter 3 first
      store.performOperation('-')
      expect(store.stack).toEqual([7]) // 10 - 3 = 7
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')
    })

    it('should handle temperature difference calculation', () => {
      // High temp - Low temp = difference
      // Example: 25°C - 18°C = 7°C difference
      store.inputDigit('2')
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('1')
      store.inputDigit('8')
      store.performOperation('-')

      expect(store.stack).toEqual([7])
    })

    it('should handle complex calculation with subtraction', () => {
      // Calculate: (15 + 5) - (8 - 3) = 20 - 5 = 15

      // First part: 15 + 5 = 20
      store.inputDigit('1')
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+')
      expect(store.stack).toEqual([20])

      // Second part: 8 - 3 = 5
      store.inputDigit('8')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('-')
      expect(store.stack).toEqual([20, 5])

      // Final subtraction: 20 - 5 = 15
      store.performOperation('-')
      expect(store.stack).toEqual([15])
    })

    it('should handle subtraction in compound calculation', () => {
      // Calculate: 20 - 3 × 2 = 20 - 6 = 14 (RPN order)
      // Note: In RPN this becomes: 3 2 × 20 swap - or 20 3 2 × -

      store.inputDigit('2')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('×')
      expect(store.stack).toEqual([20, 6])

      store.performOperation('-')
      expect(store.stack).toEqual([14])
    })

    it('should preserve precision with decimal subtraction', () => {
      // 1.1 - 0.1 should handle floating point precision
      store.inputDigit('1')
      store.inputDecimal()
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('1')
      store.performOperation('-')

      expect(store.stack[0]).toBeCloseTo(1.0)
    })

    it('should handle very small number subtraction', () => {
      // 0.000001 - 0.0000001 = 0.0000009
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
      store.inputDigit('0')
      store.inputDigit('1')
      store.performOperation('-')

      expect(store.stack[0]).toBeCloseTo(0.0000009)
    })

    it('should handle large number subtraction', () => {
      // 1000000 - 999999 = 1
      store.inputDigit('1')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.inputDigit('9')
      store.performOperation('-')

      expect(store.stack).toEqual([1])
    })

    it('should handle age difference calculation', () => {
      // Older age - Younger age = age difference
      // Example: 45 - 23 = 22 years difference
      store.inputDigit('4')
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('2')
      store.inputDigit('3')
      store.performOperation('-')

      expect(store.stack).toEqual([22])
    })
  })
})
