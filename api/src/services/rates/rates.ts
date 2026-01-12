import type {
  QueryResolvers,
  MutationResolvers,
  RateRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'
import { context } from '@cedarjs/graphql-server'

import { parseRatesData as parseRatesDataService } from './parseRatesData'

export const rates: QueryResolvers['rates'] = () => {
  return db.rate.findMany({
    where: {
      authorId: context.currentUser?.id,
    },
  })
}

export const rate: QueryResolvers['rate'] = ({ id }) => {
  return db.rate.findFirst({
    where: {
      id,
      authorId: context.currentUser?.id,
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

export const Rate: RateRelationResolvers = {
  service: (_obj, { root }) => {
    return db.rate.findUnique({ where: { id: root?.id } }).service()
  },
  unit: (_obj, { root }) => {
    return db.rate.findUnique({ where: { id: root?.id } }).unit()
  },
  author: (_obj, { root }) => {
    return db.rate.findUnique({ where: { id: root?.id } }).author()
  },
}
