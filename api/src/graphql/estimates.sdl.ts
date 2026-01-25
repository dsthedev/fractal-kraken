export const schema = gql`
  type Estimate {
    id: Int!
    uuid: String!
    title: String
    status: EstimateStatus!
    installerEntityId: Int
    installerEntity: Entity
    clientEntityId: Int
    clientEntity: Entity
    retailerEntityId: Int
    retailerEntity: Entity
    jobAddressLine1: String
    jobAddressLine2: String
    jobCity: String
    jobState: String
    jobPostalCode: String
    jobCountry: String
    subtotal: Decimal!
    taxTotal: Decimal!
    total: Decimal!
    estimatedMinutesTotal: Int
    authorId: String!
    author: User!
    billableItems: [BillableItem]!
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    entity: Entity
    entityId: Int
  }

  enum EstimateStatus {
    DRAFT
    SENT
    ACCEPTED
    UNDERWAY
    INVOICED
    REJECTED
    EXPIRED
  }

  type Query {
    estimates: [Estimate!]! @requireAuth
    estimate(id: Int!): Estimate @requireAuth
  }

  input CreateEstimateInput {
    uuid: String!
    title: String
    status: EstimateStatus!
    installerEntityId: Int
    clientEntityId: Int
    retailerEntityId: Int
    jobAddressLine1: String
    jobAddressLine2: String
    jobCity: String
    jobState: String
    jobPostalCode: String
    jobCountry: String
    subtotal: Decimal!
    taxTotal: Decimal!
    total: Decimal!
    estimatedMinutesTotal: Int
    authorId: String!
    notes: String
    entityId: Int
  }

  input UpdateEstimateInput {
    uuid: String
    title: String
    status: EstimateStatus
    installerEntityId: Int
    clientEntityId: Int
    retailerEntityId: Int
    jobAddressLine1: String
    jobAddressLine2: String
    jobCity: String
    jobState: String
    jobPostalCode: String
    jobCountry: String
    subtotal: Decimal
    taxTotal: Decimal
    total: Decimal
    estimatedMinutesTotal: Int
    authorId: String
    notes: String
    entityId: Int
  }

  input ImportEstimateInput {
    uuid: String!
    title: String
    status: EstimateStatus!
    installerEntityId: Int
    clientEntityId: Int
    retailerEntityId: Int
    jobAddressLine1: String
    jobAddressLine2: String
    jobCity: String
    jobState: String
    jobPostalCode: String
    jobCountry: String
    subtotal: Decimal!
    taxTotal: Decimal!
    total: Decimal!
    estimatedMinutesTotal: Int
    notes: String
    entityId: Int
  }

  type ImportResult {
    success: Boolean!
    message: String!
    errors: [String!]
    count: Int!
  }

  type Mutation {
    createEstimate(input: CreateEstimateInput!): Estimate! @requireAuth
    updateEstimate(id: Int!, input: UpdateEstimateInput!): Estimate!
      @requireAuth
    deleteEstimate(id: Int!): Estimate! @requireAuth
    importEstimates(data: [ImportEstimateInput!]!): ImportResult! @requireAuth
  }
`
