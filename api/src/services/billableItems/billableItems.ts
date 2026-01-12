import type {
  QueryResolvers,
  MutationResolvers,
  BillableItemRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const billableItems: QueryResolvers['billableItems'] = () => {
  return db.billableItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
}

export const billableItem: QueryResolvers['billableItem'] = ({ id }) => {
  return db.billableItem.findUnique({
    where: { id },
  })
}

export const createBillableItem: MutationResolvers['createBillableItem'] = ({
  input,
}) => {
  return db.billableItem.create({
    data: input,
  })
}

export const updateBillableItem: MutationResolvers['updateBillableItem'] = ({
  id,
  input,
}) => {
  return db.billableItem.update({
    data: input,
    where: { id },
  })
}

export const deleteBillableItem: MutationResolvers['deleteBillableItem'] = ({
  id,
}) => {
  return db.billableItem.delete({
    where: { id },
  })
}

export const BillableItem: BillableItemRelationResolvers = {
  service: (_obj, { root }) => {
    return db.billableItem.findUnique({ where: { id: root?.id } }).service()
  },
  unit: (_obj, { root }) => {
    return db.billableItem.findUnique({ where: { id: root?.id } }).unit()
  },
  author: (_obj, { root }) => {
    return db.billableItem.findUnique({ where: { id: root?.id } }).author()
  },
  estimate: (_obj, { root }) => {
    return db.billableItem.findUnique({ where: { id: root?.id } }).estimate()
  },
}
