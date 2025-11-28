import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { User } from '../../../../types/models/user';
import { UserStorageService } from '../../../shared/services/storage-service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  //#region State Management
  /**
   * @summary Holds the currently authenticated user.
   * BehaviorSubject ensures all components receive live updates.
   */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  /**
   * @summary Observable stream for subscription across components.
   */
  public currentUser$ = this.currentUserSubject.asObservable();
  //#endregion

  //#region Constructor
  /**
   * @summary Initializes service and restores session if a user is already logged in.
   * @param router Route navigation handler
   * @param userStorage Handles user API operations
   */
  constructor(
    private router: Router,
    private userStorage: UserStorageService
  ) {
    this.restoreUserSession();
  }
  //#endregion

  //#region Login
  /**
   * @summary Validates credentials and logs user in through MockAPI.
   * @param credentials Login form values
   * @returns Observable<User>
   */
  public login(credentials: { email: string; password: string; rememberMe: boolean }): Observable<any> {
    const { email, password, rememberMe } = credentials;
    return this.userStorage.findUserByEmail(email).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('Invalid email or password'));
        }
        const decodedPassword = this.userStorage.decodePassword(user.password);
        if (decodedPassword !== password) {
          return throwError(() => new Error('Invalid email or password'));
        }
        return this.userStorage.markUserAsLoggedIn(user.id).pipe(
          tap(updatedUser => {
            const userJson = JSON.stringify(updatedUser);
            sessionStorage.setItem('currentUser', userJson);
            if (rememberMe) {
              localStorage.setItem('currentUser', userJson);
            }
            this.currentUserSubject.next(updatedUser);
          })
        );
      }),
      catchError(err => throwError(() => err))
    );
  }
  //#endregion

  //#region Session Restore
  /**
   * @summary Restores current user from API where `isLoggedIn = true`
   */
  private restoreUserSession(): void {
    this.userStorage.getLoggedInUser().subscribe(user => {
      if (user) {
        this.currentUserSubject.next({ ...user });
      }
    });
  }
  //#endregion

  //#region Helper Methods
  /**
   * @summary Checks if user is currently authenticated.
   * @returns boolean
   */
  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
  /**
   * @summary Returns currently authenticated user.
   * @returns User | null
   */
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  /**
   * @summary Placeholder for future token-based auth.
   * @returns null
   */
  public getAuthToken(): string | null {
    return null;
  }
  //#endregion

  //#region User Sync
  /**
   * @summary Updates current user across components.
   * @param user Updated user object
   */
  public updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
  //#endregion

  //#region Logout
  /**
   * @summary Logs out user and clears stored session.
   */
  public logout(): void {
    const user = this.currentUserSubject.value;
    if (user) {
      this.userStorage.markUserAsLoggedOut(user.id).subscribe(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/login'], { replaceUrl: true });
      });
    } else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
  //#endregion
}