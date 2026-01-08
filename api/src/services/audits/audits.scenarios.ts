import type { Prisma, Audit } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.AuditCreateArgs>({
  audit: {
    one: {
      data: {
        updatedAt: '2026-01-08T04:21:52.592Z',
        log: 'String',
        user: {
          create: {
            email: 'String2008107',
            updatedAt: '2026-01-08T04:21:52.594Z',
          },
        },
      },
    },
    two: {
      data: {
        updatedAt: '2026-01-08T04:21:52.594Z',
        log: 'String',
        user: {
          create: {
            email: 'String7906607',
            updatedAt: '2026-01-08T04:21:52.596Z',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Audit, 'audit'>
