import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../../../../types/models/user';
import { UserStorageService } from '../../../shared/services/storage-service';

const CURRENT_USER_KEY = 'currentUser';
const AUTH_TOKEN_KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class AuthService {

  //#region Constructor
  /**
   * @summary Injects router and user storage service used for login operations.
   * @param router Handles navigation after login/logout
   * @param userStorage Provides access to stored user data
   */
  constructor(
    private router: Router,
    private userStorage: UserStorageService
  ) {}
  //#endregion

  //#region Login
  /**
   * @summary Validates user credentials and logs user in.
   * @param credentials Object containing email, password and rememberMe flag
   * @returns Observable<User> Emits the authenticated user or error
   */
  public login(credentials: { email: string; password: string; rememberMe: boolean }): Observable<User> {
    const { email, password, rememberMe } = credentials;
    const allUsers = this.userStorage.getAllUsers();
    const user = allUsers.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      this.userStorage.decodePassword(u.password) === password
    );
    if (!user) {
      return throwError(() => new Error('Invalid email or password'));
    }
    const token =
      'token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    if (rememberMe) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      sessionStorage.clear();
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.clear();
    }
    return of(user).pipe(delay(500));
  }
  //#endregion

  //#region Auth State
  /**
   * @summary Checks if authentication token exists.
   * @returns boolean True if user is logged in
   */
  public isLoggedIn(): boolean {
    return !!(localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY));
  }
  /**
   * @summary Retrieves the currently logged-in user's data.
   * @returns User|null Current user or null
   */
  public getCurrentUser(): User | null {
    const data =
      sessionStorage.getItem(CURRENT_USER_KEY) ||
      localStorage.getItem(CURRENT_USER_KEY);

    return data ? JSON.parse(data) : null;
  }
  /**
   * @summary Gets the stored authentication token.
   * @returns string|null Auth token value
   */
  public getAuthToken(): string | null {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
  }
  //#endregion

  //#region Logout
  /**
   * @summary Clears all session/local storage and redirects to login page.
   * @returns void
   */
  public logout(): void {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
  //#endregion
}
