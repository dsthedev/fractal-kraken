import type { Meta, StoryObj } from '@storybook/react'

import AdminScaffoldLayout from './AdminScaffoldLayout'

const meta: Meta<typeof AdminScaffoldLayout> = {
  component: AdminScaffoldLayout,
}

export default meta

type Story = StoryObj<typeof AdminScaffoldLayout>

export const Primary: Story = {}
