import { Injectable } from '@angular/core';
import { Task } from '../../../../types/models/task';
import { NotificationService } from './notification-service';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
    //#region Private Members
  /**
   * @description Cached list of tasks used for due-date monitoring
   */
  private tasks: Task[] = [];
    /**
   * @description Subscription used to periodically check task due dates
   */
  private dueCheckSub?: Subscription;
 //#endregion
  //#region Constructor
  /**
   * @description Injects NotificationService to trigger task due notifications
   * @param notificationService NotificationService - Service for handling app notifications
   */  constructor(private notificationService: NotificationService) { }
  //#endregion
  //#region Public Methods
  /**
   * @description Stores provided tasks locally, triggers immediate due check, and starts periodic due monitoring
   * @param tasks Task[] - List of tasks to monitor for due-date based notifications
   * @returns void
   */
  public setTasks(tasks: Task[]): void {
    this.tasks = tasks;
    this.notificationService.checkDueDates(this.tasks);
    this.dueCheckSub?.unsubscribe();
    this.dueCheckSub = interval(60_000).subscribe(() =>
      this.notificationService.checkDueDates(this.tasks)
    );
  }
  /**
   * @description Cleanup hook to prevent memory leaks by unsubscribing from observables
   * @returns void
   */ 
   public ngOnDestroy(): void {
    this.dueCheckSub?.unsubscribe();
  }
  //#endregion
}