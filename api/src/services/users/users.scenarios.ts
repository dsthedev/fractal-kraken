import type { Prisma, User } from '@prisma/client'

import type { ScenarioData } from '@cedarjs/testing/api'

export const standard = defineScenario<Prisma.UserCreateArgs>({
  user: {
    one: {
      data: { email: 'String1641073', updatedAt: '2026-01-08T04:21:23.179Z' },
    },
    two: {
      data: { email: 'String4259703', updatedAt: '2026-01-08T04:21:23.179Z' },
    },
  },
})

export type StandardScenario = ScenarioData<User, 'user'>
