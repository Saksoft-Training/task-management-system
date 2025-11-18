import { Injectable } from '@angular/core';
import { Task } from '../../../../types/models/task';
import { NotificationService } from './notification-service';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
   private tasks: Task[] = [];
  private dueCheckSub?: Subscription;

  constructor(private notificationService: NotificationService) {}

  // Call this after loading tasks from localStorage / API
  setTasks(tasks: Task[]) {
    this.tasks = tasks;

    // initial check
    this.notificationService.checkDueDates(this.tasks);

    // optional: recheck every minute
    this.dueCheckSub?.unsubscribe();
    this.dueCheckSub = interval(60_000).subscribe(() =>
      this.notificationService.checkDueDates(this.tasks)
    );
  }

  ngOnDestroy(): void {
    this.dueCheckSub?.unsubscribe();
  }
}
