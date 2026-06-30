import { computed, Injectable, signal } from '@angular/core';
import { AuthService } from '../Auth/auth';

export interface User {
  id: string;
  name: string;
  gender: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserContext {
  currentUser = signal<User | null>(null);

  isLoggedIn = computed(() => this.currentUser() !== null);
  constructor(private authService: AuthService) {
    const savedUser = this.authService.getUser();
    if (savedUser) {
      this.currentUser.set(savedUser);
    } else {
    }
  }

  login(user: User, token: string): void {
    this.authService.setToken(token);
    this.authService.setUser(user);
    this.currentUser.set(user);
  }

  logout(): void {
    this.authService.clearToken();
    this.currentUser.set(null);
  }
}
