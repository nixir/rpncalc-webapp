import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })
  describe('DEL (Delete Last Digit) Functionality', () => {
    it('should delete last digit from number input', () => {
      // 123 DEL -> 12
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDigit('3')
      expect(store.currentInput).toBe('123')
      expect(store.inputMode).toBe(true)

      store.deleteLastDigit()
      expect(store.currentInput).toBe('12')
      expect(store.inputMode).toBe(true)
    })

    it('should delete last digit from decimal number', () => {
      // 12.34 DEL -> 12.3
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('3')
      store.inputDigit('4')
      expect(store.currentInput).toBe('12.34')

      store.deleteLastDigit()
      expect(store.currentInput).toBe('12.3')
      expect(store.inputMode).toBe(true)
    })

    it('should delete decimal point', () => {
      // 12. DEL -> 12
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDecimal()
      expect(store.currentInput).toBe('12.')

      store.deleteLastDigit()
      expect(store.currentInput).toBe('12')
      expect(store.inputMode).toBe(true)
    })

    it('should delete digits from negative number', () => {
      // -123 DEL -> -12
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDigit('3')
      store.toggleSign()
      expect(store.currentInput).toBe('-123')

      store.deleteLastDigit()
      expect(store.currentInput).toBe('-12')
      expect(store.inputMode).toBe(true)
    })

    it('should delete last digit and preserve negative sign', () => {
      // -5 DEL -> - (should keep just the minus sign)
      store.inputDigit('5')
      store.toggleSign()
      expect(store.currentInput).toBe('-5')

      store.deleteLastDigit()
      expect(store.currentInput).toBe('-')
      expect(store.inputMode).toBe(true)
    })

    it('should delete minus sign when only minus remains', () => {
      // - DEL -> (empty, exit input mode)
      store.inputDigit('5')
      store.toggleSign()
      store.deleteLastDigit() // Remove '5', left with '-'
      expect(store.currentInput).toBe('-')

      store.deleteLastDigit() // Remove '-'
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should exit input mode when deleting last character', () => {
      // 5 DEL -> (empty, exit input mode)
      store.inputDigit('5')
      expect(store.currentInput).toBe('5')
      expect(store.inputMode).toBe(true)

      store.deleteLastDigit()
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should do nothing when not in input mode', () => {
      // No input mode, DEL should do nothing
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')

      store.deleteLastDigit()
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')
    })

    it('should do nothing when current input is empty', () => {
      // Ensure empty input, DEL should do nothing
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)

      store.deleteLastDigit()
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should handle deleting from decimal-only input', () => {
      // 0. DEL -> 0
      store.inputDecimal()
      expect(store.currentInput).toBe('0.')
      expect(store.inputMode).toBe(true)

      store.deleteLastDigit()
      expect(store.currentInput).toBe('0')
      expect(store.inputMode).toBe(true)
    })

    it('should handle deleting all digits from decimal input', () => {
      // 0.5 DEL DEL DEL -> (empty, exit input mode)
      store.inputDecimal()
      store.inputDigit('5')
      expect(store.currentInput).toBe('0.5')

      store.deleteLastDigit() // Remove '5' -> '0.'
      expect(store.currentInput).toBe('0.')
      expect(store.inputMode).toBe(true)

      store.deleteLastDigit() // Remove '.' -> '0'
      expect(store.currentInput).toBe('0')
      expect(store.inputMode).toBe(true)

      store.deleteLastDigit() // Remove '0' -> ''
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should handle deleting from complex decimal number', () => {
      // -12.345 DEL DEL DEL -> -12
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('3')
      store.inputDigit('4')
      store.inputDigit('5')
      store.toggleSign()
      expect(store.currentInput).toBe('-12.345')

      store.deleteLastDigit() // -> -12.34
      expect(store.currentInput).toBe('-12.34')

      store.deleteLastDigit() // -> -12.3
      expect(store.currentInput).toBe('-12.3')

      store.deleteLastDigit() // -> -12.
      expect(store.currentInput).toBe('-12.')

      store.deleteLastDigit() // -> -12
      expect(store.currentInput).toBe('-12')
      expect(store.inputMode).toBe(true)
    })

    it('should not affect stack when deleting digits', () => {
      // Set up stack, then test DEL doesn't affect it
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('2')
      store.inputDigit('0')
      store.enterNumber()
      expect(store.stack).toEqual([10, 20])

      // Start new input and delete
      store.inputDigit('3')
      store.inputDigit('0')
      expect(store.currentInput).toBe('30')

      store.deleteLastDigit()
      expect(store.currentInput).toBe('3')
      expect(store.stack).toEqual([10, 20]) // Stack unchanged
    })

    it('should work correctly after operations', () => {
      // Perform operation, then test DEL on new input
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('+')
      expect(store.stack).toEqual([8])

      // Start new input
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDigit('3')
      expect(store.currentInput).toBe('123')

      store.deleteLastDigit()
      expect(store.currentInput).toBe('12')
      expect(store.stack).toEqual([8]) // Previous result preserved
    })

    it('should handle consecutive deletions', () => {
      // 12345 DEL DEL DEL DEL DEL -> (empty)
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDigit('3')
      store.inputDigit('4')
      store.inputDigit('5')
      expect(store.currentInput).toBe('12345')

      store.deleteLastDigit() // -> 1234
      store.deleteLastDigit() // -> 123
      store.deleteLastDigit() // -> 12
      store.deleteLastDigit() // -> 1
      expect(store.currentInput).toBe('1')
      expect(store.inputMode).toBe(true)

      store.deleteLastDigit() // -> empty
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should handle deletion after EEX operation', () => {
      // 3 EEX DEL -> should delete from '1000'
      store.inputDigit('3')
      store.applyEEX()
      expect(store.currentInput).toBe('1000')
      expect(store.inputMode).toBe(true)

      store.deleteLastDigit()
      expect(store.currentInput).toBe('100')
      expect(store.inputMode).toBe(true)
    })

    it('should handle deletion from very small decimal', () => {
      // 0.001 DEL -> 0.00
      store.inputDigit('0')
      store.inputDecimal()
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('1')
      expect(store.currentInput).toBe('0.001')

      store.deleteLastDigit()
      expect(store.currentInput).toBe('0.00')
      expect(store.inputMode).toBe(true)
    })

    it('should preserve input mode state correctly', () => {
      // Test that input mode is maintained correctly during deletions
      store.inputDigit('1')
      store.inputDigit('2')
      expect(store.inputMode).toBe(true)

      store.deleteLastDigit()
      expect(store.inputMode).toBe(true) // Still in input mode

      store.deleteLastDigit()
      expect(store.inputMode).toBe(false) // Exited input mode

      // Additional deletions should not crash or change state
      store.deleteLastDigit()
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')
    })

    it('should work correctly with toggleSign after deletion', () => {
      // Test sign toggle after deletion
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDigit('3')
      store.deleteLastDigit() // -> 12
      expect(store.currentInput).toBe('12')

      store.toggleSign()
      expect(store.currentInput).toBe('-12')

      store.deleteLastDigit() // -> -1
      expect(store.currentInput).toBe('-1')
    })

    it('should handle edge case with leading zeros', () => {
      // 000123 DEL -> 00012
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDigit('3')
      expect(store.currentInput).toBe('000123')

      store.deleteLastDigit()
      expect(store.currentInput).toBe('00012')
      expect(store.inputMode).toBe(true)
    })
  })
})
