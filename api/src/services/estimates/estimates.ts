import type {
  QueryResolvers,
  MutationResolvers,
  EstimateRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'
import { context } from '@cedarjs/graphql-server'

export const estimates: QueryResolvers['estimates'] = () => {
  return db.estimate.findMany({
    where: {
      authorId: context.currentUser?.id,
    },
  })
}

export const estimate: QueryResolvers['estimate'] = ({ id }) => {
  return db.estimate.findFirst({
    where: {
      id,
      authorId: context.currentUser?.id,
    },
  })
}

export const createEstimate: MutationResolvers['createEstimate'] = ({
  input,
}) => {
  return db.estimate.create({
    data: input,
  })
}

export const updateEstimate: MutationResolvers['updateEstimate'] = ({
  id,
  input,
}) => {
  return db.estimate.update({
    data: input,
    where: { id },
  })
}

export const deleteEstimate: MutationResolvers['deleteEstimate'] = ({ id }) => {
  return db.estimate.delete({
    where: { id },
  })
}

export const Estimate: EstimateRelationResolvers = {
  installerEntity: (_obj, { root }) => {
    return db.estimate.findUnique({ where: { id: root?.id } }).installerEntity()
  },
  clientEntity: (_obj, { root }) => {
    return db.estimate.findUnique({ where: { id: root?.id } }).clientEntity()
  },
  retailerEntity: (_obj, { root }) => {
    return db.estimate.findUnique({ where: { id: root?.id } }).retailerEntity()
  },
  author: (_obj, { root }) => {
    return db.estimate.findUnique({ where: { id: root?.id } }).author()
  },
  billableItems: (_obj, { root }) => {
    return db.estimate
      .findUnique({ where: { id: root?.id } })
      .billableItems({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
  },
  entity: (_obj, { root }) => {
    return db.estimate.findUnique({ where: { id: root?.id } }).entity()
  },
}
