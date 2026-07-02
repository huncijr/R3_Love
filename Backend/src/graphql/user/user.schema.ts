// GraphQL type definitions for users, calendar, and progress tracking
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

  type AiQuestion {
  id: String!
  text: String!
  type: String!
  options: [String!]
  image: String
  placeholder: String
  }

  type GiftRecommendation {
    title: String!
    description: String!
    priceRange: String!
    reason: String!
  }

  input EventInput {
    title: String!
    description: String
    startDate: String!
    allDay: Boolean
    color: String
  }

  input QuizAnswerInput {
    questionId: String!
    value: String!
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
    getGiftRecommendations(answer: [QuizAnswerInput!]!): [GiftRecommendation!]!
    generateFollowUpQuestions(answer: [QuizAnswerInput!]!): [AiQuestion!]!
  }
`;
