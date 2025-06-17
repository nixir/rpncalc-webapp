import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })

  describe('EEX (Enter Exponent) Functionality', () => {
    it('should convert positive integer to power of 10', () => {
      // 3 EEX -> 10^3 = 1000
      store.inputDigit('3')
      expect(store.currentInput).toBe('3')
      expect(store.inputMode).toBe(true)

      store.applyEEX()
      expect(store.currentInput).toBe('1000')
      expect(store.inputMode).toBe(true)
    })

    it('should convert zero to 1 (10^0)', () => {
      // 0 EEX -> 10^0 = 1
      store.inputDigit('0')
      store.applyEEX()
      expect(store.currentInput).toBe('1')
    })

    it('should convert negative integer to small decimal', () => {
      // -3 EEX -> 10^(-3) = 0.001
      store.inputDigit('3')
      store.toggleSign()
      expect(store.currentInput).toBe('-3')

      store.applyEEX()
      expect(store.currentInput).toBe('0.001')
    })

    it('should handle EEX with decimal exponents', () => {
      // 2.5 EEX -> 10^2.5 ≈ 316.227766
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      expect(store.currentInput).toBe('2.5')

      store.applyEEX()
      const result = parseFloat(store.currentInput)
      expect(result).toBeCloseTo(316.227766, 5)
    })

    it('should handle EEX with negative decimal exponents', () => {
      // -2.5 EEX -> 10^(-2.5) ≈ 0.00316227766
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.toggleSign()
      expect(store.currentInput).toBe('-2.5')

      store.applyEEX()
      const result = parseFloat(store.currentInput)
      expect(result).toBeCloseTo(0.00316227766, 8)
    })

    it('should handle large positive exponents', () => {
      // 6 EEX -> 10^6 = 1000000
      store.inputDigit('6')
      store.applyEEX()
      expect(store.currentInput).toBe('1000000')
    })

    it('should handle large negative exponents', () => {
      // -6 EEX -> 10^(-6) = 0.000001
      store.inputDigit('6')
      store.toggleSign()
      store.applyEEX()
      expect(store.currentInput).toBe('0.000001')
    })

    it('should do nothing when not in input mode', () => {
      // No input entered, not in input mode
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')

      store.applyEEX()
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')
    })

    it('should do nothing when current input is empty', () => {
      // Start input mode but delete all content
      store.inputDigit('5')
      store.deleteLastDigit()
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')

      store.applyEEX()
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')
    })

    it('should handle EEX followed by Enter', () => {
      // 2 EEX Enter -> should push 100 to stack
      store.inputDigit('2')
      store.applyEEX()
      expect(store.currentInput).toBe('100')

      store.enterNumber()
      expect(store.stack).toEqual([100])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should work in calculations', () => {
      // Calculate: 3 EEX + 1 = 1000 + 1 = 1001
      store.inputDigit('3')
      store.applyEEX()
      expect(store.currentInput).toBe('1000')

      store.enterNumber()
      store.inputDigit('1')
      store.performOperation('+')
      expect(store.stack).toEqual([1001])
    })

    it('should handle consecutive EEX operations', () => {
      // 2 EEX EEX -> 10^2 = 100, then 10^100 (very large number)
      store.inputDigit('2')
      store.applyEEX()
      expect(store.currentInput).toBe('100')

      // Apply EEX again: 10^100
      store.applyEEX()
      const result = parseFloat(store.currentInput)
      expect(result).toBe(Math.pow(10, 100))
    })

    it('should handle EEX with fractional results', () => {
      // 0.5 EEX -> 10^0.5 ≈ 3.162277660168379
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('5')
      store.applyEEX()

      const result = parseFloat(store.currentInput)
      expect(result).toBeCloseTo(3.162277660168379, 10)
    })

    it('should handle EEX with very small fractional exponents', () => {
      // 0.1 EEX -> 10^0.1 ≈ 1.2589254117941673
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('1')
      store.applyEEX()

      const result = parseFloat(store.currentInput)
      expect(result).toBeCloseTo(1.2589254117941673, 10)
    })

    it('should handle EEX in scientific calculation workflow', () => {
      // Simulate: 6.02 × 10^23 (Avogadro's number)
      // Input: 6.02 Enter 23 EEX × = 6.02 × 10^23

      store.inputDigit('6')
      store.inputDecimal()
      store.inputDigit('0')
      store.inputDigit('2')
      store.enterNumber()
      expect(store.stack).toEqual([6.02])

      store.inputDigit('2')
      store.inputDigit('3')
      store.applyEEX()
      // Very large numbers are displayed in scientific notation
      expect(store.currentInput).toBe('1e+23')

      store.performOperation('×')
      expect(store.stack[0]).toBeCloseTo(6.02e23, -18) // Very large number comparison
    })

    it('should preserve input mode after EEX operation', () => {
      // EEX should keep the calculator in input mode for further editing
      store.inputDigit('1')
      expect(store.inputMode).toBe(true)

      store.applyEEX()
      expect(store.inputMode).toBe(true)
      expect(store.currentInput).toBe('10')

      // Should be able to continue editing (though this might not be typical usage)
      store.inputDigit('5')
      expect(store.currentInput).toBe('105')
    })

    it('should handle EEX with stack operations', () => {
      // Test EEX in context of stack manipulation
      // 1 Enter 2 EEX Swap -> should have 100 in Y and 1 in X

      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.applyEEX()
      store.enterNumber()
      expect(store.stack).toEqual([1, 100])

      store.swapStack()
      expect(store.stack).toEqual([100, 1])
    })

    it('should handle edge case with negative zero', () => {
      // -0 EEX -> should still result in 1 (10^-0 = 10^0 = 1)
      store.inputDigit('0')
      store.toggleSign()
      expect(store.currentInput).toBe('-0')

      store.applyEEX()
      expect(store.currentInput).toBe('1')
    })

    it('should handle very large exponents gracefully', () => {
      // 10 EEX -> 10^10 = 10000000000
      store.inputDigit('1')
      store.inputDigit('0')
      store.applyEEX()
      expect(store.currentInput).toBe('10000000000')
    })
  })

  describe('Real-world HP Calculator Scenarios', () => {
    it('should handle classic HP example: 15 Enter 7 - 2 /', () => {
      // 15 Enter
      store.inputDigit('1')
      store.inputDigit('5')
      store.enterNumber()

      // 7 -  (15 - 7 = 8)
      store.inputDigit('7')
      store.performOperation('-')
      expect(store.stack).toEqual([8])

      // 2 /  (8 / 2 = 4)
      store.inputDigit('2')
      store.performOperation('÷')
      expect(store.stack).toEqual([4])
    })

    it('should handle Enter key for intermediate calculations', () => {
      // Calculate (3 + 5) * (7 - 2)
      // Method: 3 Enter 5 + 7 Enter 2 - *

      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+')
      expect(store.stack).toEqual([8]) // 3 + 5 = 8

      store.inputDigit('7')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('-')
      expect(store.stack).toEqual([8, 5]) // 7 - 2 = 5, with 8 still in Y

      store.performOperation('×')
      expect(store.stack).toEqual([40]) // 8 * 5 = 40
    })

    it('should handle calculations with negative numbers', () => {
      // Calculate: -15 + 20 - 3 = 2

      // Enter -15
      store.inputDigit('1')
      store.inputDigit('5')
      store.toggleSign()
      store.enterNumber()
      expect(store.stack).toEqual([-15])

      // Add 20: -15 + 20 = 5
      store.inputDigit('2')
      store.inputDigit('0')
      store.performOperation('+')
      expect(store.stack).toEqual([5])

      // Subtract 3: 5 - 3 = 2
      store.inputDigit('3')
      store.performOperation('-')
      expect(store.stack).toEqual([2])
    })
  })
})
