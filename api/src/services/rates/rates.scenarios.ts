import type { Prisma, Rate } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.RateCreateArgs>({
  rate: {
    one: {
      data: {
        subAmount: 3908160.8146876222,
        retailAmount: 2399200.719574448,
        updatedAt: '2026-01-10T21:32:48.188Z',
        service: {
          create: {
            action: 'INSTALL',
            material: 'String',
            updatedAt: '2026-01-10T21:32:48.192Z',
          },
        },
        unit: {
          create: {
            fullName: 'String',
            pluralName: 'String',
            dimension: 'LINEAR',
            updatedAt: '2026-01-10T21:32:48.196Z',
          },
        },
        author: {
          create: {
            email: 'String6026585',
            updatedAt: '2026-01-10T21:32:48.200Z',
          },
        },
      },
    },
    two: {
      data: {
        subAmount: 8426103.122607961,
        retailAmount: 4745243.8145460915,
        updatedAt: '2026-01-10T21:32:48.200Z',
        service: {
          create: {
            action: 'INSTALL',
            material: 'String',
            updatedAt: '2026-01-10T21:32:48.204Z',
          },
        },
        unit: {
          create: {
            fullName: 'String',
            pluralName: 'String',
            dimension: 'LINEAR',
            updatedAt: '2026-01-10T21:32:48.208Z',
          },
        },
        author: {
          create: {
            email: 'String6115394',
            updatedAt: '2026-01-10T21:32:48.212Z',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Rate, 'rate'>
