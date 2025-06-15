import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginPlaywright from 'eslint-plugin-playwright'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  
  ...pluginVue.configs['flat/essential'],
  
  {
    files: ['**/*.{ts,mts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  
  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
  
  skipFormatting,
]
