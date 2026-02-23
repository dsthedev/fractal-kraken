import type {
  QueryResolvers,
  MutationResolvers,
  TagRelationResolvers,
} from 'types/graphql'

import { RedwoodGraphQLError } from '@cedarjs/graphql-server'
import { context } from '@cedarjs/graphql-server'

import { db } from 'src/lib/db'

export const tags: QueryResolvers['tags'] = () => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new RedwoodGraphQLError('User not authenticated')
  }

  return db.tag.findMany({ where: { authorId: userId } })
}

export const tag: QueryResolvers['tag'] = ({ id }) => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new RedwoodGraphQLError('User not authenticated')
  }

  return db.tag.findFirst({ where: { id, authorId: userId } })
}

export const createTag: MutationResolvers['createTag'] = ({ input }) => {
  const userId = context.currentUser?.id

  if (!userId) {
    throw new RedwoodGraphQLError('You must be logged in to create a tag')
  }

  const { name, description } = input

  return db.tag.create({
    data: { name, description, authorId: userId },
  })
}

export const updateTag: MutationResolvers['updateTag'] = async ({
  id,
  input,
}) => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new RedwoodGraphQLError('User not authenticated')
  }

  const existing = await db.tag.findFirst({ where: { id, authorId: userId } })
  if (!existing) {
    throw new RedwoodGraphQLError('Tag not found or not owned by current user')
  }

  const { authorId: _a, ...safeInput } = input as any

  return db.tag.update({ where: { id }, data: safeInput })
}

export const deleteTag: MutationResolvers['deleteTag'] = async ({ id }) => {
  const userId = context.currentUser?.id
  if (!userId) {
    throw new RedwoodGraphQLError('User not authenticated')
  }

  const existing = await db.tag.findFirst({ where: { id, authorId: userId } })
  if (!existing) {
    throw new RedwoodGraphQLError('Tag not found or not owned by current user')
  }

  return db.tag.delete({ where: { id } })
}

export const Tag: TagRelationResolvers = {
  author: (_obj, { root }) => {
    return db.tag.findUnique({ where: { id: root?.id } }).author()
  },
}
