import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Activity } from '../../../../types/activity/activity.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../user-account-management/services/auth-service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  // #region Properties & Observables
  /** @summary Base API endpoint for activities */
  private readonly apiBase = 'https://692435723ad095fb84732960.mockapi.io/activities';
  /** @summary Internal subject holding the activity list */
  private _activities$ = new BehaviorSubject<Activity[]>([]);
 /**
   * @summary Observable stream of activities
   * @returns {Observable<Activity[]>} Stream of latest 50 activities sorted by timestamp
   */  get activities$(): Observable<Activity[]> {
    return this._activities$.asObservable();
  }

  // #endregion Properties & Observables
  // #region Constructor
  /**
   * @summary Constructor initializes service and listens for login events
   * @param http HttpClient for API calls
   * @param auth AuthService for reading current user data
   */
  constructor(private http: HttpClient, private auth: AuthService) {
    // Load activity whenever user logs in
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        console.log("User logged in → loading activities...");
        this.loadForCurrentUser();
      }
    });
  }
  // #endregion Constructor
  // #region Load Activities
  /**
   * @summary Loads all activities for the currently logged-in user
   * @description Fetches data from the API, normalizes it into Activity objects,
   * sorts it by timestamp, and updates the BehaviorSubject.
   * @returns {void}
   */
  loadForCurrentUser(): void {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) return;

    const url = `${this.apiBase}?userId=${currentUser.id}`;

    this.http.get<any[]>(url)
      .pipe(
        catchError(err => {
          console.error('[ActivityService] Failed to fetch activities', err);
          return of([] as Activity[]);
        }),
        tap(rawList => {

          const list: Activity[] = rawList.map(a => ({
            id: a.id,
            userId: a.userId,
            itemId: a.itemId,
            type: a.type,
            action: a.action,
            timestamp: a.timestamp,
            userName: currentUser.name,
            userEmail: currentUser.email,
            prettyAction: `${a.type} ${a.action}`
          }));
          const sorted = [...list].sort(
            (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
          );
          this._activities$.next(sorted.slice(0, 50));
        })
      )
      .subscribe();
  }

  // #endregion Load Activities
  // #region Add Single Activity
  /**
   * @summary Pushes a new activity to the backend and updates the local cache
   * @param activity The Activity object to insert
   * @returns {void}
   */
  push(activity: Activity): void {
    this.http.post<Activity>(this.apiBase, activity)
      .pipe(
        catchError(err => {
          console.error('[ActivityService.push] Failed', err);
          return of(null as any);
        }),
        tap(created => {
          if (created) {
            const current = this._activities$.getValue();
            const next = [created, ...current];
            next.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
            this._activities$.next(next.slice(0, 50));
          }
        })
      )
      .subscribe();
  }
  // #endregion Add Single Activity
  // #region Bulk Insert Activities
  /**
   * @summary Inserts multiple activities locally without calling the API
   * @param activities Array of activities to add
   * @returns {void}
   */
  bulkPush(activities: Activity[]) {
    const merged = [...activities, ...this._activities$.getValue()];
    merged.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
    this._activities$.next(merged.slice(0, 50));
  }
  // #endregion Bulk Insert Activities
  // #region Clear
  /**
   * @summary Clears all activities from the local cache
   * @returns {void}
   */
  clear() { this._activities$.next([]); }
  // #endregion Clear
}
