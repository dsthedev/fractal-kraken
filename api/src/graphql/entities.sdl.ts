export const schema = gql`
  type Entity {
    id: Int!
    type: EntityType!
    name: String!
    nickname: String
    contactName: String
    email: String
    phone: String
    addressLine1: String
    addressLine2: String
    city: String
    state: String
    postalCode: String
    country: String
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    usersDefault: [User]!
    usersRetailer: [User]!
  }

  enum EntityType {
    CONTRACTOR
    INSTALLER
    CLIENT
    RETAILER
    SUPPLIER
    COMPANY
    INDIVIDUAL
    OTHER
  }

  type Query {
    entities: [Entity!]! @requireAuth
    entity(id: Int!): Entity @requireAuth
  }

  input CreateEntityInput {
    type: EntityType!
    name: String!
    nickname: String
    contactName: String
    email: String
    phone: String
    addressLine1: String
    addressLine2: String
    city: String
    state: String
    postalCode: String
    country: String
    notes: String
  }

  input UpdateEntityInput {
    type: EntityType
    name: String
    nickname: String
    contactName: String
    email: String
    phone: String
    addressLine1: String
    addressLine2: String
    city: String
    state: String
    postalCode: String
    country: String
    notes: String
  }

  type Mutation {
    createEntity(input: CreateEntityInput!): Entity! @requireAuth
    updateEntity(id: Int!, input: UpdateEntityInput!): Entity! @requireAuth
    deleteEntity(id: Int!): Entity! @requireAuth
  }
`
