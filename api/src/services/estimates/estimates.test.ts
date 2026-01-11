import { Prisma, Estimate } from '@prisma/client'

import {
  estimates,
  estimate,
  createEstimate,
  updateEstimate,
  deleteEstimate,
} from './estimates.js'
import type { StandardScenario } from './estimates.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('estimates', () => {
  scenario('returns all estimates', async (scenario: StandardScenario) => {
    const result = await estimates()

    expect(result.length).toEqual(Object.keys(scenario.estimate).length)
  })

  scenario('returns a single estimate', async (scenario: StandardScenario) => {
    const result = await estimate({ id: scenario.estimate.one.id })

    expect(result).toEqual(scenario.estimate.one)
  })

  scenario('creates a estimate', async (scenario: StandardScenario) => {
    const result = await createEstimate({
      input: {
        subtotal: 9484296.890482813,
        total: 652192.1016790355,
        authorId: scenario.estimate.two.authorId,
        updatedAt: '2026-01-11T20:58:43.932Z',
      },
    })

    expect(result.subtotal).toEqual(new Prisma.Decimal(9484296.890482813))
    expect(result.total).toEqual(new Prisma.Decimal(652192.1016790355))
    expect(result.authorId).toEqual(scenario.estimate.two.authorId)
    expect(result.updatedAt).toEqual(new Date('2026-01-11T20:58:43.932Z'))
  })

  scenario('updates a estimate', async (scenario: StandardScenario) => {
    const original = (await estimate({
      id: scenario.estimate.one.id,
    })) as Estimate
    const result = await updateEstimate({
      id: original.id,
      input: { subtotal: 2960383.705062407 },
    })

    expect(result.subtotal).toEqual(new Prisma.Decimal(2960383.705062407))
  })

  scenario('deletes a estimate', async (scenario: StandardScenario) => {
    const original = (await deleteEstimate({
      id: scenario.estimate.one.id,
    })) as Estimate
    const result = await estimate({ id: original.id })

    expect(result).toEqual(null)
  })
})
