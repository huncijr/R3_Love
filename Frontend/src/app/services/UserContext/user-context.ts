import { computed, Injectable, signal } from '@angular/core';
import { AuthService } from '../Auth/auth';

// Basic user data shape used across the application
export interface User {
  id: string;
  name: string;
  gender: string | null;
}

@Injectable({
  providedIn: 'root',
})
// Global user state service: restores user on app startup and exposes login/logout
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

  // Persists credentials and updates the reactive user signal
  login(user: User, token: string): void {
    this.authService.setToken(token);
    this.authService.setUser(user);
    this.currentUser.set(user);
  }

  // Clears stored credentials and resets the user signal
  logout(): void {
    this.authService.clearToken();
    this.currentUser.set(null);
  }
}
