export const schema = gql`
  type Invoice {
    uuid: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    authorId: String!
    author: User!
    invoiceNumber: String!
    status: InvoiceStatus!
    payStatus: InvoicePaymentStatus!
    jobStartedAt: DateTime
    jobFinishedAt: DateTime
    dueAt: DateTime
    paidAt: DateTime
    payorEntityId: Int!
    payorEntity: Entity!
    payeeEntityId: Int!
    payeeEntity: Entity!
    sourceEstimateId: Int
    sourceEstimate: Estimate
    sourceInstallerEntityId: Int
    sourceInstallerEntity: Entity
    sourceClientEntityId: Int
    sourceClientEntity: Entity
    sourceRetailerEntityId: Int
    sourceRetailerEntity: Entity
    payeeAddressLine1: String
    payeeAddressLine2: String
    payeeCity: String
    payeeState: String
    payeePostalCode: String
    payeeCountry: String
    payorAddressLine1: String
    payorAddressLine2: String
    payorCity: String
    payorState: String
    payorPostalCode: String
    payorCountry: String
    jobAddressLine1: String
    jobAddressLine2: String
    jobCity: String
    jobState: String
    jobPostalCode: String
    jobCountry: String
    billableItems: [BillableItem]!
    subtotal: Float!
    taxTotal: Float!
    total: Float!
    notes: String
    entity: Entity
    entityId: Int
  }

  enum InvoiceStatus {
    DRAFT
    SENT
    ARCHIVED
  }

  enum InvoicePaymentStatus {
    UNPAID
    OUTSTANDING
    PAID
  }

  type Query {
    invoices: [Invoice!]! @requireAuth
    invoice(uuid: String!): Invoice @requireAuth
  }

  input CreateInvoiceInput {
    authorId: String!
    invoiceNumber: String!
    status: InvoiceStatus!
    payStatus: InvoicePaymentStatus!
    jobStartedAt: DateTime
    jobFinishedAt: DateTime
    dueAt: DateTime
    paidAt: DateTime
    payorEntityId: Int!
    payeeEntityId: Int!
    sourceEstimateId: Int
    sourceInstallerEntityId: Int
    sourceClientEntityId: Int
    sourceRetailerEntityId: Int
    payeeAddressLine1: String
    payeeAddressLine2: String
    payeeCity: String
    payeeState: String
    payeePostalCode: String
    payeeCountry: String
    payorAddressLine1: String
    payorAddressLine2: String
    payorCity: String
    payorState: String
    payorPostalCode: String
    payorCountry: String
    jobAddressLine1: String
    jobAddressLine2: String
    jobCity: String
    jobState: String
    jobPostalCode: String
    jobCountry: String
    subtotal: Float!
    taxTotal: Float!
    total: Float!
    notes: String
    entityId: Int
  }

  input UpdateInvoiceInput {
    authorId: String
    invoiceNumber: String
    status: InvoiceStatus
    payStatus: InvoicePaymentStatus
    jobStartedAt: DateTime
    jobFinishedAt: DateTime
    dueAt: DateTime
    paidAt: DateTime
    payorEntityId: Int
    payeeEntityId: Int
    sourceEstimateId: Int
    sourceInstallerEntityId: Int
    sourceClientEntityId: Int
    sourceRetailerEntityId: Int
    payeeAddressLine1: String
    payeeAddressLine2: String
    payeeCity: String
    payeeState: String
    payeePostalCode: String
    payeeCountry: String
    payorAddressLine1: String
    payorAddressLine2: String
    payorCity: String
    payorState: String
    payorPostalCode: String
    payorCountry: String
    jobAddressLine1: String
    jobAddressLine2: String
    jobCity: String
    jobState: String
    jobPostalCode: String
    jobCountry: String
    subtotal: Float
    taxTotal: Float
    total: Float
    notes: String
    entityId: Int
  }

  type Mutation {
    createInvoice(input: CreateInvoiceInput!): Invoice! @requireAuth
    createInvoiceFromEstimate(estimateId: Int!): Invoice! @requireAuth
    updateInvoice(uuid: String!, input: UpdateInvoiceInput!): Invoice!
      @requireAuth
    deleteInvoice(uuid: String!): Invoice! @requireAuth
  }
`
