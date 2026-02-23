import type { Tag } from '@prisma/client'

import { tags, tag, createTag, updateTag, deleteTag } from './tags.js'
import type { StandardScenario } from './tags.scenarios.js'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://cedarjs.com/docs/testing#testing-services
// https://cedarjs.com/docs/testing#jest-expect-type-considerations

describe('tags', () => {
  scenario('returns all tags', async (scenario: StandardScenario) => {
    const result = await tags()

    expect(result.length).toEqual(Object.keys(scenario.tag).length)
  })

  scenario('returns a single tag', async (scenario: StandardScenario) => {
    const result = await tag({ id: scenario.tag.one.id })

    expect(result).toEqual(scenario.tag.one)
  })

  scenario('creates a tag', async (scenario: StandardScenario) => {
    const result = await createTag({
      input: {
        name: 'String',
        authorId: scenario.tag.two.authorId,
        updatedAt: '2026-02-23T20:02:18.047Z',
      },
    })

    expect(result.name).toEqual('String')
    expect(result.authorId).toEqual(scenario.tag.two.authorId)
    expect(result.updatedAt).toEqual(new Date('2026-02-23T20:02:18.047Z'))
  })

  scenario('updates a tag', async (scenario: StandardScenario) => {
    const original = (await tag({ id: scenario.tag.one.id })) as Tag
    const result = await updateTag({
      id: original.id,
      input: { name: 'String2' },
    })

    expect(result.name).toEqual('String2')
  })

  scenario('deletes a tag', async (scenario: StandardScenario) => {
    const original = (await deleteTag({ id: scenario.tag.one.id })) as Tag
    const result = await tag({ id: original.id })

    expect(result).toEqual(null)
  })
})
