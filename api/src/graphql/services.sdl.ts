export const schema = gql`
  type Service {
    id: Int!
    action: ServiceAction!
    material: String!
    context: String
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ServiceAction {
    INSTALL
    REMOVE
    REPLACE
    REPAIR
    FINISH
    PREPARE
    CLEAN
    MOVE
    INSPECT
    CUSTOM
  }

  type Query {
    services: [Service!]! @requireAuth
    service(id: Int!): Service @requireAuth
  }

  input CreateServiceInput {
    action: ServiceAction!
    material: String!
    context: String
    description: String
  }

  input UpdateServiceInput {
    action: ServiceAction
    material: String
    context: String
    description: String
  }

  type Mutation {
    createService(input: CreateServiceInput!): Service! @requireAuth
    updateService(id: Int!, input: UpdateServiceInput!): Service! @requireAuth
    deleteService(id: Int!): Service! @requireAuth
  }
`
