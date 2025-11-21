import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../../../../types/models/user';
import { UserStorageService } from '../../../shared/services/storage-service';

const CURRENT_USER_KEY = 'currentUser';
const AUTH_TOKEN_KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  //#region Properties
  /**
   * @summary Holds the current authenticated user and allows subscription.
   */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  /**
   * @summary Observable stream of auth user used for header updates.
   */
  public currentUser$ = this.currentUserSubject.asObservable();
  //#endregion

  //#region Constructor
  /**
   * @summary Loads saved login state and injects required services.
   * @param router - Handles navigation on login/logout.
   * @param userStorage - Provides access to stored user accounts.
   */
  constructor(
    private router: Router,
    private userStorage: UserStorageService
  ) {
    // Load saved user on app startup
    const savedUser = this.getCurrentUser();
    this.currentUserSubject.next(savedUser);
  }
  //#endregion

  //#region Login
  /**
   * @summary Validates credentials and logs in the user.
   * @param credentials Contains email, password, and rememberMe flag.
   * @returns Observable<User> Authenticated user or error.
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
    const token =
      'token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
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
    return of(user).pipe(
      delay(500),
      tap(() => this.currentUserSubject.next(user))
    );
  }
  //#endregion

  //#region Authentication Helpers
  /**
   * @summary Checks if authentication token exists.
   * @returns boolean True if logged in.
   */
  public isLoggedIn(): boolean {
    return !!(
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      sessionStorage.getItem(AUTH_TOKEN_KEY)
    );
  }
  /**
   * @summary Retrieves the currently authenticated user.
   * @returns User | null
   */
  public getCurrentUser(): User | null {
    const data =
      sessionStorage.getItem(CURRENT_USER_KEY) ||
      localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }
  /**
   * @summary Retrieves authentication token.
   * @returns string | null
   */
  public getAuthToken(): string | null {
    return (
      sessionStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem(AUTH_TOKEN_KEY)
    );
  }
  //#endregion

  //#region User Sync With Header / Profile
  /**
   * @summary Updates the BehaviorSubject so UI (header/profile) refreshes after user updates.
   * @param user Updated user object.
   * @returns void
   */
  public updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
  //#endregion

  ///#region Logout
  /**
   * @summary Logs out the current user by clearing login session keys,
   * resetting the application header state, and redirecting to the login page.
   * @returns void
   */
  public logout(): void {
    const keysToRemove = ['currentUser', 'authToken'];
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    this.currentUserSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }
  //#endregion
}
