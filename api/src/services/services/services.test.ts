import type { Service } from '@prisma/client'

import {
  services,
  service,
  createService,
  updateService,
  deleteService,
} from './services.js'
import type { StandardScenario } from './services.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('services', () => {
  scenario('returns all services', async (scenario: StandardScenario) => {
    const result = await services()

    expect(result.length).toEqual(Object.keys(scenario.service).length)
  })

  scenario('returns a single service', async (scenario: StandardScenario) => {
    const result = await service({ id: scenario.service.one.id })

    expect(result).toEqual(scenario.service.one)
  })

  scenario('creates a service', async () => {
    const result = await createService({
      input: {
        action: 'INSTALL',
        material: 'String',
        updatedAt: '2026-01-10T04:50:17.496Z',
      },
    })

    expect(result.action).toEqual('INSTALL')
    expect(result.material).toEqual('String')
    expect(result.updatedAt).toEqual(new Date('2026-01-10T04:50:17.496Z'))
  })

  scenario('updates a service', async (scenario: StandardScenario) => {
    const original = (await service({ id: scenario.service.one.id })) as Service
    const result = await updateService({
      id: original.id,
      input: { action: 'CUSTOM' },
    })

    expect(result.action).toEqual('CUSTOM')
  })

  scenario('deletes a service', async (scenario: StandardScenario) => {
    const original = (await deleteService({
      id: scenario.service.one.id,
    })) as Service
    const result = await service({ id: original.id })

    expect(result).toEqual(null)
  })
})
