import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Activity } from '../../../../types/activity/activity.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../user-account-management/services/auth-service';


@Injectable({
  providedIn: 'root',
})
export class ActivityService {
   private readonly apiBase ='https://692435723ad095fb84732960.mockapi.io/activities';
 
  private _activities$ = new BehaviorSubject<Activity[]>([]);
  get activities$(): Observable<Activity[]> {
    return this._activities$.asObservable();
  }
  constructor(private http: HttpClient, private auth: AuthService) {
      // Load activity whenever user logs in
      console.log("ActivityService constructor loaded");
      console.log("Current user restored:", this.auth.getCurrentUser());


    this.auth.currentUser$.subscribe(user => {
      if (user) {
        console.log("User logged in → loading activities...");
        this.loadForCurrentUser();
      }
    });
  }
   /**
   * Fetch all activities from API
   */
  loadForCurrentUser(): void {
  const user = this.auth.getCurrentUser();
  console.log("DEBUG - currentUser from ActivityService:", user);
  if (!user) return;

  const url = `${this.apiBase}?userId=${user.id}`;

  this.http.get<Activity[]>(url)
    .pipe(
      catchError(err => {
        console.error('[ActivityService] Failed to fetch activities', err);
        return of([] as Activity[]);
      }),
      tap(list => {
        const sorted = [...list].sort(
          (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
        );

        this._activities$.next(sorted.slice(0, 50));
      })
    )
    .subscribe();
  }

  /**
   * Add new activity (POST)
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

  bulkPush(activities: Activity[]) {
    const merged = [...activities, ...this._activities$.getValue()];
    merged.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
    this._activities$.next(merged.slice(0, 50));
  }
  clear() { this._activities$.next([]); }

}
