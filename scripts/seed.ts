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

// const _cleanDatabase = async () => {
//   // Delete in reverse order of dependencies to avoid FK constraint violations
//   await db.billableItem.deleteMany({})
//   await db.estimate.deleteMany({})
//   await db.rate.deleteMany({})
//   await db.entity.deleteMany({})
//   await db.service.deleteMany({})
//   await db.measurementUnit.deleteMany({})
//   await db.user.deleteMany({})
// }

const seedUsers = async () => {
  const records = readCsv('20260121-users.csv')
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
  const records = readCsv('20260121-measurement-units.csv')
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
        // dimension: (row.dimension || 'CUSTOM') as any,
        description: row.description || null,
        // conversionFactor: row.conversionFactor
        //   ? parseFloat(row.conversionFactor)
        //   : null,
        // baseUnit: row.baseUnit || null,
      },
    })
  }
  return records.length
}

const seedMaterials = async () => {
  const records = readCsv('20260121-materials.csv')
  for (const row of records) {
    const name = row.name
    if (!name) continue
    await db.material.upsert({
      where: { name },
      update: { description: row.description || null },
      create: { name, description: row.description || null },
    })
  }
  return records.length
}

const seedServices = async () => {
  const records = readCsv('20260121-services.csv')
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

// Seed simple actions list (separate CSV) — can be run manually later
export const seedActions = async () => {
  const records = readCsv('20260121-actions.csv')
  for (const row of records) {
    const actionName = (row.action || '').toString()
    if (!actionName) continue
    // Upsert into the separate Action model (unique `name`)
    await db.action.upsert({
      where: { name: actionName },
      update: { description: row.description || null },
      create: { name: actionName, description: row.description || null },
    })
  }
  return records.length
}

const seedRates = async () => {
  const records = readCsv('20260121-rates.csv')
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
  const records = readCsv('20260121-entities.csv')
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
  const records = readCsv('20260121-estimates.csv')
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
  const records = readCsv('20260121-billable-items.csv')
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

// Ordered model seed configuration. Adjust this array to control clean/seed order.
const modelSeeds = [
  {
    key: 'users',
    sequenceName: 'User',
    clean: async () => db.user.deleteMany({}),
    seed: seedUsers,
  },
  {
    key: 'measurementUnits',
    sequenceName: 'MeasurementUnit',
    clean: async () => db.measurementUnit.deleteMany({}),
    seed: seedMeasurementUnits,
  },
  // {
  //   key: 'services',
  //   sequenceName: 'Service',
  //   clean: async () => db.service.deleteMany({}),
  //   seed: seedServices,
  // },
  {
    key: 'materials',
    sequenceName: 'Material',
    clean: async () => db.material.deleteMany({}),
    seed: seedMaterials,
  },
  {
    key: 'actions',
    sequenceName: 'Action',
    clean: async () => db.action.deleteMany({}),
    seed: seedActions,
  },
  // {
  //   key: 'rates',
  //   sequenceName: 'Rate',
  //   clean: async () => db.rate.deleteMany({}),
  //   seed: seedRates,
  // },
  {
    key: 'entities',
    sequenceName: 'Entity',
    clean: async () => db.entity.deleteMany({}),
    seed: seedEntities,
  },
  // {
  //   key: 'estimates',
  //   sequenceName: 'Estimate',
  //   clean: async () => db.estimate.deleteMany({}),
  //   seed: seedEstimates,
  // },
  // {
  //   key: 'billableItems',
  //   sequenceName: 'BillableItem',
  //   clean: async () => db.billableItem.deleteMany({}),
  //   seed: seedBillableItems,
  // },
]

const resetSequences = async () => {
  // Reset auto-increment sequences based on configured models.
  const sequences = new Set<string>()
  for (const m of modelSeeds) {
    if (m.sequenceName) sequences.add(m.sequenceName)
  }

  for (const seq of sequences) {
    // Use pg_get_serial_sequence to find the underlying sequence for the id column
    const sql = `SELECT setval(pg_get_serial_sequence('"${seq}"', 'id'), COALESCE((SELECT MAX(id) FROM "${seq}"), 0) + 1, false);`
    await db.$executeRawUnsafe(sql)
  }
}

export default async () => {
  try {
    console.info('\n🌱 Starting database seed...\n')

    console.info('  Cleaning database...')
    // Run cleans in reverse order to avoid FK violations
    for (const model of [...modelSeeds].reverse()) {
      console.info(`    - Cleaning ${model.key}`)
      await model.clean()
    }
    console.info('  ✓ Database cleaned')

    // Seed each model in configured order
    for (const model of modelSeeds) {
      console.info(`  Seeding ${model.key}...`)
      const count = await model.seed()
      console.info(`  ✓ Seeded ${count} ${model.key}`)
    }

    console.info('  Resetting auto-increment sequences...')
    await resetSequences()
    console.info('  ✓ Sequences reset')

    console.info('\n✓ Database seed complete!\n')
  } catch (error) {
    console.error(error)
  }
}
