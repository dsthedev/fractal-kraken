export const schema = gql`
  type BillableItem {
    id: Int!
    actionId: Int
    action: Action
    materialId: Int
    material: Material
    unitId: Int!
    unit: MeasurementUnit!
    unitPrice: Float!
    pricingType: PricingType!
    quantity: Float!
    subtotal: Float!
    estimatedMinutesPerUnit: Int
    notes: String
    sortOrder: Int!
    estimateId: Int
    estimate: Estimate
    invoiceUuid: String
    invoice: Invoice
    authorId: String!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PricingType {
    SUB
    RETAIL
  }

  type BillableItemsPage {
    billableItems: [BillableItem!]!
    count: Int!
    hasMore: Boolean!
    page: Int!
    pageSize: Int!
  }

  type Query {
    billableItems: [BillableItem!]! @requireAuth
    billableItem(id: Int!): BillableItem @requireAuth
    billableItemsPage(
      page: Int
      pageSize: Int
    ): BillableItemsPage! @requireAuth
  }

  input CreateBillableItemInput {
    actionId: Int
    materialId: Int
    unitId: Int!
    unitPrice: Float!
    pricingType: PricingType!
    quantity: Float!
    subtotal: Float!
    estimatedMinutesPerUnit: Int
    notes: String
    sortOrder: Int
    estimateId: Int
    invoiceUuid: String
    authorId: String!
  }

  input UpdateBillableItemInput {
    actionId: Int
    materialId: Int
    unitId: Int
    unitPrice: Float
    pricingType: PricingType
    quantity: Float
    subtotal: Float
    estimatedMinutesPerUnit: Int
    notes: String
    sortOrder: Int
    estimateId: Int
    invoiceUuid: String
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
