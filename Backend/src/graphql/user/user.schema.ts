// GraphQL type definitions for users, calendar, and progress tracking
export const userSchema = `
  type User {
    id: ID!
    name: String!
    gender: String
    email: String
    country: String
    createdAt: String!
    spotifyAccessToken: String
    spotifyRefreshToken: String
    spotifyTokenExpiry: String
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

  type QuizAnswer{ 
    questionId: String!
    questionText: String!
    value: String!
  }

  type SavedGiftRecommendations {
    id: ID!
    userId: ID!
    answers: [QuizAnswer!]!
    recommendations: [GiftRecommendation!]!
    createdAt: String!
    updatedAt: String!

  }

  input SaveGiftRecommendationsInput{
    answers: [QuizAnswerInput!]!
    recommendations: [GiftRecommendationInput!]!
  
  }

  type DailyInsight {
    didYouKnow: String!
    advice: String!
  }

  type SpotifyProfile {
    displayName: String!
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

  input StoreLocationInput{
    name: String!
    address: String!
  }

  type StoreLocation {
  name: String!
  address: String!
  }

  type GiftRecommendation {
    title: String!
    description: String!
    priceRange: String!
    reason: String!
    onlineLinks: [String!]
    stores: [StoreLocation!]
  }

  input GiftRecommendationInput{
    title: String!
    description: String!
    priceRange: String!
    reason: String!
    onlineLinks: [String!]
    stores: [StoreLocationInput!]
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
    questionText: String!
    value: String!
  }

    type Query {
    users: [User!]!
    user(id: ID!): User
    getCalendarQuiz: CalendarQuiz
    getUserProgress: UserProgress
    getSpotifyAuthUrl: String
    getSpotifyAccessToken: String
    getCalendarEvents: [CalendarEvent!]
    getGiftRecommendationsHistory: [SavedGiftRecommendations!]!
    getDailyInsight: DailyInsight!
    isSpotifyConnected: Boolean!
    getSpotifyProfile: SpotifyProfile
  }


  type Mutation {
    createUser(
      name: String!
      password: String!
      gender: String
      turnstileToken: String!
    ): AuthPayload!

    login(
       name: String!
       password: String!
       turnstileToken: String!
    ): AuthPayload

    saveCalendarQuiz(
      isSingle: Boolean!
      partnerName: String
      datingDate: String
      partnerBirthday: String
    ): CalendarQuiz!

    updateUserCountry(country: String!): User!
    saveCalendarEvent(event: EventInput!): CalendarEvent!
    deleteCalendarEvent(id: ID!): Boolean!
    exchangeSpotifyCode(code: String!): Boolean
    generateDeepQuestions(answers: [QuizAnswerInput!]!): [AiQuestion!]!
    generatePracticalQuestions(answers: [QuizAnswerInput!]!): [AiQuestion!]!
    getGiftRecommendations(answers: [QuizAnswerInput!]!): [GiftRecommendation!]!
    saveGiftRecommendations(input: SaveGiftRecommendationsInput!): SavedGiftRecommendations!
    deleteGiftRecommendations(id: ID!): Boolean!
    markGameDone: UserProgress!
    disconnectSpotify: Boolean!
    googleAuth(credential: String!): AuthPayload!     
    updateUserGender(gender: String!): User!
    sendVerificationEmail: Boolean!
    verifyEmail(code: String!): Boolean!
  }
`;
export const spotifyTypeDefs = `#graphql
type Song {
  title: String!
  artist: String!
  url: String!
  imageUrl: String!
  uri: String!

}
  extend type Query{
  getRomanticSongs: [Song!]!}
`;
