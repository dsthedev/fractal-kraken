import type {
  QueryResolvers,
  MutationResolvers,
  EntityRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const entities: QueryResolvers['entities'] = () => {
  return db.entity.findMany()
}

export const entity: QueryResolvers['entity'] = ({ id }) => {
  return db.entity.findUnique({
    where: { id },
  })
}

export const createEntity: MutationResolvers['createEntity'] = ({ input }) => {
  return db.entity.create({
    data: input,
  })
}

export const updateEntity: MutationResolvers['updateEntity'] = ({
  id,
  input,
}) => {
  return db.entity.update({
    data: input,
    where: { id },
  })
}

export const deleteEntity: MutationResolvers['deleteEntity'] = ({ id }) => {
  return db.entity.delete({
    where: { id },
  })
}

export const deleteAllEntities: MutationResolvers['deleteAllEntities'] =
  async () => {
    const result = await db.entity.deleteMany({})
    return {
      success: true,
      message: 'All entities deleted successfully',
      count: result.count,
    }
  }

export const importEntities: MutationResolvers['importEntities'] = async ({
  data,
}) => {
  const errors: string[] = []
  let successCount = 0

  for (const entityData of data) {
    try {
      await db.entity.create({
        data: entityData,
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
