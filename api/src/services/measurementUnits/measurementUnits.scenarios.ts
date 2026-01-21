import type { Prisma, MeasurementUnit } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.MeasurementUnitCreateArgs>({
  measurementUnit: {
    one: {
      data: {
        fullName: 'String',
        pluralName: 'String',
        // dimension: 'LINEAR',
        category: 'LENGTH',
        updatedAt: '2026-01-10T01:48:41.115Z',
      },
    },
    two: {
      data: {
        fullName: 'String',
        pluralName: 'String',
        // dimension: 'LINEAR',
        category: 'LENGTH',
        updatedAt: '2026-01-10T01:48:41.115Z',
      },
    },
  },
})

export type StandardScenario = ScenarioData<MeasurementUnit, 'measurementUnit'>
