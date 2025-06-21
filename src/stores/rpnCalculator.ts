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
  const eexMode = ref<boolean>(false)
  const exponent = ref<string>('')
  const eexJustEntered = ref<boolean>(false)
  const displayMode = ref<'decimal' | 'binary'>('decimal')

  // Helper function for HP-style stack lift
  const liftStack = () => {
    // Limit stack to 4 levels (T, Z, Y, X)
    if (stack.value.length >= 4) {
      stack.value = stack.value.slice(1) // Remove T (oldest value)
    }
  }

  // Helper function to convert scientific notation to number
  const parseScientificNotation = (): number | null => {
    if (!eexMode.value) {
      // 通常モード：そのままparseFloat
      return parseFloat(currentInput.value)
    }

    // EEXモード：mantissa × 10^exponent として計算
    const mantissa = parseFloat(currentInput.value)
    const exp = parseFloat(exponent.value) || 0

    if (isNaN(mantissa)) {
      return null
    }

    return mantissa * Math.pow(10, exp)
  }

  // Helper function to convert number to binary string
  const toBinaryString = (value: number): string => {
    // Handle special cases
    if (value === 0) return '0b0'
    if (!isFinite(value)) return 'Error'

    // For decimal numbers, only convert the integer part
    const integerPart = Math.trunc(value)

    // Handle negative numbers using two's complement (32-bit)
    if (integerPart < 0) {
      // Convert to 32-bit two's complement
      const twosComplement = (integerPart >>> 0).toString(2)
      return '0b' + twosComplement
    }

    // Positive numbers
    const binaryStr = integerPart.toString(2)
    return '0b' + binaryStr
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
      if (eexMode.value) {
        // 科学記数法表示: mantissa + 'e' + exponent
        return currentInput.value + 'e' + exponent.value
      }
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
      operation,
    })

    // Keep only last 50 history items
    if (history.value.length > 50) {
      history.value.shift()
    }
  }

  // Actions
  const inputDigit = (digit: string) => {
    if (eexMode.value) {
      if (eexJustEntered.value) {
        // EEXが実行された直後：指数部分に数字を追加
        exponent.value += digit
        eexJustEntered.value = false
        lastOperationWasEnter.value = false
      } else {
        // 指数部分に数字を追加
        exponent.value += digit
        lastOperationWasEnter.value = false
      }
    } else if (!inputMode.value) {
      // 通常モード：新しい数値入力開始
      // EEXモードをリセット（前の計算の名残をクリア）
      if (eexMode.value) {
        // 前のEEX値を自動enter してから新しい数値入力を開始
        enterNumber()
      }
      currentInput.value = digit
      inputMode.value = true
      lastOperationWasEnter.value = false
    } else {
      // 通常モード：仮数部分に数字を追加
      // 但し、EEXモードから通常モードに移行する場合は自動enter
      if (eexMode.value) {
        // 前のEEX値を自動enter してから新しい数値入力を開始
        enterNumber()
        currentInput.value = digit
        inputMode.value = true
        lastOperationWasEnter.value = false
      } else {
        // 現在の入力が"0"の場合は新しい値で上書きする。
        if (currentInput.value === '0') {
          currentInput.value = digit
        } else {
          currentInput.value += digit
        }
        lastOperationWasEnter.value = false
      }
    }
  }

  const inputDecimal = () => {
    lastOperationWasEnter.value = false
    if (eexMode.value) {
      // EEXモード：指数部分には小数点は入力できない
      return
    }
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
      const number = parseScientificNotation()
      if (number !== null && !isNaN(number)) {
        saveToHistory('stack_operation', 'enter')
        liftStack()
        stack.value.push(number)
        currentInput.value = ''
        inputMode.value = false
        eexMode.value = false
        exponent.value = ''
        eexJustEntered.value = false
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
    if (eexMode.value) {
      // EEXモード：指数部分の符号を切り替え
      if (exponent.value.startsWith('-')) {
        exponent.value = exponent.value.slice(1)
      } else {
        exponent.value = '-' + exponent.value
      }
    } else if (inputMode.value && currentInput.value) {
      // 通常モード：仮数部分の符号を切り替え
      if (currentInput.value.startsWith('-')) {
        currentInput.value = currentInput.value.slice(1)
      } else {
        currentInput.value = '-' + currentInput.value
      }
    }
  }

  const inputEEX = () => {
    // EEXキーを押すとeexModeに移行し、指数入力を開始
    if (inputMode.value && currentInput.value) {
      // 仮数部が入力されている場合のみEEXモードに移行
      eexMode.value = true
      exponent.value = ''
      eexJustEntered.value = true
      lastOperationWasEnter.value = false
    } else if (!inputMode.value) {
      // 入力モードでない場合は、1eから開始
      currentInput.value = '1'
      inputMode.value = true
      eexMode.value = true
      exponent.value = ''
      eexJustEntered.value = true
      lastOperationWasEnter.value = false
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
    if (eexMode.value) {
      // EEXモード：指数部分から削除
      if (exponent.value.length > 0) {
        exponent.value = exponent.value.slice(0, -1)
      } else {
        // 指数部分が空の場合、EEXモードを終了
        eexMode.value = false
      }
    } else if (inputMode.value && currentInput.value.length > 0) {
      // 通常モード：仮数部分から削除
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
    eexMode.value = false
    exponent.value = ''
    eexJustEntered.value = false
  }

  const setDisplayMode = (mode: 'decimal' | 'binary') => {
    displayMode.value = mode
  }

  const toggleDisplayMode = () => {
    displayMode.value = displayMode.value === 'decimal' ? 'binary' : 'decimal'
  }

  return {
    // State
    stack,
    currentInput,
    inputMode,
    history,
    lastOperationWasEnter,
    eexMode,
    exponent,
    eexJustEntered,
    displayMode,

    // Computed
    displayStack,
    currentDisplay,

    // Helpers
    toBinaryString,

    // Actions
    inputDigit,
    inputDecimal,
    enterNumber,
    performOperation,
    toggleSign,
    inputEEX,
    dropStack,
    swapStack,
    deleteLastDigit,
    undoLastOperation,
    clearAll,
    setDisplayMode,
    toggleDisplayMode,
  }
})
