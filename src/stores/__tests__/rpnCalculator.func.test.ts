import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })

  describe('Drop Stack Operation - Comprehensive Tests', () => {
    beforeEach(() => {
      store.clearAll()
    })

    it('should handle drop on empty stack (no-op)', () => {
      expect(store.stack).toEqual([])
      store.dropStack()
      expect(store.stack).toEqual([])
      expect(store.lastOperationWasEnter).toBe(false)
    })

    it('should drop single value from stack', () => {
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])

      store.dropStack()
      expect(store.stack).toEqual([])
      expect(store.lastOperationWasEnter).toBe(false)
    })

    it('should drop X register and preserve Y, Z, T registers', () => {
      // Create full 4-level stack [T=1, Z=2, Y=3, X=4]
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('4')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3, 4])

      // Drop X register (4)
      store.dropStack()
      expect(store.stack).toEqual([1, 2, 3])
      expect(store.lastOperationWasEnter).toBe(false)
    })

    it('should handle consecutive drop operations', () => {
      // Set up stack [1, 2, 3]
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3])

      // First drop: [1, 2, 3] -> [1, 2]
      store.dropStack()
      expect(store.stack).toEqual([1, 2])

      // Second drop: [1, 2] -> [1]
      store.dropStack()
      expect(store.stack).toEqual([1])

      // Third drop: [1] -> []
      store.dropStack()
      expect(store.stack).toEqual([])

      // Fourth drop on empty stack: [] -> []
      store.dropStack()
      expect(store.stack).toEqual([])
    })

    it('should drop while in input mode', () => {
      // Set up stack with entered value
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])

      // Start new input but don't enter
      store.inputDigit('7')
      expect(store.inputMode).toBe(true)
      expect(store.currentInput).toBe('7')

      // Drop should remove the entered value (5), not affect current input
      store.dropStack()
      expect(store.stack).toEqual([])
      expect(store.inputMode).toBe(true)
      expect(store.currentInput).toBe('7')
      expect(store.lastOperationWasEnter).toBe(false)
    })

    it('should save drop operation to history', () => {
      store.inputDigit('5')
      store.enterNumber()
      const initialHistoryLength = store.history.length

      store.dropStack()

      expect(store.history.length).toBe(initialHistoryLength + 1)
      const lastHistoryItem = store.history[store.history.length - 1]
      expect(lastHistoryItem.type).toBe('stack_operation')
      expect(lastHistoryItem.operation).toBe('drop')
      expect(lastHistoryItem.previousStack).toEqual([5])
    })

    it('should correctly restore stack after undoing drop operation', () => {
      // Set up stack [1, 2, 3]
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3])

      // Drop X register
      store.dropStack()
      expect(store.stack).toEqual([1, 2])

      // Undo drop operation
      store.undoLastOperation()
      expect(store.stack).toEqual([1, 2, 3])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should handle drop operation with precise register positions', () => {
      // Create specific T-Z-Y-X configuration: [T=10, Z=20, Y=30, X=40]
      ;['10', '20', '30', '40'].forEach((num) => {
        store.inputDigit(num)
        store.enterNumber()
      })
      expect(store.stack).toEqual([10, 20, 30, 40])

      // Drop X register (40)
      store.dropStack()
      expect(store.stack).toEqual([10, 20, 30])

      // Verify T, Z, Y registers maintain their values
      // After drop: T=10, Z=20, Y=30 (X is gone)
      expect(store.stack[0]).toBe(10) // T register
      expect(store.stack[1]).toBe(20) // Z register
      expect(store.stack[2]).toBe(30) // Y register
    })

    it('should reset lastOperationWasEnter flag after drop', () => {
      store.inputDigit('5')
      store.enterNumber()
      expect(store.lastOperationWasEnter).toBe(true)

      store.dropStack()
      expect(store.lastOperationWasEnter).toBe(false)

      // Subsequent Enter should not duplicate since stack is empty
      store.enterNumber()
      expect(store.stack).toEqual([])
    })

    it('should work correctly after drop when adding new numbers', () => {
      // Set up [1, 2, 3]
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()

      // Drop to get [1, 2]
      store.dropStack()
      expect(store.stack).toEqual([1, 2])

      // Add new number
      store.inputDigit('9')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 9])
    })

    it('should maintain stack integrity during mixed operations with drop', () => {
      // Complex scenario: operations mixed with drops
      store.inputDigit('10')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+') // 10 + 5 = 15
      expect(store.stack).toEqual([15])

      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([15, 3])

      store.dropStack() // Remove 3
      expect(store.stack).toEqual([15])

      store.inputDigit('7')
      store.performOperation('×') // 15 × 7 = 105
      expect(store.stack).toEqual([105])
    })
  })

  describe('Edge Cases', () => {
    it('should handle Enter on empty stack', () => {
      store.enterNumber()
      expect(store.stack).toEqual([])
    })

    it('should handle operations with insufficient stack', () => {
      store.inputDigit('5')
      store.performOperation('+')
      // Should not crash, stack should be unchanged
      expect(store.stack).toEqual([5])
    })

    it('should handle division by zero', () => {
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('÷')
      expect(store.stack).toEqual([0])
    })
  })
})
