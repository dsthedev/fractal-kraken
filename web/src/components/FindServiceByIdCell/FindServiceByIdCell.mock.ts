// Define your own mock data here:
export const standard = (/* vars, { ctx, req } */) => ({
  findServiceById: {
    __typename: 'findServiceById' as const,
    id: 42,
  },
})
