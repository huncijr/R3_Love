export const userSchema = `
  type User {
    id: ID!
    name: String!
    partnerName: String
    gender: String
    isSingle: Boolean
    createdAt: String!
  }

    type CalendarQuiz {
    id: ID!
    userId: ID!
    hasPartner: Boolean!
    datingDate: String
    partnerBirthday: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(
      name: String!
      password: String!
      gender: String
    ): AuthPayload!

    login(name: String! 
       password: String!
    ): AuthPayload
  }
`;
