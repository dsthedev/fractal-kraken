import type {
  QueryResolvers,
  MutationResolvers,
  ActionRelationResolvers,
} from 'types/graphql'

import { context } from '@cedarjs/graphql-server'

import { db } from 'src/lib/db'

export const actions: QueryResolvers['actions'] = () => {
  return db.action.findMany()
}

export const action: QueryResolvers['action'] = ({ id }) => {
  return db.action.findUnique({
    where: { id },
  })
}

export const createAction: MutationResolvers['createAction'] = ({ input }) => {
  return db.action.create({
    data: input,
  })
}

export const updateAction: MutationResolvers['updateAction'] = ({
  id,
  input,
}) => {
  return db.action.update({
    data: input,
    where: { id },
  })
}

export const deleteAction: MutationResolvers['deleteAction'] = ({ id }) => {
  return db.action.delete({
    where: { id },
  })
}

export const importActions: MutationResolvers['importActions'] = async ({
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
      const existing = await db.action.findUnique({ where: { name: row.name } })
      if (existing) {
        await db.action.update({
          where: { id: existing.id },
          data: { description: row.description || null },
        })
      } else {
        await db.action.create({
          data: { name: row.name, description: row.description || null },
        })
      }
      importedCount++
    } catch (error) {
      errors.push(
        `Failed to import action: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const message =
    errors.length > 0
      ? `Imported ${importedCount} actions with ${errors.length} errors`
      : `Successfully imported ${importedCount} actions`

  return {
    success: errors.length === 0,
    message,
    count: importedCount,
  }
}

export const deleteAllActions: MutationResolvers['deleteAllActions'] =
  async () => {
    const userId = context.currentUser?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const result = await db.action.deleteMany({})

    return {
      success: true,
      message: `Successfully deleted all actions`,
      count: result.count,
    }
  }

export const Action: ActionRelationResolvers = {
  rates: (_obj, { root }) => {
    return db.action.findUnique({ where: { id: root?.id } }).rates()
  },
  billableItems: (_obj, { root }) => {
    return db.action.findUnique({ where: { id: root?.id } }).billableItems()
  },
}
