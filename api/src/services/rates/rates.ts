import type {
  QueryResolvers,
  MutationResolvers,
  RateRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

import { parseRatesData as parseRatesDataService } from './parseRatesData'

export const rates: QueryResolvers['rates'] = () => {
  return db.rate.findMany()
}

export const rate: QueryResolvers['rate'] = ({ id }) => {
  return db.rate.findUnique({
    where: { id },
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
