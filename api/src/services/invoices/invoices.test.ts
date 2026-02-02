import { Prisma, Invoice } from '@prisma/client'

import {
  invoices,
  invoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from './invoices.js'
import type { StandardScenario } from './invoices.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('invoices', () => {
  scenario('returns all invoices', async (scenario: StandardScenario) => {
    const result = await invoices()

    expect(result.length).toEqual(Object.keys(scenario.invoice).length)
  })

  scenario('returns a single invoice', async (scenario: StandardScenario) => {
    const result = await invoice({ uuid: scenario.invoice.one.uuid })

    expect(result).toEqual(scenario.invoice.one)
  })

  scenario('creates a invoice', async (scenario: StandardScenario) => {
    const result = await createInvoice({
      input: {
        updatedAt: '2026-02-02T01:55:41.205Z',
        authorId: scenario.invoice.two.authorId,
        invoiceNumber: 'String4500125',
        payorEntityId: scenario.invoice.two.payorEntityId,
        payeeEntityId: scenario.invoice.two.payeeEntityId,
        subtotal: 3833478.365018691,
        total: 8504133.535530915,
      },
    })

    expect(result.updatedAt).toEqual(new Date('2026-02-02T01:55:41.205Z'))
    expect(result.authorId).toEqual(scenario.invoice.two.authorId)
    expect(result.invoiceNumber).toEqual('String4500125')
    expect(result.payorEntityId).toEqual(scenario.invoice.two.payorEntityId)
    expect(result.payeeEntityId).toEqual(scenario.invoice.two.payeeEntityId)
    expect(result.subtotal).toEqual(new Prisma.Decimal(3833478.365018691))
    expect(result.total).toEqual(new Prisma.Decimal(8504133.535530915))
  })

  scenario('updates a invoice', async (scenario: StandardScenario) => {
    const original = (await invoice({
      uuid: scenario.invoice.one.uuid,
    })) as Invoice
    const result = await updateInvoice({
      uuid: original.uuid,
      input: { updatedAt: '2026-02-03T01:55:41.225Z' },
    })

    expect(result.updatedAt).toEqual(new Date('2026-02-03T01:55:41.225Z'))
  })

  scenario('deletes a invoice', async (scenario: StandardScenario) => {
    const original = (await deleteInvoice({
      uuid: scenario.invoice.one.uuid,
    })) as Invoice
    const result = await invoice({ uuid: original.uuid })

    expect(result).toEqual(null)
  })
})
