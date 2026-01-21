import type {
  QueryResolvers,
  MutationResolvers,
  MaterialRelationResolvers,
} from 'types/graphql'

import { context } from '@cedarjs/graphql-server'

import { db } from 'src/lib/db'

export const materials: QueryResolvers['materials'] = () => {
  return db.material.findMany()
}

export const material: QueryResolvers['material'] = ({ id }) => {
  return db.material.findUnique({
    where: { id },
  })
}

export const createMaterial: MutationResolvers['createMaterial'] = ({
  input,
}) => {
  return db.material.create({
    data: input,
  })
}

export const updateMaterial: MutationResolvers['updateMaterial'] = ({
  id,
  input,
}) => {
  return db.material.update({
    data: input,
    where: { id },
  })
}

export const deleteMaterial: MutationResolvers['deleteMaterial'] = ({ id }) => {
  return db.material.delete({
    where: { id },
  })
}

export const importMaterials: MutationResolvers['importMaterials'] = async ({
  data,
}) => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new Error('User not authenticated')
  }

  let importedCount = 0
  const errors: string[] = []

  for (const row of data) {
    try {
      const existing = await db.material.findUnique({
        where: { name: row.name },
      })
      if (existing) {
        await db.material.update({
          where: { id: existing.id },
          data: { description: row.description || null },
        })
      } else {
        await db.material.create({
          data: { name: row.name, description: row.description || null },
        })
      }
      importedCount++
    } catch (error) {
      errors.push(
        `Failed to import material: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const message =
    errors.length > 0
      ? `Imported ${importedCount} materials with ${errors.length} errors`
      : `Successfully imported ${importedCount} materials`

  return {
    success: errors.length === 0,
    message,
    count: importedCount,
  }
}

export const deleteAllMaterials: MutationResolvers['deleteAllMaterials'] =
  async () => {
    const userId = context.currentUser?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const result = await db.material.deleteMany({})

    return {
      success: true,
      message: `Successfully deleted all materials`,
      count: result.count,
    }
  }

export const Material: MaterialRelationResolvers = {
  rates: (_obj, { root }) => {
    return db.material.findUnique({ where: { id: root?.id } }).rates()
  },
  billableItems: (_obj, { root }) => {
    return db.material.findUnique({ where: { id: root?.id } }).billableItems()
  },
}
