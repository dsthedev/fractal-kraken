export const schema = gql`
  type BillableItem {
    id: Int!
    serviceId: Int!
    service: Service!
    unitId: Int!
    unit: MeasurementUnit!
    unitPrice: Float!
    pricingType: PricingType!
    quantity: Float!
    subtotal: Float!
    estimatedMinutesPerUnit: Int
    notes: String
    authorId: String!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PricingType {
    SUB
    RETAIL
  }

  type Query {
    billableItems: [BillableItem!]! @requireAuth
    billableItem(id: Int!): BillableItem @requireAuth
  }

  input CreateBillableItemInput {
    serviceId: Int!
    unitId: Int!
    unitPrice: Float!
    pricingType: PricingType!
    quantity: Float!
    subtotal: Float!
    estimatedMinutesPerUnit: Int
    notes: String
    authorId: String!
  }

  input UpdateBillableItemInput {
    serviceId: Int
    unitId: Int
    unitPrice: Float
    pricingType: PricingType
    quantity: Float
    subtotal: Float
    estimatedMinutesPerUnit: Int
    notes: String
    authorId: String
  }

  type Mutation {
    createBillableItem(input: CreateBillableItemInput!): BillableItem!
      @requireAuth
    updateBillableItem(
      id: Int!
      input: UpdateBillableItemInput!
    ): BillableItem! @requireAuth
    deleteBillableItem(id: Int!): BillableItem! @requireAuth
  }
`
