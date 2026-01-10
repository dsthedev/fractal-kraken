import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db'

export const services: QueryResolvers['services'] = () => {
  return db.service.findMany()
}

export const service: QueryResolvers['service'] = ({ id }) => {
  return db.service.findUnique({
    where: { id },
  })
}

export const createService: MutationResolvers['createService'] = ({
  input,
}) => {
  return db.service.create({
    data: input,
  })
}

export const updateService: MutationResolvers['updateService'] = ({
  id,
  input,
}) => {
  return db.service.update({
    data: input,
    where: { id },
  })
}

export const deleteService: MutationResolvers['deleteService'] = ({ id }) => {
  return db.service.delete({
    where: { id },
  })
}
