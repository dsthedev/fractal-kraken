import type { Prisma, Entity } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.EntityCreateArgs>({
  entity: {
    one: {
      data: {
        type: 'CONTRACTOR',
        name: 'String',
        updatedAt: '2026-01-11T18:25:22.117Z',
      },
    },
    two: {
      data: {
        type: 'CONTRACTOR',
        name: 'String',
        updatedAt: '2026-01-11T18:25:22.117Z',
      },
    },
  },
})

export type StandardScenario = ScenarioData<Entity, 'entity'>
