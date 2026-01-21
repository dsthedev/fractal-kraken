export const schema = gql`
  type Material {
    id: Int!
    name: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
    rates: [Rate]!
    billableItems: [BillableItem]!
  }

  type Query {
    materials: [Material!]! @requireAuth
    material(id: Int!): Material @requireAuth
  }

  input CreateMaterialInput {
    name: String!
    description: String
  }

  input UpdateMaterialInput {
    name: String
    description: String
  }

  input ImportMaterialInput {
    name: String!
    description: String
  }

  type ImportResult {
    success: Boolean!
    message: String!
    count: Int!
  }

  type Mutation {
    createMaterial(input: CreateMaterialInput!): Material! @requireAuth
    updateMaterial(id: Int!, input: UpdateMaterialInput!): Material!
      @requireAuth
    deleteMaterial(id: Int!): Material! @requireAuth
    deleteAllMaterials: ImportResult! @requireAuth
    importMaterials(data: [ImportMaterialInput!]!): ImportResult! @requireAuth
  }
`
