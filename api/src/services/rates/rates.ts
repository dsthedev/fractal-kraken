import type {
  QueryResolvers,
  MutationResolvers,
  RateRelationResolvers,
} from 'types/graphql'

import { context } from '@cedarjs/graphql-server'

import { db } from 'src/lib/db'

import { parseRatesData as parseRatesDataService } from './parseRatesData'

export const rates: QueryResolvers['rates'] = () => {
  return db.rate.findMany({
    where: {
      authorId: context.currentUser?.id,
    },
    include: {
      unit: true,
      author: true,
      action: true,
      material: true,
    },
  })
}

export const rate: QueryResolvers['rate'] = ({ id }) => {
  return db.rate.findFirst({
    where: {
      id,
      authorId: context.currentUser?.id,
    },
    include: {
      unit: true,
      author: true,
      action: true,
      material: true,
    },
  })
}

export const createRate: MutationResolvers['createRate'] = ({ input }) => {
  return db.rate.create({
    data: input,
  })
}

export const updateRate: MutationResolvers['updateRate'] = ({ id, input }) => {
  return db.rate.update({
    data: input,
    where: { id },
  })
}

export const deleteRate: MutationResolvers['deleteRate'] = ({ id }) => {
  return db.rate.delete({
    where: { id },
  })
}

export const parseRatesData: MutationResolvers['parseRatesData'] = async () => {
  return parseRatesDataService()
}

export const convertRatesToDecimal: MutationResolvers['convertRatesToDecimal'] =
  async () => {
    const rates = await db.rate.findMany()

    console.log(`Converting ${rates.length} rates from cents to dollars...`)

    let convertedCount = 0
    for (const rate of rates) {
      const subAmount = (parseFloat(String(rate.subAmount)) / 100).toFixed(2)
      const retailAmount = (
        parseFloat(String(rate.retailAmount)) / 100
      ).toFixed(2)

      await db.rate.update({
        where: { id: rate.id },
        data: {
          subAmount,
          retailAmount,
        },
      })
      convertedCount++
    }

    console.log('✅ Conversion complete')

    return {
      success: true,
      message: `Converted ${convertedCount} rates from cents to dollars`,
      count: convertedCount,
    }
  }

