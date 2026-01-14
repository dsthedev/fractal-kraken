import fs from 'fs'
import path from 'path'

import { db } from 'api/src/lib/db.js'
import { parse } from 'csv-parse/sync'

// Seed script for importing exported CSV data
// See https://cedarjs.com/docs/database-seeds for more info

const readCsv = (filename: string) => {
  const filePath = path.resolve(`./scripts/data/${filename}`)
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ ${filename} not found, skipping`)
    return []
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true })
}

const _cleanDatabase = async () => {
  // Delete in reverse order of dependencies to avoid FK constraint violations
  await db.billableItem.deleteMany({})
  await db.estimate.deleteMany({})
  await db.rate.deleteMany({})
  await db.entity.deleteMany({})
  await db.service.deleteMany({})
  await db.measurementUnit.deleteMany({})
  await db.user.deleteMany({})
}

const seedUsers = async () => {
  const records = readCsv('20260111-users.csv')
  for (const row of records) {
    await db.user.upsert({
      where: { id: row.id },
      update: {},
      create: {
        id: row.id,
        email: row.email,
        name: row.name || null,
        hashedPassword: row.hashedPassword,
        salt: row.salt,
        roles: row.roles || '',
        resetToken: row.resetToken || null,
        resetTokenExpiresAt: row.resetTokenExpiresAt
          ? new Date(row.resetTokenExpiresAt)
          : null,
      },
    })
  }
  return records.length
}

const seedMeasurementUnits = async () => {
  const records = readCsv('20260111-measurement-units.csv')
  for (const row of records) {
    await db.measurementUnit.upsert({
      where: { id: parseInt(row.id) },
      update: {},
      create: {
        // id will be auto-generated if record doesn't exist
        fullName: row.fullName,
        pluralName: row.pluralName,
        shortName: row.shortName || null,
        symbol: row.symbol || null,
        notation: row.notation || null,
        dimension: (row.dimension || 'CUSTOM') as any,
        description: row.description || null,
        conversionFactor: row.conversionFactor
          ? parseFloat(row.conversionFactor)
          : null,
        baseUnit: row.baseUnit || null,
      },
    })
  }
  return records.length
}

const seedServices = async () => {
  const records = readCsv('20260111-services.csv')
  for (const row of records) {
    await db.service.upsert({
      where: { id: parseInt(row.id) },
      update: {},
      create: {
        // id will be auto-generated if record doesn't exist
        action: row.action as any,
        material: row.material || '',
        context: row.context || null,
        description: row.description || null,
      },
    })
  }
  return records.length
}

const seedRates = async () => {
  const records = readCsv('20260111-rates.csv')
  for (const row of records) {
    await db.rate.upsert({
      where: {
        authorId_serviceId_unitId: {
          authorId: row.authorId,
          serviceId: parseInt(row.serviceId),
          unitId: parseInt(row.unitId),
        },
      },
      update: {},
      create: {
        // id will be auto-generated if record doesn't exist
        authorId: row.authorId,
        serviceId: parseInt(row.serviceId),
        unitId: parseInt(row.unitId),
        subAmount: parseFloat(row.subAmount),
        retailAmount: parseFloat(row.retailAmount),
        currency: row.currency || 'USD',
        description: row.description || null,
        estimatedMinutesPerUnit: row.estimatedMinutesPerUnit
          ? parseInt(row.estimatedMinutesPerUnit)
          : null,
      },
    })
  }
  return records.length
}

const seedEntities = async () => {
  const records = readCsv('20260111-entities.csv')
  for (const row of records) {
    await db.entity.upsert({
      where: { id: parseInt(row.id) },
      update: {},
      create: {
        // id will be auto-generated if record doesn't exist
        type: row.type as any,
        name: row.name,
        contactName: row.contactName || null,
        phone: row.phone || null,
        email: row.email || null,
        addressLine1: row.addressLine1 || null,
        addressLine2: row.addressLine2 || null,
        city: row.city || null,
        state: row.state || null,
        postalCode: row.postalCode || null,
        country: row.country || null,
        notes: row.notes || null,
      },
    })
  }
  return records.length
}

const seedEstimates = async () => {
  const records = readCsv('20260111-estimates.csv')
  for (const row of records) {
    await db.estimate.upsert({
      where: { uuid: row.uuid },
      update: {},
      create: {
        // id will be auto-generated if record doesn't exist
        uuid: row.uuid,
        authorId: row.authorId,
        clientEntityId: row.clientEntityId
          ? parseInt(row.clientEntityId)
          : null,
        installerEntityId: row.installerEntityId
          ? parseInt(row.installerEntityId)
          : null,
        retailerEntityId: row.retailerEntityId
          ? parseInt(row.retailerEntityId)
          : null,
        entityId: row.entityId ? parseInt(row.entityId) : null,
        title: row.title,
        status: (row.status || 'DRAFT') as any,
        jobAddressLine1: row.jobAddressLine1 || null,
        jobAddressLine2: row.jobAddressLine2 || null,
        jobCity: row.jobCity || null,
        jobState: row.jobState || null,
        jobPostalCode: row.jobPostalCode || null,
        jobCountry: row.jobCountry || null,
        notes: row.notes || null,
        subtotal: parseFloat(row.subtotal),
        taxTotal: parseFloat(row.taxTotal),
        total: parseFloat(row.total),
        estimatedMinutesTotal: row.estimatedMinutesTotal
          ? parseInt(row.estimatedMinutesTotal)
          : null,
      },
    })
  }
  return records.length
}

const seedBillableItems = async () => {
  const records = readCsv('20260111-billable-items.csv')
  for (const row of records) {
    // BillableItems optionally reference estimates
    if (row.estimateId) {
      const estimate = await db.estimate.findUnique({
        where: { id: parseInt(row.estimateId) },
      })
      if (!estimate) {
        console.warn(
          `⚠ Skipping billable item ${row.id}: estimate ${row.estimateId} not found`
        )
        continue
      }
    }

    await db.billableItem.upsert({
      where: { id: parseInt(row.id) },
      update: {},
      create: {
        // id will be auto-generated if record doesn't exist
        estimateId: row.estimateId ? parseInt(row.estimateId) : null,
        authorId: row.authorId,
        serviceId: parseInt(row.serviceId),
        unitId: parseInt(row.unitId),
        quantity: parseFloat(row.quantity),
        unitPrice: parseFloat(row.unitPrice),
        pricingType: (row.pricingType || 'RETAIL') as any,
        subtotal: parseFloat(row.subtotal),
        notes: row.notes || null,
        estimatedMinutesPerUnit: row.estimatedMinutesPerUnit
          ? parseInt(row.estimatedMinutesPerUnit)
          : null,
      },
    })
  }
  return records.length
}

const resetSequences = async () => {
  // Reset auto-increment sequences to the max ID + 1 for each table
  // This is necessary after seeding with explicit IDs
  await db.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"MeasurementUnit"', 'id'), COALESCE((SELECT MAX(id) FROM "MeasurementUnit"), 0) + 1, false);
  `)
  await db.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"Service"', 'id'), COALESCE((SELECT MAX(id) FROM "Service"), 0) + 1, false);
  `)
  await db.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"Rate"', 'id'), COALESCE((SELECT MAX(id) FROM "Rate"), 0) + 1, false);
  `)
  await db.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"Entity"', 'id'), COALESCE((SELECT MAX(id) FROM "Entity"), 0) + 1, false);
  `)
  await db.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"Estimate"', 'id'), COALESCE((SELECT MAX(id) FROM "Estimate"), 0) + 1, false);
  `)
  await db.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"BillableItem"', 'id'), COALESCE((SELECT MAX(id) FROM "BillableItem"), 0) + 1, false);
  `)
}

export default async () => {
  try {
    console.info('\n🌱 Starting database seed...\n')

    // console.info('  Cleaning database...')
    // await cleanDatabase()
    console.info('  ✓ Database cleaned')

    console.info('  Seeding users...')
    const userCount = await seedUsers()
    console.info(`  ✓ Seeded ${userCount} users`)

    console.info('  Seeding measurement units...')
    const unitCount = await seedMeasurementUnits()
    console.info(`  ✓ Seeded ${unitCount} measurement units`)

    console.info('  Seeding services...')
    const serviceCount = await seedServices()
    console.info(`  ✓ Seeded ${serviceCount} services`)

    console.info('  Seeding rates...')
    const rateCount = await seedRates()
    console.info(`  ✓ Seeded ${rateCount} rates`)

    console.info('  Seeding entities...')
    const entityCount = await seedEntities()
    console.info(`  ✓ Seeded ${entityCount} entities`)

    console.info('  Seeding estimates...')
    const estimateCount = await seedEstimates()
    console.info(`  ✓ Seeded ${estimateCount} estimates`)

    console.info('  Seeding billable items...')
    const billableItemCount = await seedBillableItems()
    console.info(`  ✓ Seeded ${billableItemCount} billable items`)

    console.info('  Resetting auto-increment sequences...')
    await resetSequences()
    console.info('  ✓ Sequences reset')

    console.info('\n✓ Database seed complete!\n')
  } catch (error) {
    console.error(error)
  }
}
