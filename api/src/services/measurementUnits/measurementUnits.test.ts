import type { MeasurementUnit } from '@prisma/client'

import {
  measurementUnits,
  measurementUnit,
  createMeasurementUnit,
  updateMeasurementUnit,
  deleteMeasurementUnit,
} from './measurementUnits.js'
import type { StandardScenario } from './measurementUnits.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('measurementUnits', () => {
  scenario(
    'returns all measurementUnits',
    async (scenario: StandardScenario) => {
      const result = await measurementUnits()

      expect(result.length).toEqual(
        Object.keys(scenario.measurementUnit).length
      )
    }
  )

  scenario(
    'returns a single measurementUnit',
    async (scenario: StandardScenario) => {
      const result = await measurementUnit({
        id: scenario.measurementUnit.one.id,
      })

      expect(result).toEqual(scenario.measurementUnit.one)
    }
  )

  scenario('creates a measurementUnit', async () => {
    const result = await createMeasurementUnit({
      input: {
        fullName: 'String',
        pluralName: 'String',
        dimension: 'LINEAR',
        category: 'LENGTH',
        updatedAt: '2026-01-10T01:48:41.101Z',
      },
    })

    expect(result.fullName).toEqual('String')
    expect(result.pluralName).toEqual('String')
    expect(result.dimension).toEqual('LINEAR')
    expect(result.category).toEqual('LENGTH')
    expect(result.updatedAt).toEqual(new Date('2026-01-10T01:48:41.101Z'))
  })

  scenario('updates a measurementUnit', async (scenario: StandardScenario) => {
    const original = (await measurementUnit({
      id: scenario.measurementUnit.one.id,
    })) as MeasurementUnit
    const result = await updateMeasurementUnit({
      id: original.id,
      input: { fullName: 'String2' },
    })

    expect(result.fullName).toEqual('String2')
  })

  scenario('deletes a measurementUnit', async (scenario: StandardScenario) => {
    const original = (await deleteMeasurementUnit({
      id: scenario.measurementUnit.one.id,
    })) as MeasurementUnit
    const result = await measurementUnit({ id: original.id })

    expect(result).toEqual(null)
  })
})
