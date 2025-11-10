import { Injectable } from '@angular/core';
import { User } from '../../contracts/user.interface';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const AUTH_TOKEN_KEY = 'authToken';
const PASSWORD_SECRET = 'MyAppSecret@2025';

@Injectable({ providedIn: 'root' })
export class AuthService {
  //#region Private Methods
  private getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  //#endregion

  //#region Public Methods

  public getUsers(): User[] {
    return this.getAllUsers();
  }

  public isEmailRegistered(email: string): boolean {
    if (!email) return false;
    return this.getAllUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public registerUser(user: User): void {
    const users = this.getAllUsers();
    users.push(user);
    this.saveAllUsers(users);
  }

  public encodePassword(rawPassword: string): string {
    return btoa(`${PASSWORD_SECRET}:${rawPassword}`);
  }

  public decodePassword(obfuscatedPassword: string): string {
    try {
      const decoded = atob(obfuscatedPassword);
      return decoded.split(':')[1];
    } catch {
      return '';
    }
  }

  public login(email: string, password: string, rememberMe: boolean): Observable<User> {
    const users = this.getAllUsers();
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      this.decodePassword(u.password) === password
    );

    if (!user) return throwError(() => new Error('Invalid email or password'));

    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).slice(2);

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);

    return of(user).pipe(delay(500));
  }


  public getCurrentUser(): User | null {
    const data = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  public getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  }

  public logout(): void {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    return !!this.getAuthToken();
  }
  //#endregion
}
