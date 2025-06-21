import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - Display Mode Tests', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })

  describe('Display Mode Management', () => {
    it('should initialize with decimal display mode', () => {
      expect(store.displayMode).toBe('decimal')
    })

    it('should switch to binary display mode', () => {
      store.setDisplayMode('binary')
      expect(store.displayMode).toBe('binary')
    })

    it('should switch to decimal display mode', () => {
      store.setDisplayMode('binary')
      store.setDisplayMode('decimal')
      expect(store.displayMode).toBe('decimal')
    })

    it('should toggle between decimal and binary modes', () => {
      expect(store.displayMode).toBe('decimal')

      store.toggleDisplayMode()
      expect(store.displayMode).toBe('binary')

      store.toggleDisplayMode()
      expect(store.displayMode).toBe('decimal')
    })
  })

  describe('Binary String Conversion', () => {
    it('should convert zero to binary', () => {
      expect(store.toBinaryString(0)).toBe('0b0')
    })

    it('should convert positive integers to binary', () => {
      expect(store.toBinaryString(1)).toBe('0b1')
      expect(store.toBinaryString(5)).toBe('0b101')
      expect(store.toBinaryString(10)).toBe('0b1010')
      expect(store.toBinaryString(255)).toBe('0b11111111')
    })

    it("should convert negative integers to binary (two's complement)", () => {
      expect(store.toBinaryString(-1)).toBe('0b11111111111111111111111111111111')
      expect(store.toBinaryString(-5)).toBe('0b11111111111111111111111111111011')
    })

    it('should convert decimal numbers to binary (integer part only)', () => {
      expect(store.toBinaryString(5.7)).toBe('0b101')
      expect(store.toBinaryString(10.9)).toBe('0b1010')
      expect(store.toBinaryString(-3.14)).toBe('0b11111111111111111111111111111101')
    })

    it('should handle special values', () => {
      expect(store.toBinaryString(Infinity)).toBe('Error')
      expect(store.toBinaryString(-Infinity)).toBe('Error')
      expect(store.toBinaryString(NaN)).toBe('Error')
    })

    it('should handle large numbers', () => {
      expect(store.toBinaryString(1024)).toBe('0b10000000000')
      expect(store.toBinaryString(65535)).toBe('0b1111111111111111')
    })
  })

  describe('Stack Display in Binary Mode', () => {
    beforeEach(() => {
      store.clearAll()
    })

    it('should display stack values in binary when in binary mode', () => {
      // Add some values to stack
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('10')
      store.enterNumber()
      store.inputDigit('15')
      store.enterNumber()

      // Switch to binary mode
      store.setDisplayMode('binary')

      // Check displayStack computed property
      const displayStack = store.displayStack
      expect(displayStack).toEqual([5, 10, 15])
    })

    it('should handle current input in binary mode', () => {
      // Start input
      store.inputDigit('7')
      store.setDisplayMode('binary')

      // displayStack should include current input
      const displayStack = store.displayStack
      expect(displayStack).toEqual([7])
    })

    it('should handle empty stack in binary mode', () => {
      store.setDisplayMode('binary')
      const displayStack = store.displayStack
      expect(displayStack).toEqual([])
    })

    it('should preserve stack values when switching display modes', () => {
      // Add values in decimal mode
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('10')
      store.enterNumber()

      const originalStack = [...store.stack]

      // Switch to binary mode
      store.setDisplayMode('binary')
      expect(store.stack).toEqual(originalStack)

      // Switch back to decimal mode
      store.setDisplayMode('decimal')
      expect(store.stack).toEqual(originalStack)
    })
  })

  describe('Operations in Binary Mode', () => {
    beforeEach(() => {
      store.clearAll()
    })

    it('should perform calculations correctly in binary mode', () => {
      // Switch to binary mode first
      store.setDisplayMode('binary')

      // Perform calculation: 5 + 3 = 8
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('+')

      expect(store.stack).toEqual([8])
      expect(store.displayMode).toBe('binary')
    })

    it('should handle stack operations in binary mode', () => {
      store.setDisplayMode('binary')

      // Add some values
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('10')
      store.enterNumber()
      store.inputDigit('15')
      store.enterNumber()

      expect(store.stack).toEqual([5, 10, 15])

      // Test swap operation
      store.swapStack()
      expect(store.stack).toEqual([5, 15, 10])

      // Test drop operation
      store.dropStack()
      expect(store.stack).toEqual([5, 15])
    })

    it('should handle input operations in binary mode', () => {
      store.setDisplayMode('binary')

      // Test decimal input
      store.inputDigit('3')
      store.inputDecimal()
      store.inputDigit('14')
      store.enterNumber()

      expect(store.stack).toEqual([3.14])

      // Test sign toggle
      store.inputDigit('5')
      store.toggleSign()
      store.enterNumber()

      expect(store.stack).toEqual([3.14, -5])
    })
  })

  describe('Integration Tests', () => {
    beforeEach(() => {
      store.clearAll()
    })

    it('should maintain calculation accuracy regardless of display mode', () => {
      // Perform calculation in decimal mode
      store.inputDigit('15')
      store.enterNumber()
      store.inputDigit('7')
      store.performOperation('÷')

      const decimalResult = store.stack[0]

      // Switch to binary mode
      store.setDisplayMode('binary')

      // Result should be the same
      expect(store.stack[0]).toBe(decimalResult)

      // Switch back to decimal
      store.setDisplayMode('decimal')
      expect(store.stack[0]).toBe(decimalResult)
    })

    it('should handle complex calculations with mode switching', () => {
      // Start calculation: 10 + 5 = 15
      store.inputDigit('10')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+')
      expect(store.stack).toEqual([15])

      // Switch to binary mode
      store.setDisplayMode('binary')

      // Continue calculation: 15 * 2 = 30
      store.inputDigit('2')
      store.performOperation('×')
      expect(store.stack).toEqual([30])

      // Switch back to decimal
      store.setDisplayMode('decimal')

      // Final calculation: 30 - 10 = 20
      store.inputDigit('10')
      store.performOperation('-')
      expect(store.stack).toEqual([20])
    })

    it('should handle undo operations across display mode changes', () => {
      // Perform operation in decimal mode
      store.inputDigit('8')
      store.enterNumber()
      store.inputDigit('4')
      store.performOperation('÷')
      expect(store.stack).toEqual([2])

      // Switch to binary mode
      store.setDisplayMode('binary')

      // Undo operation
      store.undoLastOperation()
      expect(store.stack).toEqual([8, 4])

      // Switch back to decimal
      store.setDisplayMode('decimal')
      expect(store.stack).toEqual([8, 4])
    })

    it('should handle EEX (scientific notation) input in binary mode', () => {
      store.setDisplayMode('binary')

      // Input 1.5e2 (150)
      store.inputDigit('1')
      store.inputDecimal()
      store.inputDigit('5')
      store.inputEEX()
      store.inputDigit('2')
      store.enterNumber()

      expect(store.stack).toEqual([150])
      expect(store.displayMode).toBe('binary')
    })

    it('should preserve display mode through clear operations', () => {
      store.setDisplayMode('binary')

      // Add some values
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('10')
      store.enterNumber()

      // Clear all
      store.clearAll()

      // Display mode should be preserved
      expect(store.displayMode).toBe('binary')
      expect(store.stack).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers in binary mode', () => {
      const largeNumber = 2147483647 // 2^31 - 1
      expect(store.toBinaryString(largeNumber)).toBe('0b1111111111111111111111111111111')
    })

    it('should handle zero division in binary mode', () => {
      store.setDisplayMode('binary')

      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('÷')

      expect(store.stack).toEqual([0])
    })

    it('should handle repeated Enter operations in binary mode', () => {
      store.setDisplayMode('binary')

      store.inputDigit('7')
      store.enterNumber()

      // Multiple Enter operations
      store.enterNumber()
      store.enterNumber()
      store.enterNumber()

      expect(store.stack).toEqual([7, 7, 7, 7])
    })
  })
})
