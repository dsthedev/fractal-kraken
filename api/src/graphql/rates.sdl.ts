export const schema = gql`
  type Rate {
    id: Int!
    serviceId: Int!
    service: Service!
    unitId: Int!
    unit: MeasurementUnit!
    subAmount: Float!
    retailAmount: Float!
    currency: String!
    authorId: String!
    author: User!
    estimatedMinutesPerUnit: Int
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ParsedRatesData {
    unitsPath: String!
    servicesPath: String!
    ratesPath: String!
    unitsCount: Int!
    servicesCount: Int!
    ratesCount: Int!
  }

  type Query {
    rates: [Rate!]! @requireAuth
    rate(id: Int!): Rate @requireAuth
  }

  input CreateRateInput {
    serviceId: Int!
    unitId: Int!
    subAmount: Float!
    retailAmount: Float!
    currency: String!
    authorId: String!
    estimatedMinutesPerUnit: Int
    description: String
  }

  input UpdateRateInput {
    serviceId: Int
    unitId: Int
    subAmount: Float
    retailAmount: Float
    currency: String
    authorId: String
    estimatedMinutesPerUnit: Int
    description: String
  }

  type Mutation {
    createRate(input: CreateRateInput!): Rate! @requireAuth
    updateRate(id: Int!, input: UpdateRateInput!): Rate! @requireAuth
    deleteRate(id: Int!): Rate! @requireAuth
    parseRatesData: ParsedRatesData! @requireAuth
  }
`