export const importRates: MutationResolvers['importRates'] = async ({
  data,
}) => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new Error('User not authenticated')
  }

  let importedCount = 0
  const errors: string[] = []

  for (const rateData of data) {
    try {
      // Normalize action/material: if an ID is provided but doesn't exist in the
      // current DB, try to resolve by name or create a new record when a name
      // is supplied in the import payload.
      // Resolve or create actions by name if provided. If an actionId was
      // provided but does not exist and no name is available, drop it to avoid
      // FK constraint failures — rates can exist without an action.
      if (rateData.actionId) {
        const existingAction = await db.action.findUnique({
          where: { id: rateData.actionId },
        })
        if (!existingAction) {
          if (rateData.actionName) {
            const byName = await db.action.findFirst({ where: { name: rateData.actionName } })
            if (byName) {
              rateData.actionId = byName.id
            } else {
              const created = await db.action.create({ data: { name: rateData.actionName } })
              rateData.actionId = created.id
            }
          } else {
            // remove actionId to avoid FK error
            delete rateData.actionId
          }
        }
      } else if (rateData.actionName) {
        const byName = await db.action.findFirst({ where: { name: rateData.actionName } })
        if (byName) {
          rateData.actionId = byName.id
        } else {
          const created = await db.action.create({ data: { name: rateData.actionName } })
          rateData.actionId = created.id
        }
      }

      // Resolve material similarly. If materialId is provided but not found
      // and no materialName is present, drop materialId so the import can still
      // proceed (material is optional on Rate).
      if (rateData.materialId) {
        const existingMaterial = await db.material.findUnique({ where: { id: rateData.materialId } })
        if (!existingMaterial) {
          if (rateData.materialName) {
            const byName = await db.material.findFirst({ where: { name: rateData.materialName } })
            if (byName) {
              rateData.materialId = byName.id
            } else {
              const created = await db.material.create({ data: { name: rateData.materialName } })
              rateData.materialId = created.id
            }
          } else {
            delete rateData.materialId
          }
        }
      } else if (rateData.materialName) {
        const byName = await db.material.findFirst({ where: { name: rateData.materialName } })
        if (byName) {
          rateData.materialId = byName.id
        } else {
          const created = await db.material.create({ data: { name: rateData.materialName } })
          rateData.materialId = created.id
        }
      }

      // Resolve unit: unitId is required for the import input, but the local
      // DB may have different IDs. Try to find the unit by ID; if not found,
      // attempt to match by `unitFullName` or `unitShortName` if provided in
      // the payload. If still not found, throw a descriptive error for this row.
      if (rateData.unitId !== undefined && rateData.unitId !== null) {
        const existingUnit = await db.measurementUnit.findUnique({ where: { id: rateData.unitId } })
        if (!existingUnit) {
          // attempt match by provided unitFullName/shortName
          let foundUnit = null
          if (rateData.unitShortName) {
            foundUnit = await db.measurementUnit.findFirst({ where: { shortName: rateData.unitShortName } })
          }
          if (!foundUnit && rateData.unitFullName) {
            foundUnit = await db.measurementUnit.findFirst({ where: { fullName: rateData.unitFullName } })
          }
          if (foundUnit) {
            rateData.unitId = foundUnit.id
          } else {
            throw new Error(`Unit with id ${rateData.unitId} not found and no matching unit name provided`)
          }
        }
      } else {
        throw new Error('Missing required unitId')
      }
      // Check if rate already exists based on action/material + unit combination (if provided)
      const lookup: any = { unitId: rateData.unitId, authorId: userId }
      if (rateData.actionId !== undefined && rateData.actionId !== null) {
        lookup.actionId = rateData.actionId
      }
      if (rateData.materialId !== undefined && rateData.materialId !== null) {
        lookup.materialId = rateData.materialId
      }

      const existingRate = await db.rate.findFirst({ where: lookup })

      if (existingRate) {
        // Update existing rate
        await db.rate.update({
          where: { id: existingRate.id },
          data: {
            subAmount: rateData.subAmount,
            retailAmount: rateData.retailAmount,
            currency: rateData.currency,
            estimatedMinutesPerUnit: rateData.estimatedMinutesPerUnit,
            description: rateData.description,
            context: rateData.context,
          },
        })
      } else {
        // Create new rate — build a sanitized payload with only DB columns
        const createPayload: any = {
          unitId: rateData.unitId,
          subAmount: rateData.subAmount,
          retailAmount: rateData.retailAmount,
          currency: rateData.currency ?? 'USD',
          authorId: userId,
        }

        if (rateData.actionId !== undefined && rateData.actionId !== null) {
          createPayload.actionId = rateData.actionId
        }
        if (rateData.materialId !== undefined && rateData.materialId !== null) {
          createPayload.materialId = rateData.materialId
        }
        if (rateData.estimatedMinutesPerUnit !== undefined && rateData.estimatedMinutesPerUnit !== null) {
          createPayload.estimatedMinutesPerUnit = rateData.estimatedMinutesPerUnit
        }
        if (rateData.description !== undefined) {
          createPayload.description = rateData.description
        }
        if (rateData.context !== undefined) {
          createPayload.context = rateData.context
        }

        // Validate required fields are present on the sanitized payload
        if (!createPayload.unitId) {
          throw new Error('unitId could not be resolved or is missing')
        }
        if (createPayload.subAmount === undefined || createPayload.retailAmount === undefined) {
          throw new Error('subAmount and retailAmount are required')
        }

        await db.rate.create({ data: createPayload })
      }
      importedCount++
    } catch (error) {
      errors.push(
        `Failed to import rate: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const message =
    errors.length > 0
      ? `Imported ${importedCount} rates with ${errors.length} errors`
      : `Successfully imported ${importedCount} rates`

  return {
    success: errors.length === 0,
    message,
    errors,
    count: importedCount,
  }
}

export const deleteAllRates: MutationResolvers['deleteAllRates'] = async () => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const result = await db.rate.deleteMany({
    where: {
      authorId: userId,
    },
  })

  return {
    success: true,
    message: `Successfully deleted all rates`,
    count: result.count,
  }
}

export const Rate: RateRelationResolvers = {
  unit: (_obj, { root }) => {
    return db.rate.findUnique({ where: { id: root?.id } }).unit()
  },
  author: (_obj, { root }) => {
    return db.rate.findUnique({ where: { id: root?.id } }).author()
  },
  action: (_obj, { root }) => {
    return db.rate.findUnique({ where: { id: root?.id } }).action()
  },
  material: (_obj, { root }) => {
    return db.rate.findUnique({ where: { id: root?.id } }).material()
  },
}
