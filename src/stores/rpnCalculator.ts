import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { HistoryItem } from '@/types/calculator'

export const useRPNStore = defineStore('rpnCalculator', () => {
  // State
  const stack = ref<number[]>([])
  const currentInput = ref<string>('')
  const inputMode = ref<boolean>(false)
  const history = ref<HistoryItem[]>([])

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
    if (!inputMode.value) {
      currentInput.value = digit
      inputMode.value = true
    } else {
      currentInput.value += digit
    }
  }

  const inputDecimal = () => {
    if (!inputMode.value) {
      currentInput.value = '0.'
      inputMode.value = true
    } else if (!currentInput.value.includes('.')) {
      currentInput.value += '.'
    }
  }

  const enterNumber = () => {
    if (inputMode.value && currentInput.value) {
      const number = parseFloat(currentInput.value)
      if (!isNaN(number)) {
        stack.value.push(number)
        currentInput.value = ''
        inputMode.value = false
      }
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
    }
  }

  const swapStack = () => {
    if (stack.value.length >= 2) {
      saveToHistory('stack_operation', 'swap')
      const a = stack.value.pop()!
      const b = stack.value.pop()!
      stack.value.push(a, b)
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
    }
  }

  const clearAll = () => {
    stack.value = []
    currentInput.value = ''
    inputMode.value = false
    history.value = []
  }

  return {
    // State
    stack,
    currentInput,
    inputMode,
    history,
    
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