<template>
  <div class="calculator-display">
    <!-- Stack display with labels (T, Z, Y, X from top to bottom) -->
    <div
      v-for="(item, index) in stackDisplay"
      :key="`stack-${index}`"
      :class="['stack-item', { 'current-input': item.isCurrentInput }]"
    >
      <div class="stack-label">{{ item.label }}</div>
      <div class="stack-value">{{ item.value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  stack: number[]
  currentInput: string
  inputMode: boolean
}

const props = defineProps<Props>()

const stackDisplay = computed(() => {
  const stackLabels = ['T', 'Z', 'Y', 'X']
  const values = [...props.stack]
  
  // Add current input as the last item if in input mode
  if (props.inputMode && props.currentInput) {
    const inputNum = parseFloat(props.currentInput) || 0
    values.push(inputNum)
  }
  
  // Get the last 4 values (or fewer if stack is smaller)
  const displayValues = values.slice(-4)
  
  // Create stack display items (always 4 rows: T, Z, Y, X)
  return stackLabels.map((label, index) => {
    const valueIndex = index - (4 - displayValues.length)
    const hasValue = valueIndex >= 0
    const value = hasValue ? displayValues[valueIndex] : null
    const isCurrentInput = hasValue && 
      props.inputMode && 
      props.currentInput !== '' && 
      valueIndex === displayValues.length - 1
    
    return {
      label,
      value: value !== null ? formatNumber(value) : '',
      isCurrentInput
    }
  })
})

const formatNumber = (value: number): string => {
  // Handle special cases
  if (value === 0) return '0'
  if (!isFinite(value)) return 'Error'
  
  // For very large or very small numbers, use scientific notation
  if (Math.abs(value) >= 1e10 || (Math.abs(value) < 1e-6 && value !== 0)) {
    return value.toExponential(6)
  }
  
  // For normal numbers, show up to 10 significant digits
  const str = value.toString()
  if (str.length <= 12) {
    return str
  }
  
  // If still too long, use toPrecision
  return value.toPrecision(10)
}
</script>

<style scoped>
.calculator-display {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  background-color: #000;
  padding: 20px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  overflow: hidden;
}

.stack-item {
  display: flex;
  align-items: center;
  color: #fff;
  min-height: 2.5rem;
  padding: 0.25rem 0;
  gap: 1rem;
}

.stack-label {
  flex: 0 0 auto;
  font-size: 1rem;
  font-weight: 500;
  color: #888;
  width: 1.5rem;
  text-align: left;
}

.stack-value {
  flex: 1;
  font-size: 2rem;
  font-weight: 300;
  text-align: right;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stack-item.current-input .stack-value {
  color: #fff;
  font-weight: 400;
}

/* Responsive font sizes */
@media (max-height: 700px) {
  .stack-value {
    font-size: 1.6rem;
  }
  .stack-item {
    min-height: 2rem;
  }
  .stack-label {
    font-size: 0.9rem;
  }
}

@media (max-height: 600px) {
  .stack-value {
    font-size: 1.4rem;
  }
  .stack-item {
    min-height: 1.8rem;
  }
  .stack-label {
    font-size: 0.8rem;
  }
}

/* Adjust text size if number is too long */
.stack-value {
  font-size: clamp(1.2rem, 4vw, 2rem);
}
</style>