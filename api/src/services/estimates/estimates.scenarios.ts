import type { Prisma, Estimate } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.EstimateCreateArgs>({
  estimate: {
    one: {
      data: {
        subtotal: 9849686.98493104,
        total: 2938522.0562606896,
        updatedAt: '2026-01-11T20:58:44.009Z',
        author: {
          create: {
            email: 'String9898587',
            updatedAt: '2026-01-11T20:58:44.020Z',
          },
        },
      },
    },
    two: {
      data: {
        subtotal: 8915575.885233292,
        total: 995637.5033270359,
        updatedAt: '2026-01-11T20:58:44.020Z',
        author: {
          create: {
            email: 'String4978733',
            updatedAt: '2026-01-11T20:58:44.031Z',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Estimate, 'estimate'>
