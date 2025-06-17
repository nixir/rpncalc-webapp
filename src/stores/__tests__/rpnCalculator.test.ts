import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - HP-style Stack Lift', () => {
  let store: ReturnType<typeof useRPNStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRPNStore()
  })

  describe('Basic Stack Operations', () => {
    it('should initialize with empty stack', () => {
      expect(store.stack).toEqual([])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })

    it('should enter a single number', () => {
      store.inputDigit('5')
      store.enterNumber()
      
      expect(store.stack).toEqual([5])
      expect(store.currentInput).toBe('')
      expect(store.inputMode).toBe(false)
    })
  })

  describe('HP-style Stack Lift', () => {
    it('should perform stack lift when entering new numbers', () => {
      // Enter first number: 3
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([3])
      
      // Enter second number: 5 (should lift stack)
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([3, 5])
      
      // Enter third number: 7 (should lift stack)
      store.inputDigit('7')
      store.enterNumber()
      expect(store.stack).toEqual([3, 5, 7])
      
      // Enter fourth number: 9 (should lift stack)
      store.inputDigit('9')
      store.enterNumber()
      expect(store.stack).toEqual([3, 5, 7, 9])
    })

    it('should limit stack to 4 levels and drop oldest value (T register)', () => {
      // Fill stack with 4 numbers
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('4')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3, 4])
      
      // Enter fifth number - should drop 1 (oldest)
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([2, 3, 4, 5])
    })

    it('should move X value to Y position on Enter (detailed stack positions)', () => {
      // Step 1: First number entry
      // Before: empty stack
      store.inputDigit('3')
      store.enterNumber()
      // After: X = 3
      expect(store.stack).toEqual([3])
      expect(store.stack[0]).toBe(3) // X register
      
      // Step 2: Second number entry  
      // Before: X = 3
      store.inputDigit('5')
      store.enterNumber()
      // After: Y = 3 (previous X), X = 5 (new value)
      expect(store.stack).toEqual([3, 5])
      expect(store.stack[0]).toBe(3) // Y register (previous X value)
      expect(store.stack[1]).toBe(5) // X register (new value)
      
      // Step 3: Third number entry
      // Before: Y = 3, X = 5
      store.inputDigit('7')
      store.enterNumber()
      // After: Z = 3, Y = 5 (previous X), X = 7 (new value)
      expect(store.stack).toEqual([3, 5, 7])
      expect(store.stack[0]).toBe(3) // Z register
      expect(store.stack[1]).toBe(5) // Y register (previous X value)
      expect(store.stack[2]).toBe(7) // X register (new value)
    })

    it('should properly shift all register positions during stack lift', () => {
      // Build up stack to demonstrate T-Z-Y-X register flow
      
      // Enter 1: X = 1
      store.inputDigit('1')
      store.enterNumber()
      expect(store.stack).toEqual([1]) // [X=1]
      
      // Enter 2: previous X→Y, new value→X
      store.inputDigit('2')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2]) // [Y=1, X=2]
      
      // Enter 3: previous values shift up, new value→X
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3]) // [Z=1, Y=2, X=3]
      
      // Enter 4: fill all 4 registers
      store.inputDigit('4')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3, 4]) // [T=1, Z=2, Y=3, X=4]
      
      // Enter 5: T drops off, all others shift up
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([2, 3, 4, 5]) // [T=2, Z=3, Y=4, X=5] (T=1 dropped)
    })

    it('should demonstrate complete T-Z-Y-X register flow with labels', () => {
      // Helper function to describe stack state
      const describeStack = (stack: number[]) => {
        const labels = ['T', 'Z', 'Y', 'X']
        return stack.map((value, index) => `${labels[labels.length - stack.length + index]}=${value}`).join(', ')
      }
      
      // Step by step register demonstration
      store.inputDigit('10')
      store.enterNumber()
      expect(describeStack(store.stack)).toBe('X=10')
      
      store.inputDigit('20')
      store.enterNumber()
      expect(describeStack(store.stack)).toBe('Y=10, X=20')
      
      store.inputDigit('30')
      store.enterNumber()
      expect(describeStack(store.stack)).toBe('Z=10, Y=20, X=30')
      
      store.inputDigit('40')
      store.enterNumber()
      expect(describeStack(store.stack)).toBe('T=10, Z=20, Y=30, X=40')
      
      store.inputDigit('50')
      store.enterNumber()
      expect(describeStack(store.stack)).toBe('T=20, Z=30, Y=40, X=50')
      
      // Verify the T register value (10) was dropped
      expect(store.stack).not.toContain(10)
      expect(store.stack).toEqual([20, 30, 40, 50])
    })

    it('should duplicate X register when Enter is pressed without input', () => {
      // Enter a number first
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([3])
      expect(store.lastOperationWasEnter).toBe(true)
      
      // Press Enter without input - should duplicate X
      store.enterNumber()
      expect(store.stack).toEqual([3, 3])
    })

    it('should allow consecutive Enter presses to duplicate values', () => {
      // Enter a number
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])
      expect(store.lastOperationWasEnter).toBe(true)
      
      // First Enter without input - should duplicate
      store.enterNumber()
      expect(store.stack).toEqual([5, 5])
      
      // Second consecutive Enter - should duplicate again
      store.enterNumber()
      expect(store.stack).toEqual([5, 5, 5])
      
      // Third consecutive Enter - should duplicate again
      store.enterNumber()
      expect(store.stack).toEqual([5, 5, 5, 5])
      
      // Fourth consecutive Enter - should drop oldest and duplicate
      store.enterNumber()
      expect(store.stack).toEqual([5, 5, 5, 5])
    })

    it('should handle consecutive Enter with mixed operations', () => {
      // Start with a calculation: 3 + 2 = 5
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('+')
      expect(store.stack).toEqual([5])
      
      // Now do consecutive Enter operations
      store.enterNumber() // First duplicate
      expect(store.stack).toEqual([5, 5])
      
      store.enterNumber() // Second duplicate  
      expect(store.stack).toEqual([5, 5, 5])
      
      // Perform multiplication: 5 * 5 = 25
      store.performOperation('×')
      expect(store.stack).toEqual([5, 25])
      
      // More consecutive Enter operations with new value
      store.enterNumber() // Duplicate 25
      expect(store.stack).toEqual([5, 25, 25])
      
      store.enterNumber() // Duplicate 25 again
      expect(store.stack).toEqual([5, 25, 25, 25])
    })

    it('should fill stack completely with consecutive Enter', () => {
      // Start with one value
      store.inputDigit('7')
      store.enterNumber()
      expect(store.stack).toEqual([7])
      
      // Fill stack with consecutive Enter
      store.enterNumber() // Y=7, X=7
      expect(store.stack).toEqual([7, 7])
      
      store.enterNumber() // Z=7, Y=7, X=7  
      expect(store.stack).toEqual([7, 7, 7])
      
      store.enterNumber() // T=7, Z=7, Y=7, X=7
      expect(store.stack).toEqual([7, 7, 7, 7])
      
      // Verify stack is full (4 levels)
      expect(store.stack.length).toBe(4)
      
      // One more Enter should maintain stack at 4 levels
      store.enterNumber()
      expect(store.stack).toEqual([7, 7, 7, 7])
      expect(store.stack.length).toBe(4)
    })
  })

  describe('Operations with Stack Lift', () => {
    it('should perform basic arithmetic with proper stack behavior', () => {
      // 3 Enter 5 +
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+')
      
      expect(store.stack).toEqual([8])
    })

    it('should handle complex calculation: 3 Enter 5 Enter * 2 /', () => {
      // 3 Enter
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([3])
      
      // 5 Enter 
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([3, 5])
      
      // * (3 * 5 = 15)
      store.performOperation('×')
      expect(store.stack).toEqual([15])
      
      // 2 / (15 / 2 = 7.5)
      store.inputDigit('2')
      store.performOperation('÷')
      expect(store.stack).toEqual([7.5])
    })

    it('should reset lastOperationWasEnter flag after operations', () => {
      store.inputDigit('3')
      store.enterNumber()
      store.inputDigit('5')
      store.enterNumber()
      
      // After operation, should allow Enter duplication again
      store.performOperation('+')
      expect(store.stack).toEqual([8])
      
      // This Enter should now duplicate
      store.enterNumber()
      expect(store.stack).toEqual([8, 8])
    })
  })

  describe('Input Mode Interactions', () => {
    it('should reset lastOperationWasEnter when starting digit input', () => {
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])
      expect(store.lastOperationWasEnter).toBe(true)
      
      // Start new input - should reset flag
      store.inputDigit('3')
      expect(store.lastOperationWasEnter).toBe(false)
      store.enterNumber()
      expect(store.stack).toEqual([5, 3])
      
      // Now Enter should duplicate (consecutive Enter is now allowed)
      store.enterNumber()
      expect(store.stack).toEqual([5, 3, 3])
    })

    it('should handle decimal input correctly with stack lift', () => {
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([0.5])
      
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([0.5, 2.5])
    })
  })

  describe('Stack Manipulation Functions', () => {
    beforeEach(() => {
      // Set up stack with 3 values
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('3')
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 3])
    })

    it('should drop X register', () => {
      store.dropStack()
      expect(store.stack).toEqual([1, 2])
    })

    it('should swap X and Y registers', () => {
      store.swapStack()
      expect(store.stack).toEqual([1, 3, 2])
    })

    it('should reset lastOperationWasEnter flag after stack operations', () => {
      // After setup, lastOperationWasEnter should be true from the last enterNumber()
      expect(store.lastOperationWasEnter).toBe(true)
      
      store.dropStack()
      expect(store.lastOperationWasEnter).toBe(false)
      
      // Now Enter should duplicate
      store.enterNumber()
      expect(store.stack).toEqual([1, 2, 2])
    })
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
      ['10', '20', '30', '40'].forEach(num => {
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

  describe('Division (÷) Operation', () => {
    it('should perform basic division with positive numbers', () => {
      // 8 ÷ 2 = 4
      store.inputDigit('8')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('÷')
      
      expect(store.stack).toEqual([4])
    })

    it('should perform division with negative and positive numbers', () => {
      // -8 ÷ 2 = -4
      store.inputDigit('8')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('÷')
      
      expect(store.stack).toEqual([-4])
    })

    it('should perform division with positive and negative numbers', () => {
      // 8 ÷ -2 = -4
      store.inputDigit('8')
      store.enterNumber()
      store.inputDigit('2')
      store.toggleSign()
      store.performOperation('÷')
      
      expect(store.stack).toEqual([-4])
    })

    it('should perform division with both negative numbers', () => {
      // -8 ÷ -2 = 4
      store.inputDigit('8')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('2')
      store.toggleSign()
      store.performOperation('÷')
      
      expect(store.stack).toEqual([4])
    })

    it('should perform division resulting in decimal', () => {
      // 5 ÷ 2 = 2.5
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('÷')
      
      expect(store.stack).toEqual([2.5])
    })

    it('should perform division with decimal numbers', () => {
      // 7.5 ÷ 2.5 = 3
      store.inputDigit('7')
      store.inputDecimal()
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('2')
      store.inputDecimal()
      store.inputDigit('5')
      store.performOperation('÷')
      
      expect(store.stack).toEqual([3])
    })

    it('should handle division by zero with positive number', () => {
      // 5 ÷ 0 = 0 (as implemented)
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('÷')
      
      expect(store.stack).toEqual([0])
    })

    it('should handle division by zero with negative number', () => {
      // -5 ÷ 0 = 0 (as implemented)
      store.inputDigit('5')
      store.toggleSign()
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('÷')
      
      expect(store.stack).toEqual([0])
    })

    it('should handle zero divided by zero', () => {
      // 0 ÷ 0 = 0 (as implemented)
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('0')
      store.performOperation('÷')
      
      expect(store.stack).toEqual([0])
    })

    it('should follow correct RPN order (Y ÷ X)', () => {
      // Test that 10 ÷ 2 = 5, not 2 ÷ 10 = 0.2
      // Stack before operation: [10, 2] (Y=10, X=2)
      // Result should be Y ÷ X = 10 ÷ 2 = 5
      
      store.inputDigit('1')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('2')
      store.performOperation('÷')
      
      expect(store.stack).toEqual([5])
    })

    it('should verify RPN order with different numbers', () => {
      // 20 ÷ 4 = 5 (not 4 ÷ 20 = 0.2)
      store.inputDigit('2')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('4')
      store.performOperation('÷')
      
      expect(store.stack).toEqual([5])
    })

    it('should handle consecutive divisions', () => {
      // 100 ÷ 10 ÷ 2 = 5
      store.inputDigit('1')
      store.inputDigit('0')
      store.inputDigit('0')
      store.enterNumber()
      store.inputDigit('1')
      store.inputDigit('0')
      store.performOperation('÷')
      expect(store.stack).toEqual([10])
      
      store.inputDigit('2')
      store.performOperation('÷')
      expect(store.stack).toEqual([5])
    })

    it('should do nothing with empty stack', () => {
      // No values in stack
      expect(store.stack).toEqual([])
      
      store.performOperation('÷')
      expect(store.stack).toEqual([])
    })

    it('should do nothing with only one value in stack', () => {
      // Only one value in stack
      store.inputDigit('5')
      store.enterNumber()
      expect(store.stack).toEqual([5])
      
      store.performOperation('÷')
      expect(store.stack).toEqual([5]) // Should remain unchanged
    })

    it('should automatically enter current input before division', () => {
      // Test that current input is automatically entered
      store.inputDigit('1')
      store.inputDigit('2')
      store.enterNumber()
      
      // Start entering new number but don't press Enter
      store.inputDigit('3')
      expect(store.inputMode).toBe(true)
      expect(store.currentInput).toBe('3')
      
      // Perform division - should auto-enter 3 first
      store.performOperation('÷')
      expect(store.stack).toEqual([4]) // 12 ÷ 3 = 4
      expect(store.inputMode).toBe(false)
      expect(store.currentInput).toBe('')
    })

    it('should handle complex calculation with division', () => {
      // Calculate: (15 + 5) ÷ (8 - 4) = 20 ÷ 4 = 5
      
      // First part: 15 + 5 = 20
      store.inputDigit('1')
      store.inputDigit('5')
      store.enterNumber()
      store.inputDigit('5')
      store.performOperation('+')
      expect(store.stack).toEqual([20])
      
      // Second part: 8 - 4 = 4
      store.inputDigit('8')
      store.enterNumber()
      store.inputDigit('4')
      store.performOperation('-')
      expect(store.stack).toEqual([20, 4])
      
      // Final division: 20 ÷ 4 = 5
      store.performOperation('÷')
      expect(store.stack).toEqual([5])
    })

    it('should handle division in real-world scenario', () => {
      // Calculate area: length × width ÷ conversion_factor
      // Example: 12 × 8 ÷ 3 = 32
      
      store.inputDigit('1')
      store.inputDigit('2')
      store.enterNumber()
      store.inputDigit('8')
      store.performOperation('×')
      expect(store.stack).toEqual([96])
      
      store.inputDigit('3')
      store.performOperation('÷')
      expect(store.stack).toEqual([32])
    })

    it('should preserve precision with decimal division', () => {
      // 1 ÷ 3 should give precise decimal result
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('3')
      store.performOperation('÷')
      
      // Should be approximately 0.3333333333333333
      expect(store.stack[0]).toBeCloseTo(0.3333333333333333)
    })

    it('should handle very small division results', () => {
      // 1 ÷ 1000000 = 0.000001
      store.inputDigit('1')
      store.enterNumber()
      store.inputDigit('1')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.inputDigit('0')
      store.performOperation('÷')
      
      expect(store.stack[0]).toBeCloseTo(0.000001)
    })
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