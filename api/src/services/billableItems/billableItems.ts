import type {
  QueryResolvers,
  MutationResolvers,
  BillableItemRelationResolvers,
} from 'types/graphql'

import { context } from '@cedarjs/graphql-server'

import { db } from 'src/lib/db'

export const billableItems: QueryResolvers['billableItems'] = () => {
  return db.billableItem.findMany({
    where: {
      authorId: context.currentUser?.id,
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      action: true,
      material: true,
      unit: true,
      author: true,
      estimate: true,
    },
  }) as unknown as any
}

export const billableItem: QueryResolvers['billableItem'] = ({ id }) => {
  return db.billableItem.findFirst({
    where: {
      id,
      authorId: context.currentUser?.id,
    },
    include: {
      action: true,
      material: true,
      unit: true,
      author: true,
      estimate: true,
    },
  }) as unknown as any
}

export const billableItemsPage: QueryResolvers['billableItemsPage'] = async ({
  page = 1,
  pageSize = 10,
}) => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Validate and sanitize inputs
  const validatedPage = Math.max(1, page)
  const validatedPageSize = Math.min(Math.max(1, pageSize), 100) // Max 100 per page
  const skip = (validatedPage - 1) * validatedPageSize

  const where = { authorId: userId }

  // Execute queries in parallel for efficiency
  const [billableItems, totalCount] = await Promise.all([
    db.billableItem.findMany({
      where,
      skip,
      take: validatedPageSize,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        action: true,
        material: true,
        unit: true,
        author: true,
        estimate: true,
      },
    }),
    db.billableItem.count({ where }),
  ])

  const hasMore = skip + billableItems.length < totalCount

  return {
    billableItems: billableItems as any,
    count: totalCount,
    hasMore,
    page: validatedPage,
    pageSize: validatedPageSize,
  }
}

export const createBillableItem: MutationResolvers['createBillableItem'] = ({
  input,
}) => {
  // Sanitize input: remove any nested relation objects (e.g., legacy `service`)
  const {
    action: _action,
    material: _material,
    unit: _unit,
    author: _author,
    estimate: _estimate,
    ...data
  } = input as any

  return db.billableItem.create({
    data,
  })
}

export const updateBillableItem: MutationResolvers['updateBillableItem'] = ({
  id,
  input,
}) => {
  // Sanitize update input similarly to create
  const {
    action: _action,
    material: _material,
    unit: _unit,
    author: _author,
    estimate: _estimate,
    ...data
  } = input as any

  return db.billableItem.update({
    data,
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

export const orphanedBillableItems = async () => {
  return db.billableItem.findMany({
    where: {
      AND: [{ estimateId: null }, { invoiceUuid: null }],
    },
    include: { estimate: true, invoice: true, author: true },
  })
}

export const deleteOrphanedBillableItems = async ({
  ids,
}: {
  ids: number[]
}) => {
  const result = await db.billableItem.deleteMany({
    where: { id: { in: ids } },
  })
  return result.count
}

export const BillableItem: BillableItemRelationResolvers = {
  action: (_obj, { root }) => {
    return db.billableItem.findUnique({ where: { id: root?.id } }).action()
  },
  material: (_obj, { root }) => {
    return db.billableItem.findUnique({ where: { id: root?.id } }).material()
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
