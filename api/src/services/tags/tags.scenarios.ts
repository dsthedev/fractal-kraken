import type { Prisma, Tag } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.TagCreateArgs>({
  tag: {
    one: {
      data: {
        name: 'String',
        updatedAt: '2026-02-23T20:02:18.208Z',
        author: {
          create: {
            email: 'String9110155',
            updatedAt: '2026-02-23T20:02:18.232Z',
          },
        },
      },
    },
    two: {
      data: {
        name: 'String',
        updatedAt: '2026-02-23T20:02:18.232Z',
        author: {
          create: {
            email: 'String5531438',
            updatedAt: '2026-02-23T20:02:18.255Z',
          },
        },
      },
    },
  },
})

export type StandardScenario = ScenarioData<Tag, 'tag'>
