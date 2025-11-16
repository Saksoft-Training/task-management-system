import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Activity } from '../../../../types/models/activity/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
   private _activities$ = new BehaviorSubject<Activity[]>([]);
 get activities$(): Observable<Activity[]> {
 return this._activities$.asObservable();
 }
 push(activity: Activity) {
 const current = this._activities$.getValue();
 const next = [activity, ...current].sort((a, b) => +new Date(b.timestamp) -
+new Date(a.timestamp));
 this._activities$.next(next.slice(0, 50)); // keep recent 50
 }
 bulkPush(activities: Activity[]) {
 const merged = [...activities, ...this._activities$.getValue()];
 merged.sort((a, b) => +new Date(b.timestamp)- +new Date(a.timestamp));
 this._activities$.next(merged.slice(0, 50));
 }
 clear() { this._activities$.next([]); }
 
}
