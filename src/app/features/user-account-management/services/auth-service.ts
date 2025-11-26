import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, mergeMap } from 'rxjs/operators'; // ⭐ CHANGED: added mergeMap
import { User } from '../../../../types/models/user';
import { UserStorageService } from '../../../shared/services/storage-service';

 
@Injectable({ providedIn: 'root' })
export class AuthService {
  //#region Properties
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  //#endregion
 
  //#region Constructor
  constructor(
    private router: Router,
    private userStorage: UserStorageService
  ) { 
    this.restoreUserSession();
  }
  //#endregion
 
  //#region Login
  /**
   * @summary Validates credentials and logs in the user via MockAPI.
   */
public login(credentials: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Observable<User> {
  const { email, password } = credentials;

  return this.userStorage.findUserByEmail(email).pipe(
    mergeMap(user => {
      if (!user) return throwError(() => new Error("Email not registered"));

      const storedPassword = this.userStorage.decodePassword(user.password);
      if (storedPassword !== password)
        return throwError(() => new Error("Invalid email or password"));

      // IMPORTANT: `updatedUser` is returned from MockAPI
      return this.userStorage.markUserAsLoggedIn(user.id).pipe(
        tap(updatedUser => {
          this.currentUserSubject.next(updatedUser);
        })
      );
    }),
    delay(400)
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
  public isLoggedIn(): boolean {
  return this.currentUserSubject.value !== null;
}

  public getCurrentUser(): User | null {
  return this.currentUserSubject.value;
}

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