import type { Prisma, Action } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.ActionCreateArgs>({
  action: {
    one: {
      data: { name: 'String5097734', updatedAt: '2026-01-20T03:37:43.861Z' },
    },
    two: {
      data: { name: 'String3277231', updatedAt: '2026-01-20T03:37:43.861Z' },
    },
  },
})

export type StandardScenario = ScenarioData<Action, 'action'>
