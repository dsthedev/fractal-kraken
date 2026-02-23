export const schema = gql`
  type Tag {
    id: Int!
    name: String!
    description: String
    authorId: String!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    tags: [Tag!]! @requireAuth
    tag(id: Int!): Tag @requireAuth
  }

  input CreateTagInput {
    name: String!
    description: String
  }

  input UpdateTagInput {
    name: String
    description: String
  }

  type Mutation {
    createTag(input: CreateTagInput!): Tag! @requireAuth
    updateTag(id: Int!, input: UpdateTagInput!): Tag! @requireAuth
    deleteTag(id: Int!): Tag! @requireAuth
  }
`
