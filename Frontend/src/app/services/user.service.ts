import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';

const CREATE_USER = gql`
  mutation CreateUser(
    $name: String!
    $password: String!
    $email: String!
    $gender: String!
    $turnstileToken: String!
  ) {
    createUser(
      name: $name
      email: $email
      password: $password
      gender: $gender
      turnstileToken: $turnstileToken
    ) {
      user {
        id
        name
        email
        emailVerified
        gender
      }
      token
    }
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $turnstileToken: String!) {
    login(email: $email, password: $password, turnstileToken: $turnstileToken) {
      user {
        id
        name
        email
        emailVerified
        gender
        country
      }
      token
    }
  }
`;

const UPDATE_USER_COUNTRY = gql`
  mutation UpdateUserCountry($country: String!) {
    updateUserCountry(country: $country) {
      id
      name
      gender
      country
    }
  }
`;

const SAVE_CALENDAR_QUIZ = gql`
  mutation SaveCalendarQuiz(
    $isSingle: Boolean!
    $partnerName: String
    $datingDate: String
    $partnerBirthday: String
  ) {
    saveCalendarQuiz(
      isSingle: $isSingle
      partnerName: $partnerName
      datingDate: $datingDate
      partnerBirthday: $partnerBirthday
    ) {
      id
      isSingle
      partnerName
      datingDate
      partnerBirthday
    }
  }
`;

const GET_CALENDAR_QUIZ = gql`
  query GetCalendarQuiz {
    getCalendarQuiz {
      id
      isSingle
      partnerName
      datingDate
      partnerBirthday
    }
  }
`;

const GET_USER_PROGRESS = gql`
  query GetUserProgress {
    getUserProgress {
      calendarDone
      giftDone
      gameDone
    }
  }
`;

const GET_GIFT_RECOMMENDATIONS_HISTORY = gql`
  query GetGiftRecommendationsHistory {
    getGiftRecommendationsHistory {
      id
      answers {
        questionId
        questionText
        value
      }
      recommendations {
        title
        description
        priceRange
        reason
        onlineLinks
        stores {
          name
          address
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const SAVE_GIFT_RECOMMENDATIONS = gql`
  mutation SaveGiftRecommendations($input: SaveGiftRecommendationsInput!) {
    saveGiftRecommendations(input: $input) {
      id
      recommendations {
        title
        description
        priceRange
        reason
      }
    }
  }
