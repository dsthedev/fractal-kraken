export const schema = gql`
  type Mutation {
    sendExampleEmail(toEmail: String!): Boolean! @skipAuth
    sendContactEmail(name: String!, email: String!, message: String!): Boolean!
      @skipAuth
    sendEstimateEmail(estimateId: Int!, recipientEmail: String!): Boolean!
      @requireAuth
  }
`
