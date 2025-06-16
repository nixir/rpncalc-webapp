<template>
  <div class="calculator-display">
    <!-- Empty slots to maintain 4-row layout (at top for older stack levels) -->
    <div
      v-for="i in emptySlots"
      :key="`empty-${i}`"
      class="stack-item empty"
    />
    
    <!-- Stack values (up to 4, X register at bottom) -->
    <div
      v-for="(value, index) in displayValues"
      :key="`stack-${index}`"
      :class="['stack-item', { 'current-input': index === displayValues.length - 1 && isCurrentInput }]"
    >
      {{ formatNumber(value) }}
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

const displayValues = computed(() => {
  const result = [...props.stack]
  
  // Add current input as the last item if in input mode
  if (props.inputMode && props.currentInput) {
    const inputNum = parseFloat(props.currentInput) || 0
    result.push(inputNum)
  }
  
  // Show only the last 4 values (X register at bottom)
  return result.slice(-4)
})

const emptySlots = computed(() => {
  return Math.max(0, 4 - displayValues.value.length)
})

const isCurrentInput = computed(() => {
  return props.inputMode && props.currentInput !== ''
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
  justify-content: flex-end;
  align-items: center;
  color: #fff;
  font-size: 2rem;
  font-weight: 300;
  min-height: 2.5rem;
  padding: 0.25rem 0;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stack-item.current-input {
  color: #fff;
  font-weight: 400;
}

.stack-item.empty {
  color: transparent;
}

/* Responsive font sizes */
@media (max-height: 700px) {
  .stack-item {
    font-size: 1.6rem;
    min-height: 2rem;
  }
}

@media (max-height: 600px) {
  .stack-item {
    font-size: 1.4rem;
    min-height: 1.8rem;
  }
}

/* Adjust text size if number is too long */
.stack-item {
  font-size: clamp(1.2rem, 4vw, 2rem);
}
</style>