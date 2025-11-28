import { Injectable } from '@angular/core';
import { User } from '../../../types/models/user';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const USERS_KEY = 'users';
const PASSWORD_SECRET = 'MyAppSecret@2025';

@Injectable({ providedIn: 'root' })
export class UserStorageService {
  //#region Properties
  /** MockAPI endpoint for users */
  private readonly apiUrl = 'https://692433503ad095fb847320c8.mockapi.io/users';
  //#endregion

  //#region Constructor
  /**
   * @summary Injects HttpClient for API operations.
   * @param http Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) { }
  //#endregion

  //#region LocalStorage Legacy Methods
  /**
   * @summary Retrieves all users stored in browser localStorage.
   * @returns User[]
   */
  public getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  /**
   * @summary Saves updated users array back to localStorage.
   * @param users Array of User objects
   */
  public saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  /**
   * @summary Checks whether a given email exists in localStorage.
   * @param email Email to search for
   * @returns boolean
   */
  public isEmailExists(email: string): boolean {
    const check = email.trim().toLowerCase();
    return this.getAllUsers().some(
      user => user.email.trim().toLowerCase() === check
    );
  }
  //#endregion

  //#region API Helpers
  /**
   * @summary Fetches all users from MockAPI.
   * @returns Observable<User[]>
   */
  public getAllUsersFromApi(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  /**
   * @summary Checks if an email exists using MockAPI.
   * @param email Email to validate
   * @returns Observable<boolean>
   */
  public isEmailExistsApi(email: string): Observable<boolean> {
    const normalized = email.trim().toLowerCase();
    return this.http
      .get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(normalized)}`)
      .pipe(map(users => users.length > 0));
  }
  /**
   * @summary Creates a new user via MockAPI.
   * @param user Full user object
   * @returns Observable<User>
   */
  public createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }
  /**
   * @summary Finds a user by email via MockAPI.
   * @param email User email to search for
   * @returns Observable<User | null>
   */
  public findUserByEmail(email: string): Observable<User | null> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map(users => {
        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
        return user ?? null;
      })
    );
  }
  //#endregion

  //#region Password Encoding
  /**
   * @summary Encodes password using Base64 format.
   * @param raw Plain text password
   * @returns string Encoded password
   */
  public getAllUsersFromApi(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * @summary Decodes Base64 encoded password.
   * @param encoded Encoded password string
   * @returns string Decoded password or empty string if error
   */
  public isEmailExistsApi(email: string): Observable<boolean> {
    const normalized = email.trim().toLowerCase();
    return this.http
      .get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(normalized)}`)
      .pipe(map(users => users.length > 0));
  }

  /**
   * @summary Create a new user via MockAPI.
   */
  public createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * @summary Find a single user by email via MockAPI (used for login).
   */
  public findUserByEmail(email: string): Observable<User | null> {
  return this.http.get<User[]>(this.apiUrl).pipe(
    map(users => {
      const normalizedEmail = email.trim().toLowerCase();
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
      return user ?? null;
    })
  );
}
  //#endregion

  //#region Password Encoding
  public encodePassword(raw: string): string {
    return btoa(`${PASSWORD_SECRET}:${raw}`);
  }

  public decodePassword(encoded: string): string {
    try {
      const decoded = atob(encoded);
      return decoded.split(':')[1];
    } catch {
      return '';
    }
  }
  //#endregion

  //#region Password Updates
  /**
   * @summary Updates user password on MockAPI.
   * @param userId User's ID
   * @param newPassword New plain password
   * @returns Observable<User>
   */
  public updateUserPasswordApi(userId: string, newPassword: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, {
      password: this.encodePassword(newPassword)
    });
  }
  /**
   * @summary Updates partial user data on MockAPI.
   * @param userId User ID
   * @param updatedUser Partial update object
   * @returns Observable<User>
   */
  public updateUserApi(userId: string, updatedUser: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, updatedUser);
  }

  //#endregion
  //#region Login State Helpers (NEW)

  //#region Login State Helpers
  /**
   * @summary Marks user as logged in (MockAPI).
   * @param userId ID of user to update
   * @returns Observable<User>
   */
  public markUserAsLoggedIn(userId: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, {
      isLoggedIn: true
    });
  }
  /**
   * @summary Marks user as logged out.
   * @param userId ID of user to update
   * @returns Observable<User>
   */
  public markUserAsLoggedOut(userId: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, {
      isLoggedIn: false
    });
  }
  /**
   * @summary Fetches first user with `isLoggedIn = true`.
   * @returns Observable<User | null>
   */
  public getLoggedInUser(): Observable<User | null> {
    return this.http
      .get<User[]>(`${this.apiUrl}?isLoggedIn=true`)
      .pipe(map(users => (users.length ? users[0] : null)));
  }
  //#endregion
}