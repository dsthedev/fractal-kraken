import type { Prisma, Invoice } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.InvoiceCreateArgs>({
  invoice: {
    one: {
      data: {
        updatedAt: '2026-02-02T01:55:41.423Z',
        invoiceNumber: 'String1081441',
        subtotal: 3179201.280834073,
        total: 7443177.660841078,
        author: {
          create: {
            email: 'String547878',
            updatedAt: '2026-02-02T01:55:41.442Z',
          },
        },
        payorEntity: {
          create: {
            type: 'CONTRACTOR',
            name: 'String',
            updatedAt: '2026-02-02T01:55:41.461Z',
          },
        },
        payeeEntity: {
          create: {
            type: 'CONTRACTOR',
            name: 'String',
            updatedAt: '2026-02-02T01:55:41.481Z',
          },
        },
      },
    },
    two: {
      data: {
        updatedAt: '2026-02-02T01:55:41.481Z',
        invoiceNumber: 'String1062951',
        subtotal: 5630019.928016061,
        total: 7165527.27294744,
        author: {
          create: {
            email: 'String3403036',
            updatedAt: '2026-02-02T01:55:41.500Z',
          },
        },
        payorEntity: {
          create: {
            type: 'CONTRACTOR',
            name: 'String',
            updatedAt: '2026-02-02T01:55:41.519Z',
          },
        },
        payeeEntity: {
          create: {
            type: 'CONTRACTOR',
            name: 'String',
            updatedAt: '2026-02-02T01:55:41.538Z',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Invoice, 'invoice'>
