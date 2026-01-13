// Pass props to your component by passing an `args` object to your story
//
// ```tsx
// export const Primary: Story = {
//  args: {
//    propName: propValue
//  }
// }
// ```
//
// See https://storybook.js.org/docs/react/writing-stories/args.

import type { Meta, StoryObj } from '@storybook/react'

import StepRollCalc from './StepRollCalc'

const meta: Meta<typeof StepRollCalc> = {
  component: StepRollCalc,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof StepRollCalc>

export const Primary: Story = {}
