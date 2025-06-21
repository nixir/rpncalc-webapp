import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalculatorKeyboard from '../CalculatorKeyboard.vue'
import CalculatorButton from '../CalculatorButton.vue'

describe('CalculatorKeyboard', () => {
  describe('Display Mode Active States', () => {
    it('should activate BIN button when display mode is binary', () => {
      const wrapper = mount(CalculatorKeyboard, {
        props: {
          displayMode: 'binary',
        },
      })

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const binButton = buttons.find(button => button.props('value') === 'bin')
      const decButton = buttons.find(button => button.props('value') === 'dec')

      expect(binButton?.props('active')).toBe(true)
      expect(decButton?.props('active')).toBe(false)
    })

    it('should activate DEC button when display mode is decimal', () => {
      const wrapper = mount(CalculatorKeyboard, {
        props: {
          displayMode: 'decimal',
        },
      })

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const binButton = buttons.find(button => button.props('value') === 'bin')
      const decButton = buttons.find(button => button.props('value') === 'dec')

      expect(binButton?.props('active')).toBe(false)
      expect(decButton?.props('active')).toBe(true)
    })

    it('should default to decimal mode when displayMode prop is not provided', () => {
      const wrapper = mount(CalculatorKeyboard)

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const binButton = buttons.find(button => button.props('value') === 'bin')
      const decButton = buttons.find(button => button.props('value') === 'dec')

      expect(binButton?.props('active')).toBe(false)
      expect(decButton?.props('active')).toBe(true)
    })

    it('should not activate OCT or HEX buttons regardless of display mode', () => {
      const wrapper = mount(CalculatorKeyboard, {
        props: {
          displayMode: 'binary',
        },
      })

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const octButton = buttons.find(button => button.props('value') === 'oct')
      const hexButton = buttons.find(button => button.props('value') === 'hex')

      expect(octButton?.props('active')).toBe(false)
      expect(hexButton?.props('active')).toBe(false)
    })
  })

  describe('Display Mode Switching', () => {
    it('should update active states when display mode changes from decimal to binary', async () => {
      const wrapper = mount(CalculatorKeyboard, {
        props: {
          displayMode: 'decimal',
        },
      })

      // Initially DEC should be active
      let buttons = wrapper.findAllComponents(CalculatorButton)
      let binButton = buttons.find(button => button.props('value') === 'bin')
      let decButton = buttons.find(button => button.props('value') === 'dec')
      
      expect(binButton?.props('active')).toBe(false)
      expect(decButton?.props('active')).toBe(true)

      // Change to binary mode
      await wrapper.setProps({ displayMode: 'binary' })

      // Now BIN should be active
      buttons = wrapper.findAllComponents(CalculatorButton)
      binButton = buttons.find(button => button.props('value') === 'bin')
      decButton = buttons.find(button => button.props('value') === 'dec')

      expect(binButton?.props('active')).toBe(true)
      expect(decButton?.props('active')).toBe(false)
    })

    it('should update active states when display mode changes from binary to decimal', async () => {
      const wrapper = mount(CalculatorKeyboard, {
        props: {
          displayMode: 'binary',
        },
      })

      // Initially BIN should be active
      let buttons = wrapper.findAllComponents(CalculatorButton)
      let binButton = buttons.find(button => button.props('value') === 'bin')
      let decButton = buttons.find(button => button.props('value') === 'dec')
      
      expect(binButton?.props('active')).toBe(true)
      expect(decButton?.props('active')).toBe(false)

      // Change to decimal mode
      await wrapper.setProps({ displayMode: 'decimal' })

      // Now DEC should be active
      buttons = wrapper.findAllComponents(CalculatorButton)
      binButton = buttons.find(button => button.props('value') === 'bin')
      decButton = buttons.find(button => button.props('value') === 'dec')

      expect(binButton?.props('active')).toBe(false)
      expect(decButton?.props('active')).toBe(true)
    })
  })

  describe('Button Event Handling', () => {
    it('should emit buttonPress event when BIN button is clicked', async () => {
      const wrapper = mount(CalculatorKeyboard, {
        props: {
          displayMode: 'decimal',
        },
      })

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const binButton = buttons.find(button => button.props('value') === 'bin')

      await binButton?.trigger('click')

      expect(wrapper.emitted('buttonPress')).toBeTruthy()
      expect(wrapper.emitted('buttonPress')![0]).toEqual(['bin'])
    })

    it('should emit buttonPress event when DEC button is clicked', async () => {
      const wrapper = mount(CalculatorKeyboard, {
        props: {
          displayMode: 'binary',
        },
      })

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const decButton = buttons.find(button => button.props('value') === 'dec')

      await decButton?.trigger('click')

      expect(wrapper.emitted('buttonPress')).toBeTruthy()
      expect(wrapper.emitted('buttonPress')![0]).toEqual(['dec'])
    })

    it('should emit buttonPress event for all keyboard buttons', async () => {
      const wrapper = mount(CalculatorKeyboard)

      const buttons = wrapper.findAllComponents(CalculatorButton)
      
      // Test a few different button types
      const testButtons = [
        { value: 'bin', label: 'BIN' },
        { value: 'enter', label: 'Enter' },
        { value: '7', label: '7' },
        { value: '+', label: '+' },
      ]

      for (const testButton of testButtons) {
        const button = buttons.find(b => b.props('value') === testButton.value)
        if (button) {
          await button.trigger('click')
          expect(wrapper.emitted('buttonPress')).toBeTruthy()
        }
      }
    })
  })

  describe('Keyboard Layout', () => {
    it('should render all expected display mode buttons', () => {
      const wrapper = mount(CalculatorKeyboard)

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const displayModeButtons = ['bin', 'oct', 'dec', 'hex']

      for (const buttonValue of displayModeButtons) {
        const button = buttons.find(b => b.props('value') === buttonValue)
        expect(button).toBeTruthy()
      }
    })

    it('should render all numeric buttons', () => {
      const wrapper = mount(CalculatorKeyboard)

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const numericButtons = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

      for (const buttonValue of numericButtons) {
        const button = buttons.find(b => b.props('value') === buttonValue)
        expect(button).toBeTruthy()
      }
    })

    it('should render all operator buttons', () => {
      const wrapper = mount(CalculatorKeyboard)

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const operatorButtons = ['+', '-', '×', '÷']

      for (const buttonValue of operatorButtons) {
        const button = buttons.find(b => b.props('value') === buttonValue)
        expect(button).toBeTruthy()
      }
    })

    it('should render all function buttons', () => {
      const wrapper = mount(CalculatorKeyboard)

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const functionButtons = ['enter', 'toggle-sign', 'eex', 'delete', 'undo', 'swap', 'drop']

      for (const buttonValue of functionButtons) {
        const button = buttons.find(b => b.props('value') === buttonValue)
        expect(button).toBeTruthy()
      }
    })
  })

  describe('Visual States', () => {
    it('should apply active visual state to BIN button in binary mode', () => {
      const wrapper = mount(CalculatorKeyboard, {
        props: {
          displayMode: 'binary',
        },
      })

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const binButton = buttons.find(button => button.props('value') === 'bin')

      expect(binButton?.props('active')).toBe(true)
      expect(binButton?.classes()).toContain('button-active')
    })

    it('should apply active visual state to DEC button in decimal mode', () => {
      const wrapper = mount(CalculatorKeyboard, {
        props: {
          displayMode: 'decimal',
        },
      })

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const decButton = buttons.find(button => button.props('value') === 'dec')

      expect(decButton?.props('active')).toBe(true)
      expect(decButton?.classes()).toContain('button-active')
    })

    it('should maintain correct button types for display mode buttons', () => {
      const wrapper = mount(CalculatorKeyboard)

      const buttons = wrapper.findAllComponents(CalculatorButton)
      const displayModeButtons = ['bin', 'oct', 'dec', 'hex']

      for (const buttonValue of displayModeButtons) {
        const button = buttons.find(b => b.props('value') === buttonValue)
        expect(button?.props('type')).toBe('function')
      }
    })
  })
})