export const userSchema = `
  type User {
    id: ID!
    name: String!
    gender: String
    createdAt: String!
  }

  type UserProgress{
  calendarDone: Boolean
  giftDone: Boolean
  gameDone: Boolean
  }

  type CalendarQuiz {
    id: ID!
    userId: ID!
    isSingle: Boolean!
    partnerName: String
    datingDate: String
    partnerBirthday: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }


  type CalendarEvent {
    id: ID!
    userId: ID!
    title: String!
    description: String
    startDate: String!
    allDay: Boolean
    color: String
    createdAt: String!
  }

  input EventInput {
    title: String!
    description: String
    startDate: String!
    allDay: Boolean
    color: String
  }

    type Query {
    users: [User!]!
    user(id: ID!): User
    getCalendarQuiz: CalendarQuiz
    getUserProgress: UserProgress
    getCalendarEvents: [CalendarEvent!]
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

    saveCalendarQuiz(
      isSingle: Boolean!
      partnerName: String
      datingDate: String
      partnerBirthday: String
    ): CalendarQuiz!

    saveCalendarEvent(event: EventInput!): CalendarEvent!
    deleteCalendarEvent(id: ID!): Boolean!
  }
`;
