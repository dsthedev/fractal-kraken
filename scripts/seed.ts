import { faker } from '@faker-js/faker'
import { db } from 'api/src/lib/db.js'

// Manually apply seeds via the `yarn cedar prisma db seed` command.

// Seeds automatically run the first time you run the `yarn cedar prisma migrate dev`
// command and every time you run the `yarn cedar prisma migrate reset` command.

// See https://cedarjs.com/docs/database-seeds for more info

export default async () => {
  try {
    const count = 10

    for (let i = 0; i < count; i++) {
      const name = faker.person.fullName()
      const email = faker.internet.email().toLowerCase()

      await db.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name,
        },
      })
    }

    console.info(`Seeded ${count} users`)
  } catch (error) {
    console.error(error)
  } finally {
    await db.$disconnect()
  }
}
