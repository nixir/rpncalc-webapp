<script setup lang="ts">
import RPNCalculator from './components/RPNCalculator.vue'
</script>

<template>
  <RPNCalculator />
</template>

<style>
/* Global styles for RPN Calculator */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #000;
  color: #fff;
  
  /* Prevent zoom on iOS */
  -webkit-text-size-adjust: 100%;
  
  /* Prevent pull-to-refresh */
  overscroll-behavior: none;
}

* {
  box-sizing: border-box;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  max-width: 100vw;
}

/* Remove default button styles */
button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Disable text selection */
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/* iOS Safari specific styles */
@supports (-webkit-touch-callout: none) {
  body {
    /* Prevent scroll bounce */
    position: fixed;
    height: 100vh;
    width: 100vw;
  }
}

/* Prevent zoom on input focus in iOS */
input, select, textarea {
  font-size: 16px;
}
</style>
