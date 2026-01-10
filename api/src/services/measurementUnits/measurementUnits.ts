import type { QueryResolvers, MutationResolvers } from 'types/graphql'

import { db } from 'src/lib/db'

export const measurementUnits: QueryResolvers['measurementUnits'] = () => {
  return db.measurementUnit.findMany()
}

export const measurementUnit: QueryResolvers['measurementUnit'] = ({ id }) => {
  return db.measurementUnit.findUnique({
    where: { id },
  })
}

export const createMeasurementUnit: MutationResolvers['createMeasurementUnit'] =
  ({ input }) => {
    return db.measurementUnit.create({
      data: input,
    })
  }

export const updateMeasurementUnit: MutationResolvers['updateMeasurementUnit'] =
  ({ id, input }) => {
    return db.measurementUnit.update({
      data: input,
      where: { id },
    })
  }

export const deleteMeasurementUnit: MutationResolvers['deleteMeasurementUnit'] =
  ({ id }) => {
    return db.measurementUnit.delete({
      where: { id },
    })
  }
