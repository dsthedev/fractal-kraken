// Define your own mock data here:
export const standard = (/* vars, { ctx, req } */) => ({
  findMeasurementUnitById: {
    __typename: 'FindMeasurementUnitById' as const,
    id: 42,
  },
})
