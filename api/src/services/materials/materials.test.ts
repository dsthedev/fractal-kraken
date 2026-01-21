import type { Material } from '@prisma/client'

import {
  materials,
  material,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from './materials.js'
import type { StandardScenario } from './materials.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('materials', () => {
  scenario('returns all materials', async (scenario: StandardScenario) => {
    const result = await materials()

    expect(result.length).toEqual(Object.keys(scenario.material).length)
  })

  scenario('returns a single material', async (scenario: StandardScenario) => {
    const result = await material({ id: scenario.material.one.id })

    expect(result).toEqual(scenario.material.one)
  })

  scenario('creates a material', async () => {
    const result = await createMaterial({
      input: { name: 'String2223998', updatedAt: '2026-01-20T03:37:57.355Z' },
    })

    expect(result.name).toEqual('String2223998')
    expect(result.updatedAt).toEqual(new Date('2026-01-20T03:37:57.355Z'))
  })

  scenario('updates a material', async (scenario: StandardScenario) => {
    const original = (await material({
      id: scenario.material.one.id,
    })) as Material
    const result = await updateMaterial({
      id: original.id,
      input: { name: 'String70475912' },
    })

    expect(result.name).toEqual('String70475912')
  })

  scenario('deletes a material', async (scenario: StandardScenario) => {
    const original = (await deleteMaterial({
      id: scenario.material.one.id,
    })) as Material
    const result = await material({ id: original.id })

    expect(result).toEqual(null)
  })
})
