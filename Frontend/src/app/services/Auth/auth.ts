import { Injectable } from '@angular/core';

const LOCAL_STORAGE_KEYS = [
  'auth_token',
  'calendar-quiz',
  'gift-recommendations',
  'gift_pending_recommendations',
  'gift_pending_answers',
  'gift_show_history',
];

const SESSION_STORAGE_KEYS = ['homeRandomGift', 'dailyInsight', 'romanticSongs'];
@Injectable({
  providedIn: 'root',
})

// Handles JWT token storage in cookies and user data in localStorage
export class AuthService {
  private readonly USER_KEY = 'auth_token';
  private readonly TOKEN_NAME = 'auth_token';

  // Stores the JWT token in a browser cookie with 30-day expiry
  setToken(token: string): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `${this.TOKEN_NAME}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  // Reads the JWT token from browser cookies
  getToken(): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + this.TOKEN_NAME + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  // Removes the JWT cookie and clears persisted user data
  clearToken(): void {
    document.cookie = `${this.TOKEN_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    this.clearAppData();
  }

  clearAppData(): void {
    LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    SESSION_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
  }

  // Saves user object to localStorage for app startup restoration
  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Retrieves the persisted user object from localStorage
  getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Returns true if a valid auth token exists in cookies
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
