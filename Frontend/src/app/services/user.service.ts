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
export class UserService {
  constructor(private apollo: Apollo) {}
  createUser(name: string, password: string, gender: string): Observable<CreateUserResponse> {
    return this.apollo
      .mutate<{ createUser: CreateUserResponse }>({
        mutation: CREATE_USER,
        variables: { name, password, gender },
      })
      .pipe(map((result) => result.data!.createUser));
  }
  login(name: string, password: string): Observable<CreateUserResponse> {
    return this.apollo
      .mutate<{ login: CreateUserResponse }>({
        mutation: LOGIN,
        variables: { name, password },
      })
      .pipe(map((result) => result.data!.login));
  }
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

  getCalendarQuiz(): Observable<any> {
    return this.apollo
      .query({
        query: GET_CALENDAR_QUIZ,
        fetchPolicy: 'network-only',
      })
      .pipe(map((result: any) => result.data?.getCalendarQuiz));
  }

  getUserProgress(): Observable<{ calendarDone: boolean; giftDone: boolean; gameDone: boolean }> {
    return this.apollo
      .query({ query: GET_USER_PROGRESS, fetchPolicy: 'network-only' })
      .pipe(
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
}
