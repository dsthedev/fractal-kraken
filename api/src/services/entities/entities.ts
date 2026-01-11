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

export const Entity: EntityRelationResolvers = {
  usersDefault: (_obj, { root }) => {
    return db.entity.findUnique({ where: { id: root?.id } }).usersDefault()
  },
  usersRetailer: (_obj, { root }) => {
    return db.entity.findUnique({ where: { id: root?.id } }).usersRetailer()
  },
}
