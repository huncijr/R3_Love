import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USER_KEY = 'auth_token';
  private readonly TOKEN_NAME = 'auth_token';

  setToken(token: string): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `{this.TOKEN_NAME}=${token}; expires=${expires.toUTCString()}; path/; SameSite=Lax`;
  }

  getToken(): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + this.TOKEN_NAME + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  clearToken(): void {
    document.cookie = `${this.TOKEN_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    localStorage.removeItem(this.USER_KEY);
  }

  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
