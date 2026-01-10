import { Prisma, Rate } from '@prisma/client'

import { rates, rate, createRate, updateRate, deleteRate } from './rates.js'
import type { StandardScenario } from './rates.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('rates', () => {
  scenario('returns all rates', async (scenario: StandardScenario) => {
    const result = await rates()

    expect(result.length).toEqual(Object.keys(scenario.rate).length)
  })

  scenario('returns a single rate', async (scenario: StandardScenario) => {
    const result = await rate({ id: scenario.rate.one.id })

    expect(result).toEqual(scenario.rate.one)
  })

  scenario('creates a rate', async (scenario: StandardScenario) => {
    const result = await createRate({
      input: {
        serviceId: scenario.rate.two.serviceId,
        unitId: scenario.rate.two.unitId,
        subAmount: 8952913.550261581,
        retailAmount: 6716052.753324687,
        authorId: scenario.rate.two.authorId,
        updatedAt: '2026-01-10T21:32:48.139Z',
      },
    })

    expect(result.serviceId).toEqual(scenario.rate.two.serviceId)
    expect(result.unitId).toEqual(scenario.rate.two.unitId)
    expect(result.subAmount).toEqual(new Prisma.Decimal(8952913.550261581))
    expect(result.retailAmount).toEqual(new Prisma.Decimal(6716052.753324687))
    expect(result.authorId).toEqual(scenario.rate.two.authorId)
    expect(result.updatedAt).toEqual(new Date('2026-01-10T21:32:48.139Z'))
  })

  scenario('updates a rate', async (scenario: StandardScenario) => {
    const original = (await rate({ id: scenario.rate.one.id })) as Rate
    const result = await updateRate({
      id: original.id,
      input: { subAmount: 8978862.678151302 },
    })

    expect(result.subAmount).toEqual(new Prisma.Decimal(8978862.678151302))
  })

  scenario('deletes a rate', async (scenario: StandardScenario) => {
    const original = (await deleteRate({ id: scenario.rate.one.id })) as Rate
    const result = await rate({ id: original.id })

    expect(result).toEqual(null)
  })
})
