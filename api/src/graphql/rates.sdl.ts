export const schema = gql`
  scalar Decimal

  type Rate {
    id: Int!
    actionId: Int
    action: Action
    materialId: Int
    material: Material
    unitId: Int!
    unit: MeasurementUnit!
    subAmount: Decimal!
    retailAmount: Decimal!
    currency: String!
    context: String
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

  type ConversionResult {
    success: Boolean!
    message: String!
    count: Int!
  }

  type Query {
    rates: [Rate!]! @requireAuth
    rate(id: Int!): Rate @requireAuth
  }

  input CreateRateInput {
    actionId: Int
    materialId: Int
    unitId: Int!
    subAmount: Decimal!
    retailAmount: Decimal!
    currency: String!
    estimatedMinutesPerUnit: Int
    description: String
    context: String
  }

  input UpdateRateInput {
    actionId: Int
    materialId: Int
    unitId: Int
    authorId: String!
    subAmount: Decimal
    retailAmount: Decimal
    currency: String
    estimatedMinutesPerUnit: Int
    description: String
    context: String
  }

  input ImportRateInput {
    actionId: Int
    materialId: Int
    unitId: Int!
    unitFullName: String
    unitShortName: String
    subAmount: Decimal!
    retailAmount: Decimal!
    currency: String!
    actionName: String
    materialName: String
    estimatedMinutesPerUnit: Int
    description: String
    context: String
  }

  type ImportResult {
    success: Boolean!
    message: String!
    errors: [String!]
    count: Int!
  }

  type Mutation {
    createRate(input: CreateRateInput!): Rate! @requireAuth
    updateRate(id: Int!, input: UpdateRateInput!): Rate! @requireAuth
    deleteRate(id: Int!): Rate! @requireAuth
    deleteAllRates: ImportResult! @requireAuth
    importRates(data: [ImportRateInput!]!): ImportResult! @requireAuth
    parseRatesData: ParsedRatesData! @requireAuth
    convertRatesToDecimal: ConversionResult! @requireAuth
  }
`
