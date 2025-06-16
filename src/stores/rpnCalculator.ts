import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { HistoryItem } from '@/types/calculator'

export const useRPNStore = defineStore('rpnCalculator', () => {
  // State
  const stack = ref<number[]>([])
  const currentInput = ref<string>('')
  const inputMode = ref<boolean>(false)
  const history = ref<HistoryItem[]>([])
  const lastOperationWasEnter = ref<boolean>(false)

  // Helper function for HP-style stack lift
  const liftStack = () => {
    // Limit stack to 4 levels (T, Z, Y, X)
    if (stack.value.length >= 4) {
      stack.value = stack.value.slice(1) // Remove T (oldest value)
    }
  }

  // Computed
  const displayStack = computed(() => {
    const result = [...stack.value]
    if (inputMode.value && currentInput.value) {
      result.push(parseFloat(currentInput.value) || 0)
    }
    
    // Ensure we show up to 4 items, with newest at bottom
    return result.slice(-4)
  })

  const currentDisplay = computed(() => {
    if (inputMode.value && currentInput.value) {
      return currentInput.value
    }
    return stack.value.length > 0 ? stack.value[stack.value.length - 1].toString() : '0'
  })

  // Helper function to save history
  const saveToHistory = (type: 'operation' | 'stack_operation', operation?: string) => {
    history.value.push({
      type,
      previousStack: [...stack.value],
      previousInput: currentInput.value,
      operation
    })
    
    // Keep only last 50 history items
    if (history.value.length > 50) {
      history.value.shift()
    }
  }

  // Actions
  const inputDigit = (digit: string) => {
    lastOperationWasEnter.value = false
    if (!inputMode.value) {
      currentInput.value = digit
      inputMode.value = true
    } else {
      currentInput.value += digit
    }
  }

  const inputDecimal = () => {
    lastOperationWasEnter.value = false
    if (!inputMode.value) {
      currentInput.value = '0.'
      inputMode.value = true
    } else if (!currentInput.value.includes('.')) {
      currentInput.value += '.'
    }
  }

  const enterNumber = () => {
    if (inputMode.value && currentInput.value !== '') {
      // New number input: perform stack lift and push new number
      const number = parseFloat(currentInput.value)
      if (!isNaN(number)) {
        saveToHistory('stack_operation', 'enter')
        liftStack()
        stack.value.push(number)
        currentInput.value = ''
        inputMode.value = false
        lastOperationWasEnter.value = true
      }
    } else if (!inputMode.value && stack.value.length > 0) {
      // No input but stack has values: always duplicate X register (allow consecutive Enter)
      saveToHistory('stack_operation', 'enter_duplicate')
      const xValue = stack.value[stack.value.length - 1]
      liftStack()
      stack.value.push(xValue)
      lastOperationWasEnter.value = true
    }
  }

  const performOperation = (operation: string) => {
    // Ensure current input is entered first
    if (inputMode.value && currentInput.value) {
      enterNumber()
    }

    if (stack.value.length < 2) return

    saveToHistory('operation', operation)

    const b = stack.value.pop()!
    const a = stack.value.pop()!
    let result: number

    switch (operation) {
      case '+':
        result = a + b
        break
      case '-':
        result = a - b
        break
      case '×':
        result = a * b
        break
      case '÷':
        result = b !== 0 ? a / b : 0
        break
      default:
        stack.value.push(a, b)
        return
    }

    stack.value.push(result)
    lastOperationWasEnter.value = false
  }

  const toggleSign = () => {
    if (inputMode.value && currentInput.value) {
      if (currentInput.value.startsWith('-')) {
        currentInput.value = currentInput.value.slice(1)
      } else {
        currentInput.value = '-' + currentInput.value
      }
    }
  }

  const applyEEX = () => {
    if (inputMode.value && currentInput.value) {
      const base = parseFloat(currentInput.value)
      if (!isNaN(base)) {
        const result = Math.pow(10, base)
        currentInput.value = result.toString()
      }
    }
  }

  const dropStack = () => {
    if (stack.value.length > 0) {
      saveToHistory('stack_operation', 'drop')
      stack.value.pop()
      lastOperationWasEnter.value = false
    }
  }

  const swapStack = () => {
    if (stack.value.length >= 2) {
      saveToHistory('stack_operation', 'swap')
      const a = stack.value.pop()!
      const b = stack.value.pop()!
      stack.value.push(a, b)
      lastOperationWasEnter.value = false
    }
  }

  const deleteLastDigit = () => {
    if (inputMode.value && currentInput.value.length > 0) {
      currentInput.value = currentInput.value.slice(0, -1)
      if (currentInput.value === '') {
        inputMode.value = false
      }
    }
  }

  const undoLastOperation = () => {
    if (history.value.length > 0) {
      const lastItem = history.value.pop()!
      stack.value = [...lastItem.previousStack]
      currentInput.value = lastItem.previousInput
      inputMode.value = lastItem.previousInput !== ''
      lastOperationWasEnter.value = false
    }
  }

  const clearAll = () => {
    stack.value = []
    currentInput.value = ''
    inputMode.value = false
    history.value = []
    lastOperationWasEnter.value = false
  }

  return {
    // State
    stack,
    currentInput,
    inputMode,
    history,
    lastOperationWasEnter,
    
    // Computed
    displayStack,
    currentDisplay,
    
    // Actions
    inputDigit,
    inputDecimal,
    enterNumber,
    performOperation,
    toggleSign,
    applyEEX,
    dropStack,
    swapStack,
    deleteLastDigit,
    undoLastOperation,
    clearAll
  }
})