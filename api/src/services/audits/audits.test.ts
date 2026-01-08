import type { Audit } from '@prisma/client'

import {
  audits,
  audit,
  createAudit,
  updateAudit,
  deleteAudit,
} from './audits.js'
import type { StandardScenario } from './audits.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('audits', () => {
  scenario('returns all audits', async (scenario: StandardScenario) => {
    const result = await audits()

    expect(result.length).toEqual(Object.keys(scenario.audit).length)
  })

  scenario('returns a single audit', async (scenario: StandardScenario) => {
    const result = await audit({ id: scenario.audit.one.id })

    expect(result).toEqual(scenario.audit.one)
  })

  scenario('creates a audit', async (scenario: StandardScenario) => {
    const result = await createAudit({
      input: {
        updatedAt: '2026-01-08T04:21:52.568Z',
        userId: scenario.audit.two.userId,
        log: 'String',
      },
    })

    expect(result.updatedAt).toEqual(new Date('2026-01-08T04:21:52.568Z'))
    expect(result.userId).toEqual(scenario.audit.two.userId)
    expect(result.log).toEqual('String')
  })

  scenario('updates a audit', async (scenario: StandardScenario) => {
    const original = (await audit({ id: scenario.audit.one.id })) as Audit
    const result = await updateAudit({
      id: original.id,
      input: { updatedAt: '2026-01-09T04:21:52.571Z' },
    })

    expect(result.updatedAt).toEqual(new Date('2026-01-09T04:21:52.571Z'))
  })

  scenario('deletes a audit', async (scenario: StandardScenario) => {
    const original = (await deleteAudit({ id: scenario.audit.one.id })) as Audit
    const result = await audit({ id: original.id })

    expect(result).toEqual(null)
  })
})
