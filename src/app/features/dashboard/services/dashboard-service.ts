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

  constructor(private notificationService: NotificationService) { }

  public setTasks(tasks: Task[]): void {
    this.tasks = tasks;

    this.notificationService.checkDueDates(this.tasks);

    this.dueCheckSub?.unsubscribe();
    this.dueCheckSub = interval(60_000).subscribe(() =>
      this.notificationService.checkDueDates(this.tasks)
    );
  }

  public ngOnDestroy(): void {
    this.dueCheckSub?.unsubscribe();
  }
}
