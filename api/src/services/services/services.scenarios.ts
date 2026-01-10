import type { Prisma, Service } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.ServiceCreateArgs>({
  service: {
    one: {
      data: {
        action: 'INSTALL',
        material: 'String',
        updatedAt: '2026-01-10T04:50:17.521Z',
      },
    },
    two: {
      data: {
        action: 'INSTALL',
        material: 'String',
        updatedAt: '2026-01-10T04:50:17.521Z',
      },
    },
  },
})

export type StandardScenario = ScenarioData<Service, 'service'>
