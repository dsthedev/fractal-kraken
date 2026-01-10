export const schema = gql`
  type MeasurementUnit {
    id: Int!
    fullName: String!
    pluralName: String!
    shortName: String
    symbol: String
    notation: String
    dimension: UnitDimension!
    description: String
    conversionFactor: Float
    baseUnit: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum UnitDimension {
    LINEAR
    SQUARE
    CUBIC
    VOLUME
    TEMPORAL
    COUNT
    AREA
    CUSTOM
  }

  enum UnitCategory {
    LENGTH
    AREA
    VOLUME
    TIME
    COUNT
    CUSTOM
  }

  type Query {
    measurementUnits: [MeasurementUnit!]! @requireAuth
    measurementUnit(id: Int!): MeasurementUnit @requireAuth
  }

  input CreateMeasurementUnitInput {
    fullName: String!
    pluralName: String!
    shortName: String
    symbol: String
    notation: String
    dimension: UnitDimension!
    description: String
    conversionFactor: Float
    baseUnit: String
  }

  input UpdateMeasurementUnitInput {
    fullName: String
    pluralName: String
    shortName: String
    symbol: String
    notation: String
    dimension: UnitDimension
    description: String
    conversionFactor: Float
    baseUnit: String
  }

  type Mutation {
    createMeasurementUnit(input: CreateMeasurementUnitInput!): MeasurementUnit!
      @requireAuth
    updateMeasurementUnit(
      id: Int!
      input: UpdateMeasurementUnitInput!
    ): MeasurementUnit! @requireAuth
    deleteMeasurementUnit(id: Int!): MeasurementUnit! @requireAuth
  }
`
