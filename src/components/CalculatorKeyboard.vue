<template>
  <div class="calculator-keyboard">
    <!-- Row 1: Enter (2 columns), +/-, EEX -->
    <div class="keyboard-row">
      <CalculatorButton
        label="Enter"
        value="enter"
        type="enter"
        class="enter-button"
        @click="handleButtonClick"
      />
      <CalculatorButton
        label="+/-"
        value="toggle-sign"
        type="function"
        @click="handleButtonClick"
      />
      <CalculatorButton label="EEX" value="eex" type="function" @click="handleButtonClick" />
    </div>

    <!-- Row 2: 7, 8, 9, ÷, DEL -->
    <div class="keyboard-row">
      <CalculatorButton label="7" value="7" type="number" @click="handleButtonClick" />
      <CalculatorButton label="8" value="8" type="number" @click="handleButtonClick" />
      <CalculatorButton label="9" value="9" type="number" @click="handleButtonClick" />
      <CalculatorButton label="÷" value="÷" type="operator" @click="handleButtonClick" />
      <CalculatorButton label="DEL" value="delete" type="function" @click="handleButtonClick" />
    </div>

    <!-- Row 3: 4, 5, 6, ×, Undo -->
    <div class="keyboard-row">
      <CalculatorButton label="4" value="4" type="number" @click="handleButtonClick" />
      <CalculatorButton label="5" value="5" type="number" @click="handleButtonClick" />
      <CalculatorButton label="6" value="6" type="number" @click="handleButtonClick" />
      <CalculatorButton label="×" value="×" type="operator" @click="handleButtonClick" />
      <CalculatorButton label="Undo" value="undo" type="function" @click="handleButtonClick" />
    </div>

    <!-- Row 4: 1, 2, 3, -, Swap -->
    <div class="keyboard-row">
      <CalculatorButton label="1" value="1" type="number" @click="handleButtonClick" />
      <CalculatorButton label="2" value="2" type="number" @click="handleButtonClick" />
      <CalculatorButton label="3" value="3" type="number" @click="handleButtonClick" />
      <CalculatorButton label="-" value="-" type="operator" @click="handleButtonClick" />
      <CalculatorButton label="Swap" value="swap" type="function" @click="handleButtonClick" />
    </div>

    <!-- Row 5: 0, ., (empty), +, Drop -->
    <div class="keyboard-row">
      <CalculatorButton label="0" value="0" type="number" @click="handleButtonClick" />
      <CalculatorButton label="." value="." type="number" @click="handleButtonClick" />
      <!-- Empty space to align + with - -->
      <div class="button-spacer" />
      <CalculatorButton label="+" value="+" type="operator" @click="handleButtonClick" />
      <CalculatorButton label="Drop" value="drop" type="function" @click="handleButtonClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CalculatorButton from './CalculatorButton.vue'

const emit = defineEmits<{
  buttonPress: [value: string]
}>()

const handleButtonClick = (value: string) => {
  emit('buttonPress', value)
}
</script>

<style scoped>
.calculator-keyboard {
  height: 100%;
  padding: 8px 4px;
  background-color: var(--sol-base2);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keyboard-row {
  display: flex;
  gap: 8px;
  height: calc((100% - 32px) / 5);
  min-height: 60px;
}

.keyboard-row > * {
  flex: 1;
}

/* Enter button spans 3 columns (width of 7-8-9) */
.enter-button {
  flex: 3;
}

/* Empty spacer to create alignment */
.button-spacer {
  flex: 1;
  background: transparent;
}

/* Responsive adjustments */
@media (max-height: 700px) {
  .calculator-keyboard {
    padding: 6px 3px;
    gap: 6px;
  }

  .keyboard-row {
    gap: 6px;
    min-height: 48px;
    height: calc((100% - 24px) / 5);
  }
}

@media (max-height: 650px) {
  .calculator-keyboard {
    padding: 5px 3px;
    gap: 5px;
  }

  .keyboard-row {
    gap: 5px;
    min-height: 44px;
    height: calc((100% - 20px) / 5);
  }
}

@media (max-height: 600px) {
  .calculator-keyboard {
    padding: 4px 2px;
    gap: 4px;
  }

  .keyboard-row {
    gap: 4px;
    min-height: 42px;
    height: calc((100% - 16px) / 5);
  }
}

/* iPhone specific keyboard adjustments */
@media (max-height: 812px) and (-webkit-device-pixel-ratio: 3) {
  /* iPhone 12, 13, 14, X, XS */
  .calculator-keyboard {
    padding: 6px 4px;
    gap: 6px;
  }

  .keyboard-row {
    gap: 6px;
    min-height: 50px;
    height: calc((100% - 24px) / 5);
  }
}

@media (max-height: 736px) and (-webkit-device-pixel-ratio: 3) {
  /* iPhone 6+, 7+, 8+ */
  .calculator-keyboard {
    padding: 5px 3px;
    gap: 5px;
  }

  .keyboard-row {
    gap: 5px;
    min-height: 46px;
    height: calc((100% - 20px) / 5);
  }
}

@media (max-height: 667px) and (-webkit-device-pixel-ratio: 2) {
  /* iPhone 6, 7, 8, SE 2nd/3rd gen */
  .calculator-keyboard {
    padding: 4px 2px;
    gap: 4px;
  }

  .keyboard-row {
    gap: 4px;
    min-height: 44px;
    height: calc((100% - 16px) / 5);
  }
}

@media (max-width: 400px) {
  .calculator-keyboard {
    padding: 6px 2px;
    gap: 6px;
  }

  .keyboard-row {
    gap: 6px;
  }
}

@media (max-width: 350px) {
  .calculator-keyboard {
    padding: 4px 2px;
    gap: 4px;
  }

  .keyboard-row {
    gap: 4px;
    min-height: 50px;
  }
}
</style>
