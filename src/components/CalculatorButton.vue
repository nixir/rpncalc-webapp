<template>
  <button
    :class="buttonClasses"
    @click="$emit('click', value)"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ButtonType } from '@/types/calculator'

interface Props {
  label: string
  value: string
  type: ButtonType
  className?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

defineEmits<{
  click: [value: string]
}>()

const isPressed = ref(false)

const buttonClasses = computed(() => [
  'calculator-button',
  `button-${props.type}`,
  props.className,
  {
    'button-disabled': props.disabled,
    'button-pressed': isPressed.value
  }
])

const onTouchStart = () => {
  if (!props.disabled) {
    isPressed.value = true
  }
}

const onTouchEnd = () => {
  isPressed.value = false
}
</script>

<style scoped>
.calculator-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
  min-height: 60px;
  min-width: 60px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}

.calculator-button:active,
.button-pressed {
  transform: scale(0.95);
}

/* Button type styles */
.button-number {
  background-color: #505050;
}

.button-number:hover {
  background-color: #606060;
}

.button-operator {
  background-color: #ff9500;
}

.button-operator:hover {
  background-color: #ffad33;
}

.button-function {
  background-color: #a6a6a6;
  color: #000;
}

.button-function:hover {
  background-color: #b6b6b6;
}

.button-enter {
  background-color: #ff9500;
}

.button-enter:hover {
  background-color: #ffad33;
}

.button-clear {
  background-color: #a6a6a6;
  color: #000;
}

.button-clear:hover {
  background-color: #b6b6b6;
}

.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-disabled:hover {
  transform: none;
}

/* Special spacing for empty grid cell */
.button-empty {
  background: transparent;
  cursor: default;
  pointer-events: none;
}

/* Responsive font size */
@media (max-height: 700px) {
  .calculator-button {
    font-size: 1.3rem;
    min-height: 50px;
    min-width: 50px;
  }
}

@media (max-height: 600px) {
  .calculator-button {
    font-size: 1.2rem;
    min-height: 45px;
    min-width: 45px;
  }
}

@media (max-width: 380px) {
  .calculator-button {
    font-size: 1.2rem;
    min-height: 55px;
    min-width: 55px;
  }
}

@media (max-width: 350px) {
  .calculator-button {
    font-size: 1.1rem;
    min-height: 50px;
    min-width: 45px;
  }
}
</style>