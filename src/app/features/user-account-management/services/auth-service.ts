//#region Imports
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, mergeMap, switchMap, catchError } from 'rxjs/operators'; // ⭐ FIX: added catchError
import { User } from '../../../../types/models/user';
import { UserStorageService } from '../../../shared/services/storage-service';
//#endregion

@Injectable({ providedIn: 'root' })
export class AuthService {

  //#region State Management

  /**
   * Holds the currently authenticated user.
   * BehaviorSubject allows real-time UI updates (Header/Profile/User Menu).
   */
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  /**
   * Observable stream exposed to UI components to reactively subscribe to user state.
   */
  public currentUser$ = this.currentUserSubject.asObservable();

  //#endregion

  //#region Constructor

  /**
   * @summary Initializes session by restoring last logged-in user.
   * Helps maintain persistent authentication across refreshes.
   * @param router - Angular router for navigation
   * @param userStorage - Data persistence + mock API handler
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
   * @summary Validates user credentials and logs user in through MockAPI.
   * Includes:
   *  ✔ Email lookup
   *  ✔ Password decoding + validation
   *  ✔ Login status update + persistence
   *  ✔ Delayed response for realistic UX
   *
   * @param credentials Object containing login form values
   * @returns Observable<User>
   */
  public login(credentials: { email: string; password: string; rememberMe: boolean }): Observable<any> {
    const { email, password, rememberMe } = credentials;

    return this.userStorage.findUserByEmail(email).pipe(

      switchMap((user) => {

        // USER NOT FOUND
        if (!user) {
          return throwError(() => new Error('Invalid email or password'));
        }

        // WRONG PASSWORD
        const decodedPassword = this.userStorage.decodePassword(user.password);
        if (decodedPassword !== password) {
          return throwError(() => new Error('Invalid email or password'));
        }

        // SUCCESS → mark logged in
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


  private restoreUserSession() {
    this.userStorage.getLoggedInUser().subscribe(user => {
      if (user) {
        // Emit a brand-new object to trigger header update
        this.currentUserSubject.next({ ...user });
      }
    });
  }

  //#region Authentication Helpers

  /**
   * @summary Returns login status.
   * @returns boolean
   */
  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * @summary Returns currently authenticated user.
   */
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * @summary Placeholder for future JWT token support.
   */
  public getAuthToken(): string | null {
    return null;
  }

  //#endregion

  //#region User Sync With Header / Profile
  public updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
  //#endregion

  //#region Logout
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
