import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalculatorButton from '../CalculatorButton.vue'

describe('CalculatorButton', () => {
  describe('Active State', () => {
    it('should apply button-active class when active prop is true', () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'BIN',
          value: 'bin',
          type: 'function',
          active: true,
        },
      })

      expect(wrapper.classes()).toContain('button-active')
    })

    it('should not apply button-active class when active prop is false', () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'BIN',
          value: 'bin',
          type: 'function',
          active: false,
        },
      })

      expect(wrapper.classes()).not.toContain('button-active')
    })

    it('should not apply button-active class when active prop is not provided', () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'BIN',
          value: 'bin',
          type: 'function',
        },
      })

      expect(wrapper.classes()).not.toContain('button-active')
    })

    it('should apply both active and pressed classes when both conditions are met', async () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'BIN',
          value: 'bin',
          type: 'function',
          active: true,
        },
      })

      // Simulate touch start to trigger pressed state
      await wrapper.trigger('touchstart')

      expect(wrapper.classes()).toContain('button-active')
      expect(wrapper.classes()).toContain('button-pressed')
    })
  })

  describe('Basic Functionality', () => {
    it('should render the correct label', () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'Test Label',
          value: 'test',
          type: 'function',
        },
      })

      expect(wrapper.text()).toBe('Test Label')
    })

    it('should emit click event with correct value when clicked', async () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'BIN',
          value: 'bin',
          type: 'function',
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')![0]).toEqual(['bin'])
    })

    it('should apply disabled class when disabled prop is true', () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'BIN',
          value: 'bin',
          type: 'function',
          disabled: true,
        },
      })

      expect(wrapper.classes()).toContain('button-disabled')
    })

    it('should apply correct type class', () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'BIN',
          value: 'bin',
          type: 'function',
        },
      })

      expect(wrapper.classes()).toContain('button-function')
    })
  })

  describe('Active State with Different Button Types', () => {
    it('should apply active state to number buttons', () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: '1',
          value: '1',
          type: 'number',
          active: true,
        },
      })

      expect(wrapper.classes()).toContain('button-active')
      expect(wrapper.classes()).toContain('button-number')
    })

    it('should apply active state to operator buttons', () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: '+',
          value: '+',
          type: 'operator',
          active: true,
        },
      })

      expect(wrapper.classes()).toContain('button-active')
      expect(wrapper.classes()).toContain('button-operator')
    })

    it('should apply active state to enter buttons', () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'Enter',
          value: 'enter',
          type: 'enter',
          active: true,
        },
      })

      expect(wrapper.classes()).toContain('button-active')
      expect(wrapper.classes()).toContain('button-enter')
    })
  })

  describe('Interaction States', () => {
    it('should handle touch interactions correctly with active state', async () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'BIN',
          value: 'bin',
          type: 'function',
          active: true,
        },
      })

      // Touch start should add pressed class while keeping active class
      await wrapper.trigger('touchstart')
      expect(wrapper.classes()).toContain('button-active')
      expect(wrapper.classes()).toContain('button-pressed')

      // Touch end should remove pressed class but keep active class
      await wrapper.trigger('touchend')
      expect(wrapper.classes()).toContain('button-active')
      expect(wrapper.classes()).not.toContain('button-pressed')
    })

    it('should not emit click event when disabled even if active', async () => {
      const wrapper = mount(CalculatorButton, {
        props: {
          label: 'BIN',
          value: 'bin',
          type: 'function',
          active: true,
          disabled: true,
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
      expect(wrapper.classes()).toContain('button-active')
      expect(wrapper.classes()).toContain('button-disabled')
    })
  })
})