`;

const DELETE_GIFT_RECOMMENDATIONS = gql`
  mutation DeleteGiftRecommendations($id: ID!) {
    deleteGiftRecommendations(id: $id)
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser {
    deleteUser
  }
`;

export interface User {
  id: string;
  name: string;
  gender: string | null;
  country?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
}
export interface CreateUserResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
// GraphQL API service for all user-related backend operations
export class UserService {
  constructor(private apollo: Apollo) {}

  // Registers a new user and returns the created user with auth token
  createUser(
    name: string,
    password: string,
    email: string,
    gender: string,
    turnstileToken: string,
  ): Observable<CreateUserResponse> {
    console.log(turnstileToken);
    return this.apollo
      .mutate<{ createUser: CreateUserResponse }>({
        mutation: CREATE_USER,
        variables: { name, email, password, gender, turnstileToken },
      })
      .pipe(map((result) => result.data!.createUser));
  }
  // Authenticates existing user and returns token for session management
  login(email: string, password: string, turnstileToken: string): Observable<CreateUserResponse> {
    return this.apollo
      .mutate<{ login: CreateUserResponse }>({
        mutation: LOGIN,
        variables: { email, password, turnstileToken },
      })
      .pipe(map((result) => result.data!.login));
  }

  sendVerificationEmail(email: string): Observable<Boolean> {
    return this.apollo
      .mutate<{ sendVerificationEmail: boolean }>({
        mutation: gql`
          mutation SendVerificationEmail($email: String!) {
            sendVerificationEmail(email: $email)
          }
        `,
        variables: { email },
      })
      .pipe(map((result) => result.data!.sendVerificationEmail));
  }

  verifyEmail(code: string, email: string): Observable<CreateUserResponse> {
    return this.apollo
      .mutate<{ verifyEmail: CreateUserResponse }>({
        mutation: gql`
          mutation VerifyEmail($code: String!, $email: String!) {
            verifyEmail(code: $code, email: $email) {
              user {
                id
                name
                email
                emailVerified
                gender
              }
              token
            }
          }
        `,
        variables: { code, email },
      })
      .pipe(map((r) => r.data!.verifyEmail));
  }

  deleteUser(): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteUser: boolean }>({
        mutation: DELETE_USER,
      })
      .pipe(map((result) => result.data!.deleteUser));
  }

  updateUserCountry(country: string): Observable<User> {
    return this.apollo
      .mutate<{ updateUserCountry: User }>({
        mutation: UPDATE_USER_COUNTRY,
        variables: { country },
      })
      .pipe(map((result) => result.data!.updateUserCountry));
  }
  // Sends calendar quiz answers to the backend (creates or updates record)
  saveCalendarQuiz(
    isSingle: boolean,
    partnerName: string,
    datingDate: string,
    partnerBirthday: string,
  ) {
    return this.apollo.mutate({
      mutation: gql`
        mutation SaveCalendarQuiz(
          $isSingle: Boolean!
          $partnerName: String
          $datingDate: String
          $partnerBirthday: String
        ) {
          saveCalendarQuiz(
            isSingle: $isSingle
            partnerName: $partnerName
            datingDate: $datingDate
            partnerBirthday: $partnerBirthday
          ) {
            id
            isSingle
            partnerName
            datingDate
            partnerBirthday
          }
        }
      `,
      variables: { isSingle, partnerName, datingDate, partnerBirthday },
    });
  }

  // Fetches the saved calendar quiz data for the authenticated user
  getCalendarQuiz(): Observable<any> {
    return this.apollo
      .query({
        query: GET_CALENDAR_QUIZ,
        fetchPolicy: 'network-only',
      })
      .pipe(map((result: any) => result.data?.getCalendarQuiz));
  }

  // Retrieves completion status of all three game modules
  getUserProgress(): Observable<{ calendarDone: boolean; giftDone: boolean; gameDone: boolean }> {
    return this.apollo.query({ query: GET_USER_PROGRESS, fetchPolicy: 'network-only' }).pipe(
      map(
        (result: any) =>
          result.data?.getUserProgress ?? {
            calendarDone: false,
            giftDone: false,
            gameDone: false,
          },
      ),
    );
  }

  // Loads all custom calendar events created by the user
  getCalendarEvents() {
    return this.apollo
      .query<{ getCalendarEvents: any[] }>({
        query: gql`
          query {
            getCalendarEvents {
              id
              title
              description
              startDate
              allDay
              color
            }
          }
        `,
      })
      .pipe(map((result) => result.data?.getCalendarEvents ?? []));
  }

  // Persists a new custom event to the user's calendar
  saveCalendarEvent(event: {
    title: string;
    description?: string;
    startDate: string;
    allDay?: boolean;
    color?: string;
  }) {
    return this.apollo
      .mutate<{ saveCalendarEvent: any }>({
        mutation: gql`
          mutation SaveCalendarEvent($event: EventInput!) {
            saveCalendarEvent(event: $event) {
              id
              title
              startDate
              color
            }
          }
        `,
        variables: { event },
      })

      .pipe(map((result) => result.data?.saveCalendarEvent));
  }

  generateFollowUpQuestions(answer: { questionId: string; value: string }[]) {
    return this.apollo
      .mutate<{ generateFollowUpQuestions: any[] }>({
        mutation: gql`
          mutation GenerateFollowUpQuestions($answers: [QuizAnswerInput!]!) {
            generateFollowUpQuestions(answers: $answers) {
              id
              text
              type
              options
              image
              placeholder
            }
          }
        `,
        variables: { answers: answer },
      })
      .pipe(map((result) => result.data?.generateFollowUpQuestions ?? []));
  }

  getGiftRecommendations(answers: { questionId: string; value: string }[]) {
    return this.apollo
      .mutate<{ getGiftRecommendations: any[] }>({
        mutation: gql`
          mutation GetGiftRecommendations($answers: [QuizAnswerInput!]!) {
            getGiftRecommendations(answers: $answers) {
              title
              description
              priceRange
              reason
              onlineLinks
              stores {
                name
                address
              }
            }
          }
        `,
        variables: { answers: answers },
      })
      .pipe(map((result) => result.data?.getGiftRecommendations ?? []));
  }

  generateGiftSpecificQuestions(
    answers: { questionId: string; questionText: string; value: string }[],
  ) {
    return this.apollo
      .mutate<{ generateGiftSpecificQuestions: any[] }>({
        mutation: gql`
          mutation GenerateGiftSpecificQuestions($answers: [QuizAnswerInput!]!) {
            generateGiftSpecificQuestions(answers: $answers) {
              id
              text
              type
              options
              image
              placeholder
            }
          }
        `,
        variables: { answers },
      })
      .pipe(map((result) => result.data?.generateGiftSpecificQuestions ?? []));
  }

  generateDeepQuestions(answers: { questionId: string; questionText: string; value: string }[]) {
    return this.apollo
      .mutate<{ generateDeepQuestions: any[] }>({
        mutation: gql`
          mutation GenerateDeepQuestions($answers: [QuizAnswerInput!]!) {
            generateDeepQuestions(answers: $answers) {
              id
              text
              type
              options
              image
              placeholder
            }
          }
        `,
        variables: { answers },
      })
      .pipe(map((result) => result.data?.generateDeepQuestions ?? []));
  }

  generatePracticalQuestions(
    answers: { questionId: string; questionText: string; value: string }[],
  ) {
    return this.apollo
      .mutate<{ generatePracticalQuestions: any[] }>({
        mutation: gql`
          mutation GeneratePracticalQuestions($answers: [QuizAnswerInput!]!) {
            generatePracticalQuestions(answers: $answers) {
              id
              text
              type
              options
              image
              placeholder
            }
          }
        `,
        variables: { answers },
      })
      .pipe(map((result) => result.data?.generatePracticalQuestions ?? []));
  }

  updateUserGender(gender: string): Observable<User> {
    return this.apollo
      .mutate<{ updateUserGender: User }>({
        mutation: gql`
          mutation UpdateUserGender($gender: String!) {
            updateUserGender(gender: $gender) {
              id
              name
              gender
            }
          }
        `,
        variables: { gender },
      })
      .pipe(map((result) => result.data!.updateUserGender));
  }

  getGiftRecommendationsHistory() {
    return this.apollo.query<{ getGiftRecommendationsHistory: any }>({
      query: GET_GIFT_RECOMMENDATIONS_HISTORY,
      fetchPolicy: 'network-only',
    });
  }

  saveGiftRecommendations(input: any) {
    return this.apollo.mutate<{ saveGiftRecommendations: any }>({
      mutation: SAVE_GIFT_RECOMMENDATIONS,
      variables: { input },
    });
  }

  deleteGiftRecommendations(id: string) {
    return this.apollo.mutate<{ deleteGiftRecommendations: boolean }>({
      mutation: DELETE_GIFT_RECOMMENDATIONS,
      variables: { id },
      refetchQueries: [{ query: GET_GIFT_RECOMMENDATIONS_HISTORY }],
      awaitRefetchQueries: true,
    });
  }

  getDailyInsight() {
    return this.apollo
      .query<{ getDailyInsight: { didYouKnow: string; advice: string } }>({
        query: gql`
          query GetDailyInsight {
            getDailyInsight {
              didYouKnow
              advice
            }
          }
        `,
      })
      .pipe(map((result) => result.data?.getDailyInsight));
  }

  getRomanticSongs() {
    console.log('aaa');
    return this.apollo.query<{
      getRomanticSongs: {
        title: string;
        artist: string;
        url: string;
        imageUrl: string;
        uri: string;
      }[];
    }>({
      query: gql`
        query GetRomanticSongs {
          getRomanticSongs {
            title
            artist
            url
            imageUrl
            uri
          }
        }
      `,
      fetchPolicy: 'network-only',
    });
  }
  getSpotifyAuthUrl() {
    return this.apollo
      .query<{ getSpotifyAuthUrl: string }>({
        query: gql`
          query GetSpotifyAuthUrl {
            getSpotifyAuthUrl
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data?.getSpotifyAuthUrl ?? ''));
  }

  exchangeSpotifyCode(code: string) {
    return this.apollo
      .mutate<{ exchangeSpotifyCode: boolean }>({
        mutation: gql`
          mutation ExchangeSpotifyCode($code: String!) {
            exchangeSpotifyCode(code: $code)
          }
        `,
        variables: { code },
      })
      .pipe(map((result) => result.data?.exchangeSpotifyCode ?? false));
  }

  isSpotifyConnected() {
    return this.apollo
      .query<{ isSpotifyConnected: boolean }>({
        query: gql`
          query IsSpotifyConnected {
            isSpotifyConnected
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data?.isSpotifyConnected ?? false));
  }

  getSpotifyAccessToken() {
    return this.apollo
      .query<{ getSpotifyAccessToken: string | null }>({
        query: gql`
          query GetSpotifyAccessToken {
            getSpotifyAccessToken
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data?.getSpotifyAccessToken ?? null));
  }

  getSpotifyProfile() {
    return this.apollo
      .query<{ getSpotifyProfile: { displayName: string } | null }>({
        query: gql`
          query GetSpotifyProfile {
            getSpotifyProfile {
              displayName
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((result) => result.data?.getSpotifyProfile ?? null));
  }

  markGameDone() {
    return this.apollo.mutate({
      mutation: gql`
        mutation MarkGameDone {
          markGameDone {
            calendarDone
            giftDone
            gameDone
          }
        }
      `,
    });
  }

  disconnectSpotify() {
    return this.apollo.mutate({
      mutation: gql`
        mutation DisconnectSpotify {
          disconnectSpotify
        }
      `,
    });
  }

  googleAuth(credential: string): Observable<CreateUserResponse> {
    return this.apollo
      .mutate<{ googleAuth: CreateUserResponse }>({
        mutation: gql`
          mutation GoogleAuth($credential: String!) {
            googleAuth(credential: $credential) {
              user {
                id
                name
                gender
                country
              }
              token
            }
          }
        `,
        variables: { credential },
      })
      .pipe(map((result) => result.data!.googleAuth));
  }
}
