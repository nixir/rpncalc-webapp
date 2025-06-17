import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRPNStore } from '../rpnCalculator'

describe('RPN Calculator Store - Basic Operations', () => {
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