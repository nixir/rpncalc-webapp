import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })

  describe('Undo Functionality', () => {
    it('should undo arithmetic operations', () => {
      // Perform operation: 5 + 3 = 8
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('+')
      expect(store.stack).toEqual([8])
      expect(store.history.length).toBe(3) // enter + auto-enter + operation

      // Undo should restore previous state (undo the +)
      store.undoLastOperation()
      expect(store.stack).toEqual([5, 3])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
      expect(store.history.length).toBe(2)
    })

    it('should undo stack operations (Enter)', () => {
      // Enter number: 5 Enter
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])
      expect(store.history.length).toBe(1)

      // Undo should restore to input state
      store.undoLastOperation()
      expect(store.stack).toEqual([])
      expect(store.currentInput).toBe('5')
      expect(store.inputMode).toBe(true)
      expect(store.history.length).toBe(0)
    })

    it('should undo Enter duplication', () => {
      // Set up: 5 Enter Enter (duplicate)
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])

      store.enterNumber() // Duplicate
      expect(store.stack).toEqual([5, 5])
      expect(store.history.length).toBe(2)

      // Undo the duplication
      store.undoLastOperation()
      expect(store.stack).toEqual([5])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should undo drop stack operation', () => {
      // Set up stack: 1, 2, 3
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3])

      // Drop last value
      store.dropStack()
      expect(store.stack).toEqual([1, 2])

      // Undo drop
      store.undoLastOperation()
      expect(store.stack).toEqual([1, 2, 3])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should undo swap stack operation', () => {
      // Set up stack: 1, 2, 3
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3])

      // Swap X and Y
      store.swapStack()
      expect(store.stack).toEqual([1, 3, 2])

      // Undo swap
      store.undoLastOperation()
      expect(store.stack).toEqual([1, 2, 3])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should undo multiple operations in sequence', () => {
      // Sequence: 5 Enter 3 + 2 *
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('+') // 5 + 3 = 8
      expect(store.stack).toEqual([8])

      store.inputDigit('2')
      store.performOperation('×') // 8 * 2 = 16
      expect(store.stack).toEqual([16])
      expect(store.history.length).toBe(5) // enter, enter(auto), +, enter(auto), ×

      // Undo multiplication
      store.undoLastOperation()
      expect(store.stack).toEqual([8, 2])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)

      // Undo auto-enter of 2
      store.undoLastOperation()
      expect(store.stack).toEqual([8])
      expect(store.currentInput).toBe('2')
      expect(store.inputMode).toBe(true)

      // Undo addition
      store.undoLastOperation()
      expect(store.stack).toEqual([5, 3])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should do nothing when history is empty', () => {
      // Start with empty state
      expect(store.stack).toEqual([])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
      expect(store.history.length).toBe(0)

      // Undo should do nothing
      store.undoLastOperation()
      expect(store.stack).toEqual([])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
      expect(store.history.length).toBe(0)
    })

    it('should undo complex calculation sequence', () => {
      // Calculate: (3 + 2) * 4 = 20
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('+') // 5
      expect(store.stack).toEqual([5])

      store.inputDigit('4')
      store.performOperation('×') // 20
      expect(store.stack).toEqual([20])

      // Undo step by step
      store.undoLastOperation() // Undo ×
      expect(store.stack).toEqual([5, 4])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)

      store.undoLastOperation() // Undo auto-enter of 4
      expect(store.stack).toEqual([5])
      expect(store.currentInput).toBe('4')
      expect(store.inputMode).toBe(true)

      store.undoLastOperation() // Undo +
      expect(store.stack).toEqual([3, 2])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should undo with negative numbers', () => {
      // Test with negative number: -5 Enter 3 -
      store.inputDigit('5')
      store.toggleSign()
      store.enterNumber()
      expect(store.stack).toEqual([-5])

      store.inputDigit('3')
      store.performOperation('-') // -5 - 3 = -8
      expect(store.stack).toEqual([-8])

      // Undo subtraction
      store.undoLastOperation()
      expect(store.stack).toEqual([-5, 3])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)

      // Undo auto-enter of 3
      store.undoLastOperation()
      expect(store.stack).toEqual([-5])
      expect(store.currentInput).toBe('3')
      expect(store.inputMode).toBe(true)
    })

    it('should undo with decimal numbers', () => {
      // Test with decimals: 3.14 Enter 2.5 +
      store.inputDigit('3')
      store.inputDecimal()
      store.inputDigit('1')
      store.inputDigit('4')
      store.enterNumber()
      expect(store.stack).toEqual([3.14])

      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.performOperation('+') // 3.14 + 2.5 = 5.64
      expect(store.stack[0]).toBeCloseTo(5.64)

      // Undo addition
      store.undoLastOperation()
      expect(store.stack).toEqual([3.14, 2.5])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should undo division operations', () => {
      // Test division: 10 Enter 2 ÷
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('÷') // 10 ÷ 2 = 5
      expect(store.stack).toEqual([5])

      // Undo division
      store.undoLastOperation()
      expect(store.stack).toEqual([10, 2])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should undo operations with stack lift', () => {
      // Test stack lift: 1 Enter 2 Enter 3 Enter 4 +
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('4')
      store.performOperation('+') // 3 + 4 = 7, stack: [1, 2, 7]
      expect(store.stack).toEqual([1, 2, 7])

      // Undo addition
      store.undoLastOperation()
      expect(store.stack).toEqual([1, 2, 3, 4])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should reset lastOperationWasEnter flag after undo', () => {
      // Enter a number
      store.inputDigit('5')
      store.enterNumber()
      expect(store.lastOperationWasEnter).toBe(true)

      // Undo should reset the flag
      store.undoLastOperation()
      expect(store.lastOperationWasEnter).toBe(false)
    })

    it('should undo after EEX operation', () => {
      // Apply EEX: 3 EEX Enter (1000)
      store.inputDigit('3')
      store.applyEEX()
      expect(store.currentInput).toBe('1000')

      store.enterNumber()
      expect(store.stack).toEqual([1000])

      // Undo enter
      store.undoLastOperation()
      expect(store.stack).toEqual([])
      expect(store.currentInput).toBe('1000')
      expect(store.inputMode).toBe(true)
    })

    it('should handle undo with input during operation', () => {
      // Test auto-enter during operation: 5 Enter 3 (no Enter) +
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('3')
      // Don't press Enter, operation will auto-enter
      store.performOperation('+') // Auto-enters 3, then 5 + 3 = 8
      expect(store.stack).toEqual([8])

      // Undo should restore to before operation
      store.undoLastOperation()
      expect(store.stack).toEqual([5, 3])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should undo stack operations preserving exact state', () => {
      // Complex state: input partially entered
      store.inputDigit('1')
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('3')
      expect(store.currentInput).toBe('12.3')

      store.enterNumber()
      expect(store.stack).toEqual([12.3])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)

      // Undo should restore exact input state
      store.undoLastOperation()
      expect(store.stack).toEqual([])
      expect(store.currentInput).toBe('12.3')
      expect(store.inputMode).toBe(true)
    })

    it('should maintain history limit during undo operations', () => {
      // Create some operations (stack limited to 4 levels)
      for (let i = 1; i <= 5; i++) {
        store.inputDigit(i.toString())
        store.enterNumber()
      }
      expect(store.stack).toEqual([2, 3, 4, 5]) // 1 drops off due to 4-level limit
      expect(store.history.length).toBe(5)

      // Undo one operation - restores to state before last enter
      store.undoLastOperation()
      expect(store.history.length).toBe(4)
      expect(store.stack).toEqual([1, 2, 3, 4]) // History restores original stack state
      expect(store.currentInput).toBe('5')
      expect(store.inputMode).toBe(true)

      // History should decrease properly
      store.undoLastOperation()
      expect(store.history.length).toBe(3)
      expect(store.stack).toEqual([1, 2, 3])
      expect(store.currentInput).toBe('4')
      expect(store.inputMode).toBe(true)
    })

    it('should undo after drop operation with empty input', () => {
      // Set up: 5 Enter, then drop
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)

      store.dropStack()
      expect(store.stack).toEqual([])

      // Undo drop
      store.undoLastOperation()
      expect(store.stack).toEqual([5])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should undo swap with exact register positions', () => {
      // Test precise stack positions: T=1, Z=2, Y=3, X=4
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('4')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3, 4])

      // Swap X and Y: should become [1, 2, 4, 3]
      store.swapStack()
      expect(store.stack).toEqual([1, 2, 4, 3])

      // Undo swap: should restore [1, 2, 3, 4]
      store.undoLastOperation()
      expect(store.stack).toEqual([1, 2, 3, 4])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })
  })
})
