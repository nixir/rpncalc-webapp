<template>
  <div class="calculator-display">
    <!-- Stack display with labels (T, Z, Y, X from top to bottom) -->
    <div
      v-for="(item, index) in stackDisplay"
      :key="`stack-${index}`"
      :class="[
        'stack-item',
        {
          'current-input': item.isCurrentInput,
          'binary-mode': displayMode === 'binary',
          'octal-mode': displayMode === 'octal',
          'hex-mode': displayMode === 'hexadecimal',
        },
      ]"
    >
      <div class="stack-label">{{ item.label }}</div>
      <div
        class="stack-value"
        :class="{
          'binary-display': item.value.startsWith('0b'),
          'octal-display': item.value.startsWith('0o'),
          'hex-display': item.value.startsWith('0x'),
        }"
      >
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  stack: number[]
  currentInput: string
  inputMode: boolean
  displayMode: 'decimal' | 'binary' | 'octal' | 'hexadecimal'
  toBinaryString: (value: number) => string
  toOctalString: (value: number) => string
  toHexString: (value: number) => string
}

const props = defineProps<Props>()

const stackDisplay = computed(() => {
  const stackLabels = ['T', 'Z', 'Y', 'X']
  const values = [...props.stack]

  // Add current input as the last item if in input mode
  if (props.inputMode && props.currentInput) {
    // Convert to number for stack consistency
    values.push(parseFloat(props.currentInput))
  }

  // Get the last 4 values (or fewer if stack is smaller)
  const displayValues = values.slice(-4)

  // Create stack display items (always 4 rows: T, Z, Y, X)
  return stackLabels.map((label, index) => {
    const valueIndex = index - (4 - displayValues.length)
    const hasValue = valueIndex >= 0
    const value = hasValue ? displayValues[valueIndex] : null
    const isCurrentInput =
      hasValue &&
      props.inputMode &&
      props.currentInput !== '' &&
      valueIndex === displayValues.length - 1

    return {
      label,
      value: value !== null ? (isCurrentInput ? props.currentInput : formatNumber(value)) : '',
      isCurrentInput,
    }
  })
})

const formatNumber = (value: number): string => {
  // Binary mode
  if (props.displayMode === 'binary') {
    return props.toBinaryString(value)
  }

  // Octal mode
  if (props.displayMode === 'octal') {
    return props.toOctalString(value)
  }

  // Hexadecimal mode
  if (props.displayMode === 'hexadecimal') {
    return props.toHexString(value)
  }

  // Decimal mode - original logic
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
  background-color: var(--sol-base2);
  padding: 20px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  overflow: hidden;
}

.stack-item {
  display: flex;
  align-items: center;
  color: var(--sol-base01);
  min-height: 2.5rem;
  padding: 0.25rem 0;
  gap: 1rem;
}

.stack-label {
  flex: 0 0 auto;
  font-size: 2rem;
  font-weight: 500;
  color: var(--sol-base1);
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
  color: var(--sol-base00);
  font-weight: 400;
}

/* Responsive font sizes */
@media (max-height: 700px) {
  .stack-value {
    font-size: 2rem;
  }
  .stack-item {
    min-height: 2rem;
  }
  .stack-label {
    font-size: 2rem;
  }
}

@media (max-height: 600px) {
  .stack-value {
    font-size: 1.8rem;
  }
  .stack-item {
    min-height: 1.8rem;
  }
  .stack-label {
    font-size: 1.8rem;
  }
}

/* Adjust text size if number is too long */
.stack-value {
  font-size: clamp(1.2rem, 4vw, 2rem);
}
</style>
