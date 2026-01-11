import type { Prisma, BillableItem } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.BillableItemCreateArgs>({
  billableItem: {
    one: {
      data: {
        unitPrice: 1361745.3247472865,
        pricingType: 'SUB',
        quantity: 659718.5395714123,
        subtotal: 1210496.1925440128,
        updatedAt: '2026-01-11T05:36:45.649Z',
        service: {
          create: {
            action: 'INSTALL',
            material: 'String',
            updatedAt: '2026-01-11T05:36:45.654Z',
          },
        },
        unit: {
          create: {
            fullName: 'String',
            pluralName: 'String',
            dimension: 'LINEAR',
            updatedAt: '2026-01-11T05:36:45.660Z',
          },
        },
        author: {
          create: {
            email: 'String1587015',
            updatedAt: '2026-01-11T05:36:45.665Z',
          },
        },
      },
    },
    two: {
      data: {
        unitPrice: 2196971.423148386,
        pricingType: 'SUB',
        quantity: 7940440.284724196,
        subtotal: 5212583.405750178,
        updatedAt: '2026-01-11T05:36:45.665Z',
        service: {
          create: {
            action: 'INSTALL',
            material: 'String',
            updatedAt: '2026-01-11T05:36:45.671Z',
          },
        },
        unit: {
          create: {
            fullName: 'String',
            pluralName: 'String',
            dimension: 'LINEAR',
            updatedAt: '2026-01-11T05:36:45.676Z',
          },
        },
        author: {
          create: {
            email: 'String6471264',
            updatedAt: '2026-01-11T05:36:45.681Z',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<BillableItem, 'billableItem'>
