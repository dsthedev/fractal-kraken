import type {
  QueryResolvers,
  MutationResolvers,
  EntityRelationResolvers,
} from 'types/graphql'

import { context } from '@cedarjs/graphql-server'

import { db } from 'src/lib/db'

export const entities: QueryResolvers['entities'] = () => {
  return db.entity.findMany({
    where: {
      authorId: context.currentUser?.id ?? undefined,
    },
  })
}

export const entity: QueryResolvers['entity'] = ({ id }) => {
  return db.entity.findFirst({
    where: {
      id,
      authorId: context.currentUser?.id ?? undefined,
    },
  })
}

export const createEntity: MutationResolvers['createEntity'] = ({ input }) => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new Error('User must be authenticated to create entities')
  }

  return db.entity.create({
    data: {
      ...input,
      authorId: userId,
    },
  })
}

export const updateEntity: MutationResolvers['updateEntity'] = ({
  id,
  input,
}) => {
  // Ensure user can only update their own entities
  return db.entity
    .updateMany({
      data: input,
      where: {
        id,
        authorId: context.currentUser?.id ?? undefined,
      },
    })
    .then(async (result) => {
      if (result.count === 0) {
        throw new Error(
          'Entity not found or you do not have permission to update it'
        )
      }
      // Return the updated entity
      return db.entity.findUnique({
        where: { id },
      })
    })
}

export const deleteEntity: MutationResolvers['deleteEntity'] = ({ id }) => {
  // Return deleted entity for response, with authorization check
  return db.entity
    .delete({
      where: {
        id,
        authorId: context.currentUser?.id ?? undefined,
      },
    })
    .catch(() => {
      throw new Error(
        'Entity not found or you do not have permission to delete it'
      )
    })
}

export const deleteAllEntities: MutationResolvers['deleteAllEntities'] =
  async () => {
    const result = await db.entity.deleteMany({
      where: {
        authorId: context.currentUser?.id ?? undefined,
      },
    })
    return {
      success: true,
      message: 'All entities deleted successfully',
      count: result.count,
    }
  }

export const importEntities: MutationResolvers['importEntities'] = async ({
  data,
}) => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new Error('User must be authenticated to import entities')
  }

  const errors: string[] = []
  let successCount = 0

  for (const entityData of data) {
    try {
      await db.entity.create({
        data: {
          ...entityData,
          authorId: userId,
        },
      })
      successCount++
    } catch (error) {
      errors.push(
        `Failed to import entity "${entityData.name}": ${error.message}`
      )
    }
  }

  return {
    success: successCount > 0,
    message:
      successCount > 0
        ? 'Entities imported successfully'
        : 'No entities imported',
    errors: errors.length > 0 ? errors : null,
    count: successCount,
  }
}

export const Entity: EntityRelationResolvers = {
  usersDefault: (_obj, { root }) => {
    return db.entity.findUnique({ where: { id: root?.id } }).usersDefault()
  },
  usersRetailer: (_obj, { root }) => {
    return db.entity.findUnique({ where: { id: root?.id } }).usersRetailer()
  },
}
