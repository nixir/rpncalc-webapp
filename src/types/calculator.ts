export interface HistoryItem {
  type: 'operation' | 'stack_operation'
  previousStack: number[]
  previousInput: string
  operation?: string
}

export type ButtonType = 'number' | 'operator' | 'function' | 'enter' | 'clear'

export interface ButtonConfig {
  label: string
  value: string
  type: ButtonType
  className?: string
}