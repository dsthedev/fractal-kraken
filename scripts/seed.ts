import fs from 'fs'
import path from 'path'

import { faker } from '@faker-js/faker'
import { db } from 'api/src/lib/db.js'
import { parse } from 'csv-parse/sync'

// Manually apply seeds via the `yarn cedar prisma db seed` command.
// See https://cedarjs.com/docs/database-seeds for more info

// ============================================================================
// SEED CONFIGURATION
// ============================================================================
// Control which data types are seeded. Set force to true to always reseed,
// or false to only seed if the table is empty.
// Override via environment: FORCE_SEED_MEASUREMENT_UNITS=true yarn cedar prisma db seed

const seedConfig = {
  fakeUsers: {
    enabled: false,
    force: false, // Set to true to always reseed fakeUsers
  },
  measurementUnits: {
    enabled: true,
    force: false, // Set to true to always reseed measurement units
  },
  services: {
    enabled: true,
    force: false,
  },
  // Add more data types here as needed:
  // services: { enabled: true, force: false },
  // rates: { enabled: true, force: false },
} as const

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

const seedFakeUsers = async () => {
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

  return count
}

const seedMeasurementUnits = async () => {
  const csvPath = path.resolve(
    './scripts/data/20240628-export-measurement-units.csv'
  )

  if (!fs.existsSync(csvPath)) {
    console.info('Skipping MeasurementUnit seed: CSV file not found')
    return 0
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    }) as Array<Record<string, string>>

    let seeded = 0
    for (const record of records) {
      await db.measurementUnit.upsert({
        where: { id: parseInt(record.id) },
        update: {},
        create: {
          id: parseInt(record.id),
          fullName: record.fullName,
          pluralName: record.pluralName,
          shortName: record.shortName || null,
          symbol: record.symbol || null,
          notation: record.notation || null,
          dimension: record.dimension as any, // Enum value
          description: record.description || null,
          conversionFactor: record.conversionFactor
            ? parseFloat(record.conversionFactor)
            : null,
          category: record.category as any, // Enum value
          baseUnit: record.baseUnit || null,
        },
      })
      seeded++
    }

    // Reset the auto-increment sequence to avoid ID conflicts
    await db.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('"MeasurementUnit"', 'id'),
        COALESCE((SELECT MAX(id) FROM "MeasurementUnit"), 1),
        true
      );
    `)

    return seeded
  } catch (error) {
    console.error('Error seeding MeasurementUnit:', error)
    return 0
  }
}

const seedServices = async () => {
  const csvPath = path.resolve('./scripts/data/inferred_services.csv')

  if (!fs.existsSync(csvPath)) {
    console.info('Skipping Service seed: inferred_services.csv not found')
    return 0
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    }) as Array<Record<string, string>>

    let seeded = 0
    for (const record of records) {
      const where = {
        action: record.action as any,
        material: record.material || '',
        description: record.description || '',
      }

      const exists = await db.service.findFirst({ where })
      if (exists && !seedConfig.services?.force) {
        continue
      }

      if (!exists) {
        await db.service.create({
          data: {
            action: record.action as any,
            material: record.material || '',
            context: record.context || null,
            description: record.description || null,
          },
        })
        seeded++
      }
    }

    return seeded
  } catch (error) {
    console.error('Error seeding Service:', error)
    return 0
  }
}

// ============================================================================
// SEED REGISTRY
// ============================================================================
// Maps config keys to their seed functions and checks for existing data

type SeedFunction = () => Promise<number>

const seedRegistry: Record<
  keyof typeof seedConfig,
  {
    fn: SeedFunction
    check: () => Promise<boolean> // Returns true if data already exists
  }
> = {
  fakeUsers: {
    fn: seedFakeUsers,
    check: () => db.user.findFirst().then((u) => !!u),
  },
  measurementUnits: {
    fn: seedMeasurementUnits,
    check: () => db.measurementUnit.findFirst().then((u) => !!u),
  },
  services: {
    fn: seedServices,
    check: () => db.service.findFirst().then((u) => !!u),
  },
}

// ============================================================================
// MAIN SEED EXECUTION
// ============================================================================

export default async () => {
  try {
    console.info('Starting database seed...\n')

    for (const [key, config] of Object.entries(seedConfig)) {
      if (!config.enabled) {
        console.info(`⊘ Skipping ${key} (disabled in config)`)
        continue
      }

      const registryEntry = seedRegistry[key as keyof typeof seedConfig]
      if (!registryEntry) {
        console.warn(`⚠ No seed function found for ${key}`)
        continue
      }

      // Check if data already exists
      const dataExists = await registryEntry.check()
      const shouldSeed = config.force || !dataExists

      if (!shouldSeed) {
        console.info(`⊘ Skipping ${key} (data already exists)`)
        continue
      }

      try {
        const count = await registryEntry.fn()
        console.info(`✓ Seeded ${count} ${key}`)
      } catch (error) {
        console.error(`✗ Error seeding ${key}:`, error)
      }
    }

    console.info('\n✓ Database seed complete')
  } catch (error) {
    console.error('Fatal error during seed:', error)
  } finally {
    await db.$disconnect()
  }
}
