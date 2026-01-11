import { Prisma, BillableItem } from '@prisma/client'

import {
  billableItems,
  billableItem,
  createBillableItem,
  updateBillableItem,
  deleteBillableItem,
} from './billableItems.js'
import type { StandardScenario } from './billableItems.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('billableItems', () => {
  scenario('returns all billableItems', async (scenario: StandardScenario) => {
    const result = await billableItems()

    expect(result.length).toEqual(Object.keys(scenario.billableItem).length)
  })

  scenario(
    'returns a single billableItem',
    async (scenario: StandardScenario) => {
      const result = await billableItem({ id: scenario.billableItem.one.id })

      expect(result).toEqual(scenario.billableItem.one)
    }
  )

  scenario('creates a billableItem', async (scenario: StandardScenario) => {
    const result = await createBillableItem({
      input: {
        serviceId: scenario.billableItem.two.serviceId,
        unitId: scenario.billableItem.two.unitId,
        unitPrice: 2944756.3801010246,
        pricingType: 'SUB',
        quantity: 2275840.560537028,
        subtotal: 7218451.1815835275,
        authorId: scenario.billableItem.two.authorId,
        updatedAt: '2026-01-11T05:36:45.586Z',
      },
    })

    expect(result.serviceId).toEqual(scenario.billableItem.two.serviceId)
    expect(result.unitId).toEqual(scenario.billableItem.two.unitId)
    expect(result.unitPrice).toEqual(new Prisma.Decimal(2944756.3801010246))
    expect(result.pricingType).toEqual('SUB')
    expect(result.quantity).toEqual(new Prisma.Decimal(2275840.560537028))
    expect(result.subtotal).toEqual(new Prisma.Decimal(7218451.1815835275))
    expect(result.authorId).toEqual(scenario.billableItem.two.authorId)
    expect(result.updatedAt).toEqual(new Date('2026-01-11T05:36:45.586Z'))
  })

  scenario('updates a billableItem', async (scenario: StandardScenario) => {
    const original = (await billableItem({
      id: scenario.billableItem.one.id,
    })) as BillableItem
    const result = await updateBillableItem({
      id: original.id,
      input: { unitPrice: 9322964.899943674 },
    })

    expect(result.unitPrice).toEqual(new Prisma.Decimal(9322964.899943674))
  })

  scenario('deletes a billableItem', async (scenario: StandardScenario) => {
    const original = (await deleteBillableItem({
      id: scenario.billableItem.one.id,
    })) as BillableItem
    const result = await billableItem({ id: original.id })

    expect(result).toEqual(null)
  })
})
