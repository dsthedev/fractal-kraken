import type { Entity } from '@prisma/client'

import {
  entities,
  entity,
  createEntity,
  updateEntity,
  deleteEntity,
} from './entities.js'
import type { StandardScenario } from './entities.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('entities', () => {
  scenario('returns all entities', async (scenario: StandardScenario) => {
    const result = await entities()

    expect(result.length).toEqual(Object.keys(scenario.entity).length)
  })

  scenario('returns a single entity', async (scenario: StandardScenario) => {
    const result = await entity({ id: scenario.entity.one.id })

    expect(result).toEqual(scenario.entity.one)
  })

  scenario('creates a entity', async () => {
    const result = await createEntity({
      input: {
        type: 'CONTRACTOR',
        name: 'String',
        updatedAt: '2026-01-11T18:25:22.078Z',
      },
    })

    expect(result.type).toEqual('CONTRACTOR')
    expect(result.name).toEqual('String')
    expect(result.updatedAt).toEqual(new Date('2026-01-11T18:25:22.078Z'))
  })

  scenario('updates a entity', async (scenario: StandardScenario) => {
    const original = (await entity({ id: scenario.entity.one.id })) as Entity
    const result = await updateEntity({
      id: original.id,
      input: { type: 'OTHER' },
    })

    expect(result.type).toEqual('OTHER')
  })

  scenario('deletes a entity', async (scenario: StandardScenario) => {
    const original = (await deleteEntity({
      id: scenario.entity.one.id,
    })) as Entity
    const result = await entity({ id: original.id })

    expect(result).toEqual(null)
  })
})
