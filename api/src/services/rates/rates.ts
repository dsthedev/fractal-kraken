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
          },
        })
      } else {
        // Create new rate
        await db.rate.create({
          data: {
            ...rateData,
            authorId: userId,
          },
        })
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
