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
   * @param router Handles navigation after login/logout.
   * @param userStorage Provides access to stored user data.
   */
  public constructor(
    private readonly router: Router,
    private readonly userStorage: UserStorageService
  ) {}
  //#endregion 

  //#region Login
  /**
   * @summary Validates user credentials and logs user in.
   * @param credentials Object containing email, password, and rememberMe flag.
   * @returns Observable<User> Emits authenticated user or error.
   */
  public login(credentials: {
    email: string;
    password: string;
    rememberMe: boolean;
  }): Observable<User> {
    const { email, password, rememberMe } = credentials;
    const allUsers = this.userStorage.getAllUsers();
    const user = allUsers.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      this.userStorage.decodePassword(u.password) === password
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
  //#endregion 

  //#region 
  /**
   * @summary Checks if authentication token exists.
   * @returns boolean Returns true if user is logged in.
   */
  public isLoggedIn(): boolean {
    return !!(
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      sessionStorage.getItem(AUTH_TOKEN_KEY)
    );
  }
  /**
   * @summary Retrieves the currently logged-in user.
   * @returns User|null The logged-in user or null if not found.
   */
  public getCurrentUser(): User | null {
    const data =
      sessionStorage.getItem(CURRENT_USER_KEY) ||
      localStorage.getItem(CURRENT_USER_KEY);

    return data ? JSON.parse(data) : null;
  }
  /**
   * @summary Retrieves stored authentication token.
   * @returns string|null Auth token string.
   */
  public getAuthToken(): string | null {
    return (
      sessionStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem(AUTH_TOKEN_KEY)
    );
  }
  //#endregion 

  //#region 
  /**
   * @summary Logs user out, clears storage, and redirects to login page.
   * @returns void
   */
  public logout(): void {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
  //#endregion 
}
