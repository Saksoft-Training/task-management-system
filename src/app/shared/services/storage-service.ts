import { Injectable } from '@angular/core';
import { User } from '../../../types/models/user';
import { HttpClient } from '@angular/common/http'; // ⭐ CHANGED: added HttpClient
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // ⭐ CHANGED: for API helpers
 
const USERS_KEY = 'users';
const PASSWORD_SECRET = 'MyAppSecret@2025';
 
@Injectable({ providedIn: 'root' })
export class UserStorageService {
  private readonly apiUrl = 'https://692433503ad095fb847320c8.mockapi.io/users';
  constructor(private http: HttpClient) {}
 
  //#region OLD localStorage methods (still here to avoid breaking other code)
  /**
   * @summary Retrieves all stored users from localStorage.
   * NOTE: Prefer using API helpers below for new features.
   */
  public getAllUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }
 
  /**
   * @summary Saves the updated array of users back to localStorage.
   * NOTE: Kept for backward compatibility.
   */
  public saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
 
  /**
   * @summary Checks if a given email already exists in localStorage users.
   * NOTE: For new logic, use isEmailExistsApi().
   */
  public isEmailExists(email: string): boolean {
    const check = email.trim().toLowerCase();
    return this.getAllUsers().some(
      user => user.email.trim().toLowerCase() === check
    );
  }
  //#endregion
 
  //#region API helpers 
  /**
   * @summary Get all users from MockAPI.
   */
  public getAllUsersFromApi(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
 
  /**
   * @summary Check if email exists using MockAPI (for async validator).
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
    const normalized = email.trim().toLowerCase();
    return this.http
      .get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(normalized)}`)
      .pipe(map(users => (users.length ? users[0] : null)));
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
 
  //#region Password Update 
  /**
 * @summary Update user password via MockAPI
 */
public updateUserPasswordApi(userId: string, newPassword: string): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/${userId}`, {
    password: this.encodePassword(newPassword)
  });
}

public updateUserApi(userId: string, updatedUser: Partial<User>): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/${userId}`, updatedUser);
}

  //#endregion
  //#region Login State Helpers (NEW)

/**
 * @summary Mark a user as logged in using MockAPI.
 */
public markUserAsLoggedIn(userId: string): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/${userId}`, {
    isLoggedIn: true
  });
}

/**
 * @summary Mark a user as logged out.
 */
public markUserAsLoggedOut(userId: string): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/${userId}`, {
    isLoggedIn: false
  });
}

/**
 * @summary Fetch currently logged-in user from API.
 * Will return first user with isLoggedIn === true
 */
public getLoggedInUser(): Observable<User | null> {
  return this.http
    .get<User[]>(`${this.apiUrl}?isLoggedIn=true`)
    .pipe(map(users => (users.length ? users[0] : null)));
}
//#endregion

}