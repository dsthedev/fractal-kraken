export const schema = gql`
  type Action {
    id: Int!
    name: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
    rates: [Rate]!
    billableItems: [BillableItem]!
  }

  type Query {
    actions: [Action!]! @requireAuth
    action(id: Int!): Action @requireAuth
  }

  input CreateActionInput {
    name: String!
    description: String
  }

  input UpdateActionInput {
    name: String
    description: String
  }

  input ImportActionInput {
    name: String!
    description: String
  }

  type ImportResult {
    success: Boolean!
    message: String!
    count: Int!
  }

  type Mutation {
    createAction(input: CreateActionInput!): Action! @requireAuth
    updateAction(id: Int!, input: UpdateActionInput!): Action! @requireAuth
    deleteAction(id: Int!): Action! @requireAuth
    deleteAllActions: ImportResult! @requireAuth
    importActions(data: [ImportActionInput!]!): ImportResult! @requireAuth
  }
`
