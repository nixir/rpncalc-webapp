<template>
  <div class="rpn-calculator">
    <div class="calculator-display-area">
      <CalculatorDisplay
        :stack="store.stack"
        :current-input="store.currentInput"
        :input-mode="store.inputMode"
      />
    </div>
    
    <div class="calculator-keyboard-area">
      <CalculatorKeyboard @button-press="handleButtonPress" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRPNStore } from '@/stores/rpnCalculator'
import CalculatorDisplay from './CalculatorDisplay.vue'
import CalculatorKeyboard from './CalculatorKeyboard.vue'

const store = useRPNStore()

const handleButtonPress = (value: string) => {
  switch (value) {
    // Numbers
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      store.inputDigit(value)
      break
    
    // Decimal point
    case '.':
      store.inputDecimal()
      break
    
    // Enter
    case 'enter':
      store.enterNumber()
      break
    
    // Operations
    case '+':
    case '-':
    case '×':
    case '÷':
      store.performOperation(value)
      break
    
    // Functions
    case 'toggle-sign':
      store.toggleSign()
      break
    
    case 'eex':
      store.inputEEX()
      break
    
    case 'drop':
      store.dropStack()
      break
    
    case 'swap':
      store.swapStack()
      break
    
    case 'delete':
      store.deleteLastDigit()
      break
    
    case 'undo':
      store.undoLastOperation()
      break
    
    default:
      console.warn('Unknown button pressed:', value)
  }
}

const handleKeyboardInput = (event: KeyboardEvent) => {
  // Prevent default behavior for calculator keys
  const key = event.key
  
  switch (key) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      event.preventDefault()
      store.inputDigit(key)
      break
    
    case '.':
      event.preventDefault()
      store.inputDecimal()
      break
    
    case 'Enter':
      event.preventDefault()
      store.enterNumber()
      break
    
    case '+':
      event.preventDefault()
      store.performOperation('+')
      break
    
    case '-':
      event.preventDefault()
      store.performOperation('-')
      break
    
    case '*':
      event.preventDefault()
      store.performOperation('×')
      break
    
    case '/':
      event.preventDefault()
      store.performOperation('÷')
      break
    
    case 'Backspace':
      event.preventDefault()
      store.deleteLastDigit()
      break
    
    case 'Escape':
      event.preventDefault()
      store.clearAll()
      break
    
    case 'u':
    case 'U':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        store.undoLastOperation()
      }
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyboardInput)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardInput)
})
</script>

<style scoped>
.rpn-calculator {
  display: flex;
  flex-direction: column;
  /* Use dynamic viewport height for better Safari support */
  height: 100dvh;
  /* Fallback for browsers that don't support dvh */
  height: 100vh;
  /* iOS Safari specific fallback */
  height: -webkit-fill-available;
  width: 100vw;
  background-color: #000;
  overflow: hidden;
  
  /* iPhone safe area support - only top and bottom */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.calculator-display-area {
  flex: 0 0 40%;
  min-height: 200px;
  background-color: #000;
}

.calculator-keyboard-area {
  flex: 1;
  background-color: #000;
  min-height: 300px;
}

/* iOS Safari specific adjustments */
@supports (-webkit-touch-callout: none) {
  .rpn-calculator {
    /* Additional iOS Safari viewport fix */
    min-height: -webkit-fill-available;
  }
}

/* Responsive adjustments for smaller screens */
@media (max-height: 700px) {
  .calculator-display-area {
    flex: 0 0 32%;
    min-height: 160px;
  }
}

@media (max-height: 650px) {
  .calculator-display-area {
    flex: 0 0 28%;
    min-height: 140px;
  }
}

@media (max-height: 600px) {
  .calculator-display-area {
    flex: 0 0 25%;
    min-height: 120px;
  }
}

/* iPhone specific adjustments (common iPhone screen heights) */
@media (max-height: 812px) and (-webkit-device-pixel-ratio: 3) {
  /* iPhone 12, 13, 14, X, XS */
  .calculator-display-area {
    flex: 0 0 30%;
    min-height: 150px;
  }
}

@media (max-height: 736px) and (-webkit-device-pixel-ratio: 3) {
  /* iPhone 6+, 7+, 8+ */
  .calculator-display-area {
    flex: 0 0 28%;
    min-height: 140px;
  }
}

@media (max-height: 667px) and (-webkit-device-pixel-ratio: 2) {
  /* iPhone 6, 7, 8, SE 2nd/3rd gen */
  .calculator-display-area {
    flex: 0 0 25%;
    min-height: 120px;
  }
}

/* Landscape orientation adjustments */
@media (orientation: landscape) {
  .calculator-display-area {
    flex: 0 0 25%;
    min-height: 100px;
  }
}
</style>