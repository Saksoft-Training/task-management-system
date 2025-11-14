import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../../../../types/models/user';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const AUTH_TOKEN_KEY = 'authToken';
const PASSWORD_SECRET = 'MyAppSecret@2025';

@Injectable({ providedIn: 'root' })
export class AuthService {
  //#region Constructor
  /**
   * @summary Initializes router service for navigation.
   * @param router - Angular Router for redirection after logout.
   */
  constructor(private router: Router) {}
  //#endregion
  //#region Private Methods
  /**
   * @summary Retrieves all registered users from localStorage.
   * @returns User[] - List of all users.
   */
  private getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }
  /**
   * @summary Saves user list into localStorage.
   * @param users - Array of users to store.
   * @returns void
   */
  private saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  //#endregion
  //#region Public Methods
  /**
   * @summary Returns all users in the system.
   * @returns User[]
   */
  public getUsers(): User[] {
    return this.getAllUsers();
  }
  /**
   * @summary Checks if an email is already registered.
   * @param email - Email to verify.
   * @returns boolean
   */
  public isEmailRegistered(email: string): boolean {
    if (!email) return false;
    return this.getAllUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
  }
  /**
   * @summary Adds a new user to storage.
   * @param user - User object to register.
   * @returns void
   */
  public registerUser(user: User): void {
    const users = this.getAllUsers();
    users.push(user);
    this.saveAllUsers(users);
  }
  /**
   * @summary Encodes password using simple reversible obfuscation.
   * @param rawPassword - User-entered password.
   * @returns string - Encoded password.
   */
  public encodePassword(rawPassword: string): string {
    return btoa(`${PASSWORD_SECRET}:${rawPassword}`);
  }
  /**
   * @summary Decodes previously obfuscated password.
   * @param obfuscatedPassword - Encoded password string.
   * @returns string - Decoded plain password.
   */
  public decodePassword(obfuscatedPassword: string): string {
    try {
      const decoded = atob(obfuscatedPassword);
      return decoded.split(':')[1];
    } catch {
      return '';
    }
  }
  /**
   * @summary Attempts to login a user and stores session based on rememberMe.
   * @param email - User email.
   * @param password - User password.
   * @param rememberMe - Whether to persist login.
   * @returns Observable<User>
   */
  public login(email: string, password: string, rememberMe: boolean): Observable<User> {
    const users = this.getAllUsers();
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      this.decodePassword(u.password) === password
    );
    if (!user) {
      return throwError(() => new Error('Invalid email or password'));
    }
    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    if (rememberMe) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      sessionStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return of(user).pipe(delay(500));
  }
  /**
   * @summary Retrieves currently authenticated user.
   * @returns User 
   */
  public getCurrentUser(): User | null {
    const data = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }
  /**
   * @summary Returns stored authentication token.
   * @returns string | null
   */
  public getAuthToken(): string | null {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
  }
  /**
   * @summary Clears session + token and redirects user to login page.
   * @returns void
   */
  public logout(): void {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.router.navigate(['/login'], { replaceUrl: true });
  }
  /**
   * @summary Checks whether a user is currently logged in.
   * @returns boolean
   */
  public isLoggedIn(): boolean {
    return !!this.getAuthToken();
  }
  //#endregion
}
