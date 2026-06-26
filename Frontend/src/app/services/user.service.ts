import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $password: String!, $gender: String!) {
    createUser(name: $name, password: $password, gender: $gender) {
      user {
        id
        name
        partnerName
        gender
        isSingle
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
        partnerName
        gender
        isSingle
      }
      token
    }
  }
`;

const SAVE_CALENDAR_QUIZ = gql`
  mutation SaveCalendarQuiz($hasPartner: Boolean!, $datingDate: String, $partnerBirthday: String) {
    saveCalendarQuiz(
      hasPartner: $hasPartner
      datingDate: $datingDate
      partnerBirthday: $partnerBirthday
    ) {
      id
      hasPartner
      datingDate
      partnerBirthday
    }
  }
`;

export interface User {
  id: string;
  name: string;
  partnerName: string | null;
  gender: string | null;
  isSingle: boolean | null;
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
  saveCalendarQuiz(hasPartner: boolean, datingDate: string, partnerBirthday: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation SaveCalendarQuiz(
          $hasPartner: Boolean!
          $datingDate: String
          $partnerBirthday: String
        ) {
          saveCalendarQuiz(
            hasPartner: $hasPartner
            datingDate: $datingDate
            partnerBirthday: $partnerBirthday
          ) {
            id
            hasPartner
            datingDate
            partnerBirthday
          }
        }
      `,
      variables: { hasPartner, datingDate, partnerBirthday },
    });
  }
}
