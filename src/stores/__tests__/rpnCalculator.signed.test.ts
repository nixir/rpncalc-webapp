import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })
  describe('Toggle Sign (+/-) Functionality', () => {
    it('should add minus sign to positive number input', () => {
      store.inputDigit('5')
      expect(store.currentInput).toBe('5')
      expect(store.inputMode).toBe(true)

      store.toggleSign()
      expect(store.currentInput).toBe('-5')
      expect(store.inputMode).toBe(true)
    })

    it('should remove minus sign from negative number input', () => {
      store.inputDigit('5')
      store.toggleSign()
      expect(store.currentInput).toBe('-5')

      store.toggleSign()
      expect(store.currentInput).toBe('5')
    })

    it('should do nothing when not in input mode', () => {
      // No current input
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')

      store.toggleSign()
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should do nothing with empty input string', () => {
      // Start input mode but don't enter anything
      store.inputDecimal() // This starts input mode with "0."
      store.deleteLastDigit() // Remove the "."
      store.deleteLastDigit() // Remove the "0"
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')

      store.toggleSign()
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should work with decimal numbers', () => {
      store.inputDigit('3')
      store.inputDecimal()
      store.inputDigit('1')
      store.inputDigit('4')
      expect(store.currentInput).toBe('3.14')

      store.toggleSign()
      expect(store.currentInput).toBe('-3.14')

      store.toggleSign()
      expect(store.currentInput).toBe('3.14')
    })

    it('should work with zero', () => {
      store.inputDigit('0')
      expect(store.currentInput).toBe('0')

      store.toggleSign()
      expect(store.currentInput).toBe('-0')

      store.toggleSign()
      expect(store.currentInput).toBe('0')
    })

    it('should work with decimal point only', () => {
      store.inputDecimal()
      expect(store.currentInput).toBe('0.')

      store.toggleSign()
      expect(store.currentInput).toBe('-0.')

      store.toggleSign()
      expect(store.currentInput).toBe('0.')
    })

    it('should allow multiple consecutive toggles', () => {
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDigit('3')
      expect(store.currentInput).toBe('123')

      // Multiple toggles
      store.toggleSign()
      expect(store.currentInput).toBe('-123')

      store.toggleSign()
      expect(store.currentInput).toBe('123')

      store.toggleSign()
      expect(store.currentInput).toBe('-123')

      store.toggleSign()
      expect(store.currentInput).toBe('123')
    })

    it('should enter negative numbers into stack correctly', () => {
      store.inputDigit('7')
      store.toggleSign()
      expect(store.currentInput).toBe('-7')

      store.enterNumber()
      expect(store.stack).toEqual([-7])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should perform calculations with negative numbers', () => {
      // Enter positive number
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      expect(store.stack).toEqual([10])

      // Enter negative number
      store.inputDigit('3')
      store.toggleSign()
      expect(store.currentInput).toBe('-3')

      // Add: 10 + (-3) = 7
      store.performOperation('+')
      expect(store.stack).toEqual([7])
    })

    it('should handle negative number operations', () => {
      // Enter negative number: -5
      store.inputDigit('5')
      store.toggleSign()
      store.enterNumber()
      expect(store.stack).toEqual([-5])

      // Enter positive number: 8
      store.inputDigit('8')
      store.enterNumber()
      expect(store.stack).toEqual([-5, 8])

      // Subtract: -5 - 8 = -13
      store.performOperation('-')
      expect(store.stack).toEqual([-13])
    })

    it('should work with sign change during decimal input', () => {
      store.inputDigit('2')
      store.inputDecimal()
      expect(store.currentInput).toBe('2.')

      store.toggleSign()
      expect(store.currentInput).toBe('-2.')

      store.inputDigit('5')
      expect(store.currentInput).toBe('-2.5')

      store.toggleSign()
      expect(store.currentInput).toBe('2.5')

      store.enterNumber()
      expect(store.stack).toEqual([2.5])
    })

    it('should preserve sign after additional digit input', () => {
      store.inputDigit('1')
      store.toggleSign()
      expect(store.currentInput).toBe('-1')

      // Continue entering digits
      store.inputDigit('2')
      store.inputDigit('3')
      expect(store.currentInput).toBe('-123')

      store.enterNumber()
      expect(store.stack).toEqual([-123])
    })
  })
})
