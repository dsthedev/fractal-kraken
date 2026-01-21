import type { Prisma, Material } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.MaterialCreateArgs>({
  material: {
    one: {
      data: { name: 'String5194941', updatedAt: '2026-01-20T03:37:57.429Z' },
    },
    two: {
      data: { name: 'String8922716', updatedAt: '2026-01-20T03:37:57.429Z' },
    },
  },
})

export type StandardScenario = ScenarioData<Material, 'material'>
