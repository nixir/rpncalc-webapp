import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - EEX Scientific Notation', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })

  describe('EEX (Enter Exponent) Scientific Notation Functionality', () => {
    it('should enter EEX mode and display scientific notation', () => {
      // 1.23 EEX 4 -> should display "1.23e4"
      store.inputDigit('1')
      store.inputDecimal()
      store.inputDigit('2')
      store.inputDigit('3')
      expect(store.currentInput).toBe('1.23')
      expect(store.eexMode).toBe(false)

      store.inputEEX()
      expect(store.eexMode).toBe(true)
      expect(store.exponent).toBe('')
      expect(store.currentDisplay).toBe('1.23e')

      store.inputDigit('4')
      expect(store.exponent).toBe('4')
      expect(store.currentDisplay).toBe('1.23e4')
    })

    it('should convert scientific notation to decimal on enter', () => {
      // 1.23e4 Enter -> should push 12300 to stack
      store.inputDigit('1')
      store.inputDecimal()
      store.inputDigit('2')
      store.inputDigit('3')
      store.inputEEX()
      store.inputDigit('4')

      store.enterNumber()
      expect(store.stack).toEqual([12300])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
      expect(store.eexMode).toBe(false)
    })

    it('should handle negative exponents', () => {
      // 5.6e-3 -> 0.0056
      store.inputDigit('5')
      store.inputDecimal()
      store.inputDigit('6')
      store.inputEEX()
      store.inputDigit('3')
      store.toggleSign()
      expect(store.currentDisplay).toBe('5.6e-3')

      store.enterNumber()
      expect(store.stack).toEqual([0.0056])
    })

    it('should handle integer mantissa with positive exponent', () => {
      // 2e10 -> 20000000000
      store.inputDigit('2')
      store.inputEEX()
      store.inputDigit('1')
      store.inputDigit('0')
      expect(store.currentDisplay).toBe('2e10')

      store.enterNumber()
      expect(store.stack).toEqual([20000000000])
    })

    it('should handle zero exponent', () => {
      // 3.14e0 -> 3.14
      store.inputDigit('3')
      store.inputDecimal()
      store.inputDigit('1')
      store.inputDigit('4')
      store.inputEEX()
      store.inputDigit('0')

      store.enterNumber()
      expect(store.stack).toEqual([3.14])
    })

    it('should handle EEX from non-input mode', () => {
      // EEX from non-input mode should start with "1e"
      expect(store.inputMode).toBe(false)

      store.inputEEX()
      expect(store.inputMode).toBe(true)
      expect(store.eexMode).toBe(true)
      expect(store.currentInput).toBe('1')
      expect(store.currentDisplay).toBe('1e')
    })

    it('should not allow decimal point in exponent', () => {
      // Try to input decimal in exponent (should be ignored)
      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('2')
      expect(store.exponent).toBe('2')

      store.inputDecimal() // Should be ignored in EEX mode
      expect(store.exponent).toBe('2')
      expect(store.currentDisplay).toBe('1e2')
    })

    it('should handle delete in EEX mode', () => {
      // Test deleting in exponent
      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('2')
      store.inputDigit('3')
      expect(store.exponent).toBe('23')

      store.deleteLastDigit()
      expect(store.exponent).toBe('2')
      expect(store.currentDisplay).toBe('1e2')

      store.deleteLastDigit()
      expect(store.exponent).toBe('')
      expect(store.currentDisplay).toBe('1e')

      // Deleting from empty exponent should exit EEX mode
      store.deleteLastDigit()
      expect(store.eexMode).toBe(false)
      expect(store.currentDisplay).toBe('1')
    })

    it('should handle sign toggle in EEX mode', () => {
      // Test toggling sign in exponent
      store.inputDigit('2')
      store.inputEEX()
      store.inputDigit('5')
      expect(store.currentDisplay).toBe('2e5')

      store.toggleSign()
      expect(store.currentDisplay).toBe('2e-5')

      store.toggleSign()
      expect(store.currentDisplay).toBe('2e5')
    })

    it('should work with calculations', () => {
      // Calculate: 1e3 + 1e2 = 1000 + 100 = 1100
      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([1000])

      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('2')
      store.performOperation('+')
      expect(store.stack).toEqual([1100])
    })

    it('should handle very large numbers', () => {
      // 1e20 -> 1e20 (very large number)
      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('2')
      store.inputDigit('0')

      store.enterNumber()
      expect(store.stack).toEqual([1e20])
    })

    it('should handle very small numbers', () => {
      // 1e-20 -> 1e-20 (very small number)
      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('2')
      store.inputDigit('0')
      store.toggleSign()

      store.enterNumber()
      expect(store.stack).toEqual([1e-20])
    })

    it('should reset EEX mode on clear all', () => {
      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('2')
      expect(store.eexMode).toBe(true)

      store.clearAll()
      expect(store.eexMode).toBe(false)
      expect(store.exponent).toBe('')
    })

    it('should handle EEX with performance operation without explicit enter', () => {
      // 1e3 + 500 = 1000 + 500 = 1500
      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('3')
      expect(store.currentDisplay).toBe('1e3')
      expect(store.eexMode).toBe(true)

      store.enterNumber()
      expect(store.stack).toEqual([1000]) // 1e3 should be auto-entered
      expect(store.eexMode).toBe(false) // Should exit EEX mode when starting new number

      store.inputDigit('5')
      expect(store.currentInput).toBe('5')

      store.inputDigit('0')
      store.inputDigit('0')
      expect(store.currentInput).toBe('500')

      store.performOperation('+')
      expect(store.stack).toEqual([1500])
    })

    it('should handle consecutive EEX operations', () => {
      // 1e2 Enter, then 2e3 -> should have [100, 2000] in stack
      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('2')
      store.enterNumber()
      expect(store.stack).toEqual([100])

      store.inputDigit('2')
      store.inputEEX()
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([100, 2000])
    })

    it('should handle scientific notation with fractional mantissa', () => {
      // 0.123e4 -> 1230
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDigit('3')
      store.inputEEX()
      store.inputDigit('4')

      store.enterNumber()
      expect(store.stack).toEqual([1230])
    })
  })

  describe('Real-world Scientific Notation Scenarios', () => {
    it('should handle Avogadro number calculation', () => {
      // 6.02e23 (Avogadro's number)
      store.inputDigit('6')
      store.inputDecimal()
      store.inputDigit('0')
      store.inputDigit('2')
      store.inputEEX()
      store.inputDigit('2')
      store.inputDigit('3')

      store.enterNumber()
      expect(store.stack[0]).toBeCloseTo(6.02e23, -18)
    })

    it('should handle speed of light calculation', () => {
      // 3e8 m/s (speed of light approximation)
      store.inputDigit('3')
      store.inputEEX()
      store.inputDigit('8')

      store.enterNumber()
      expect(store.stack).toEqual([300000000])
    })

    it('should handle electron mass calculation', () => {
      // 9.11e-31 kg (electron mass approximation)
      store.inputDigit('9')
      store.inputDecimal()
      store.inputDigit('1')
      store.inputDigit('1')
      store.inputEEX()
      store.inputDigit('3')
      store.inputDigit('1')
      store.toggleSign()

      store.enterNumber()
      expect(store.stack[0]).toBeCloseTo(9.11e-31, -40)
    })
  })
})
