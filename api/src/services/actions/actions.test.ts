import type { Action } from '@prisma/client'

import {
  actions,
  action,
  createAction,
  updateAction,
  deleteAction,
} from './actions.js'
import type { StandardScenario } from './actions.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('actions', () => {
  scenario('returns all actions', async (scenario: StandardScenario) => {
    const result = await actions()

    expect(result.length).toEqual(Object.keys(scenario.action).length)
  })

  scenario('returns a single action', async (scenario: StandardScenario) => {
    const result = await action({ id: scenario.action.one.id })

    expect(result).toEqual(scenario.action.one)
  })

  scenario('creates a action', async () => {
    const result = await createAction({
      input: { name: 'String6503543', updatedAt: '2026-01-20T03:37:43.784Z' },
    })

    expect(result.name).toEqual('String6503543')
    expect(result.updatedAt).toEqual(new Date('2026-01-20T03:37:43.784Z'))
  })

  scenario('updates a action', async (scenario: StandardScenario) => {
    const original = (await action({ id: scenario.action.one.id })) as Action
    const result = await updateAction({
      id: original.id,
      input: { name: 'String38814392' },
    })

    expect(result.name).toEqual('String38814392')
  })

  scenario('deletes a action', async (scenario: StandardScenario) => {
    const original = (await deleteAction({
      id: scenario.action.one.id,
    })) as Action
    const result = await action({ id: original.id })

    expect(result).toEqual(null)
  })
})
