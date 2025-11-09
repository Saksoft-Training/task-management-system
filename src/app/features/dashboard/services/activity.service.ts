import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Activity } from '../../../contracts/activity.interface';
@Injectable({
  providedIn: 'root'
})
export class ActivityService {
   private activities = new BehaviorSubject<Activity[]>([]);
  public activities$ = this.activities.asObservable();

  constructor() {
    this.loadActivitiesFromStorage();
  }

  private loadActivitiesFromStorage(): void {
    const stored = localStorage.getItem('activities');
    if (stored) {
      const activities = JSON.parse(stored).map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      }));
      this.activities.next(activities);
    }
  }

  addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    const current = this.activities.value;
    const updated = [newActivity, ...current];
    this.activities.next(updated);
    this.saveActivitiesToStorage(updated);
  }

  getActivities(limit: number = 15): Observable<Activity[]> {
    return new Observable(observer => {
      this.activities$.subscribe(activities => {
        observer.next(activities.slice(0, limit));
      });
    });
  }

  getAllActivities(): Activity[] {
    return this.activities.value;
  }

  getActivitiesByType(
    itemType: 'project' | 'task' | 'assignment'
  ): Activity[] {
    return this.activities.value.filter(a => a.itemType === itemType);
  }

  getRecentActivities(days: number = 7): Activity[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.activities.value.filter(a => new Date(a.timestamp) >= cutoff);
  }

  clearActivities(): void {
    this.activities.next([]);
    localStorage.removeItem('activities');
  }

  private saveActivitiesToStorage(activities: Activity[]): void {
    localStorage.setItem('activities', JSON.stringify(activities));
  }
}
