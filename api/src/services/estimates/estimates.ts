import type {
  QueryResolvers,
  MutationResolvers,
  EstimateRelationResolvers,
} from 'types/graphql'

import { context } from '@cedarjs/graphql-server'

import { db } from 'src/lib/db'

export const estimates: QueryResolvers['estimates'] = () => {
  return db.estimate.findMany({
    where: {
      authorId: context.currentUser?.id,
    },
    include: {
      installerEntity: true,
      clientEntity: true,
      retailerEntity: true,
      author: true,
      entity: true,
      billableItems: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          action: true,
          material: true,
          unit: true,
          author: true,
        },
      },
    },
  })
}

export const estimate: QueryResolvers['estimate'] = ({ id }) => {
  return db.estimate.findFirst({
    where: {
      id,
      authorId: context.currentUser?.id,
    },
    include: {
      installerEntity: true,
      clientEntity: true,
      retailerEntity: true,
      author: true,
      entity: true,
      billableItems: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          action: true,
          material: true,
          unit: true,
          author: true,
        },
      },
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

export const importEstimates: MutationResolvers['importEstimates'] = async ({
  data,
}) => {
  const currentUserId = context.currentUser?.id
  if (!currentUserId) {
    return {
      success: false,
      message: 'User not authenticated',
      errors: ['Must be logged in to import estimates'],
      count: 0,
    }
  }

  const errors: string[] = []
  let successCount = 0

  for (const estimateData of data) {
    try {
      const createData: any = {
        ...estimateData,
        authorId: currentUserId,
      }

      // Remove invalid entity references (prevent foreign key errors)
      if (!createData.installerEntityId || createData.installerEntityId <= 0) {
        delete createData.installerEntityId
      }
      if (!createData.clientEntityId || createData.clientEntityId <= 0) {
        delete createData.clientEntityId
      }
      if (!createData.retailerEntityId || createData.retailerEntityId <= 0) {
        delete createData.retailerEntityId
      }
      if (!createData.entityId || createData.entityId <= 0) {
        delete createData.entityId
      }

      await db.estimate.create({
        data: createData,
      })
      successCount++
    } catch (error) {
      errors.push(
        `Failed to import estimate "${estimateData.title || estimateData.uuid}": ${error.message}`
      )
    }
  }

  return {
    success: successCount > 0,
    message:
      successCount > 0
        ? 'Estimates imported successfully'
        : 'No estimates imported',
    errors: errors.length > 0 ? errors : null,
    count: successCount,
  }
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
