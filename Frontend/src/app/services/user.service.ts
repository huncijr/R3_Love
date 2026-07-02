import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $password: String!, $gender: String!) {
    createUser(name: $name, password: $password, gender: $gender) {
      user {
        id
        name
        gender
      }
      token
    }
  }
`;

const LOGIN = gql`
  mutation Login($name: String!, $password: String!) {
    login(name: $name, password: $password) {
      user {
        id
        name
        gender
      }
      token
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

export interface User {
  id: string;
  name: string;
  gender: string | null;
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
  createUser(name: string, password: string, gender: string): Observable<CreateUserResponse> {
    return this.apollo
      .mutate<{ createUser: CreateUserResponse }>({
        mutation: CREATE_USER,
        variables: { name, password, gender },
      })
      .pipe(map((result) => result.data!.createUser));
  }
  // Authenticates existing user and returns token for session management
  login(name: string, password: string): Observable<CreateUserResponse> {
    return this.apollo
      .mutate<{ login: CreateUserResponse }>({
        mutation: LOGIN,
        variables: { name, password },
      })
      .pipe(map((result) => result.data!.login));
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

  getGiftRecommendations(answer: { questionId: string; value: string }[]) {
    return this.apollo
      .mutate<{ getGiftRecommendations: any[] }>({
        mutation: gql`
          mutation GetGiftRecommendations($answers: [QuizAnswerInput!]!) {
            getGiftRecommendations(answers: $answers) {
              title
              description
              priceRange
              reason
            }
          }
        `,
        variables: { answer },
      })
      .pipe(map((result) => result.data?.getGiftRecommendations ?? []));
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
}
