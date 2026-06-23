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
}
