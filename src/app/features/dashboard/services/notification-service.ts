import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AppNotification, NotificationKind, NotificationSeverity } from '../../../../types/models/notifications';
import { Task } from '../../../../types/models/task';
import { Project } from '../../../../types/models/project';


@Injectable({ providedIn: 'root' })
export class NotificationService {
  //#region Private Properties
  /**
   * @summary Key used for storing notifications in browser localStorage
   */
  private readonly STORAGE_KEY = 'notifications';
/**
   * @summary BehaviorSubject holding the current state of all notifications
   * @description Maintains reactive state and provides real-time updates to subscribers
   */
  private notificationsSubject = new BehaviorSubject<AppNotification[]>(this.loadFromStorage());
   //#region Public Observables
  /**
   * @summary Observable stream of all notifications in the system
   * @description Emits the complete notification list whenever changes occur
   */
  public notifications$ = this.notificationsSubject.asObservable();
 /**
   * @summary Observable stream of unread notification count
   * @description Automatically calculates and emits count of unread notifications
   */
  public unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(notification => !notification.isRead).length),
    shareReplay(1)
  );

  /**
   * @summary Subject for emitting toast notifications for real-time display
   * @description Used by toast components to show temporary notification messages
   */
   //#region Public Observables
  /**
   * @summary Observable stream of all notifications in the system
   * @description Emits the complete notification list whenever changes occur
   */
  private toastNotificationSubject = new Subject<AppNotification>();
   /**
   * @summary Observable stream for toast notification display
   * @description Emits notifications that should be displayed as temporary toasts
   */
  public toastNotification$ = this.toastNotificationSubject.asObservable();
   /**
   * @summary Alias for toastNotification$ for backward compatibility
   * @description Maintains compatibility with components using the legacy toast$ property
   */
  public toast$ = this.toastNotificationSubject.asObservable();

  constructor() { }
 //#endregion
  // #region CRUD on notifications =========
/**
   * @summary Creates and adds a new notification to the system
   * @param data - Partial notification data without auto-generated fields
   * @param data.showToast - Optional flag to display notification as toast
   * @returns void
   */
  public addNotification(
    data: Omit<AppNotification, 'id' | 'isRead' | 'timestamp'> & { showToast?: boolean }
  ): void {
    const notification: AppNotification = {
      id: this.generateId(),
      isRead: false,
      timestamp: new Date().toISOString(),
      ...data
    };

    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications];
    this.notificationsSubject.next(updatedNotifications);
    this.saveToStorage(updatedNotifications);

    if (data.showToast) {
      this.toastNotificationSubject.next(notification);
    }
  }
 /**
   * @summary Marks a specific notification as read
   * @param notificationId - Unique identifier of the notification to update
   * @returns void
   */
  public markAsRead(notificationId: string): void {
    const updatedNotifications = this.notificationsSubject.value.map(notification =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification
    );
    this.notificationsSubject.next(updatedNotifications);
    this.saveToStorage(updatedNotifications);
  }

  /**
   * @summary Marks all notifications as read
   * @returns void
   */
  public markAllAsRead(): void {
    const updatedNotifications = this.notificationsSubject.value.map(notification => 
      ({ ...notification, isRead: true })
    );
    this.notificationsSubject.next(updatedNotifications);
    this.saveToStorage(updatedNotifications);
  }
/**
   * @summary Removes a specific notification from the system
   * @param notificationId - Unique identifier of the notification to remove
   * @returns void
   */
  public dismiss(notificationId: string): void {
    const updatedNotifications = this.notificationsSubject.value.filter(
      notification => notification.id !== notificationId
    );
    this.notificationsSubject.next(updatedNotifications);
    this.saveToStorage(updatedNotifications);
  }
/**
   * @summary Removes all notifications from the system
   * @returns void
   */
  public clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveToStorage([]);
  }
 //#endregion

  //#region Domain-Specific Notification Helpers
  /**
   * @summary Creates a task due date notification
   * @param task - The task that is approaching or past its due date
   * @param notificationType - Type of due date notification (today, tomorrow, overdue)
   * @returns void
   */
  public notifyTaskDue(task: Task, notificationType: NotificationKind): void {
    let severity: NotificationSeverity;
    let title: string;

    switch (notificationType) {
      case 'task-due-today':
        severity = 'warning';
        title = 'Task due today';
        break;
      case 'task-due-tomorrow':
        severity = 'info';
        title = 'Task due tomorrow';
        break;
      case 'task-overdue':
        severity = 'critical';
        title = 'Task overdue';
        break;
      default:
        severity = 'info';
        title = 'Task update';
    }
    if (this.existsDuplicateNotification(task.id, notificationType)) {
      return;
    }
    this.addNotification({
      kind: notificationType,
      severity,
      title,
      message: `${task.title} (Assigned to: ${task.assignee} – ${task.assigneeEmail})`,
      taskId: task.id,
      projectId: task.projectId,
      route: `/projects/${task.projectId}/tasks/${task.id}`,
      showToast: true
    });
  }
/**
   * @summary Creates a task completion notification
   * @param task - The task that was marked as completed
   * @returns void
   */
  public notifyTaskCompleted(task: Task): void {
    this.addNotification({
      kind: 'task-completed',
      severity: 'success',
      title: 'Task completed',
      message: `${task.title} has been marked as completed.`,
      taskId: task.id,
      projectId: task.projectId,
      route: `/projects/${task.projectId}/tasks/${task.id}`,
      showToast: true
    });
  }
 /**
   * @summary Creates a task assignment notification
   * @param task - The task that was assigned to a user
   * @returns void
   */
  public notifyTaskAssigned(task: Task): void {
    this.addNotification({
      kind: 'task-assigned',
      severity: 'info',
      title: 'New task assigned',
      message: `${task.title} has been assigned to ${task.assignee} (${task.assigneeEmail}).`,
      taskId: task.id,
      projectId: task.projectId,
      route: `/projects/${task.projectId}/tasks/${task.id}`,
      showToast: true
    });
  }

  /**
   * @summary Creates a project status change notification
   * @param project - The project whose status was updated
   * @returns void
   */
  public notifyProjectStatusChanged(project: Project): void {
    this.addNotification({
      kind: 'project-status-changed',
      severity: 'info',
      title: 'Project status updated',
      message: `${project.name} status changed to ${project.status}.`,
      projectId: project.id,
      route: `/projects/${project.id}`,
      showToast: true
    });
  }
 //#endregion

  //#region Task Management Methods
  /**
   * @summary Checks all tasks and creates due date notifications
   * @param tasks - Array of tasks to check for due dates
   * @returns void
   * @description Creates notifications for tasks due today, tomorrow, and overdue tasks
   */
  public checkTaskDueDates(tasks: Task[]): void {
    const today = this.stripTime(new Date());
    const tomorrow = this.addDays(today, 1);

    tasks.forEach(task => {
      if (task.status === 'Completed') {
        return;
      }

      const dueDate = this.stripTime(new Date(task.dueDate));

      if (this.isSameDay(dueDate, today)) {
        this.notifyTaskDue(task, 'task-due-today');
      } else if (this.isSameDay(dueDate, tomorrow)) {
        this.notifyTaskDue(task, 'task-due-tomorrow');
      } else if (dueDate < today) {
        this.notifyTaskDue(task, 'task-overdue');
      }
    });
  }
 /**
   * @summary Alias for checkTaskDueDates for backward compatibility
   * @param tasks - Array of tasks to check for due dates
   * @returns void
   */
  public checkDueDates(tasks: Task[]): void {
    this.checkTaskDueDates(tasks);
  }
  //#endregion

  //#region Private Helper Methods
  /**
   * @summary Generates a unique identifier for notifications
   * @returns string - Unique ID combining timestamp and random component
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
/**
   * @summary Loads notifications from persistent storage
   * @returns AppNotification[] - Array of notifications from localStorage
   */
  private loadFromStorage(): AppNotification[] {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return [];
      return JSON.parse(storedData) as AppNotification[];
    } catch {
      return [];
    }
  }
/**
   * @summary Saves notifications to persistent storage
   * @param notifications - Array of notifications to persist
   * @returns void
   */
  private saveToStorage(notifications: AppNotification[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
  }
/**
   * @summary Removes time component from a Date object
   * @param date - Date object to strip time from
   * @returns Date - Date with time set to 00:00:00
   */
  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
 /**
   * @summary Checks if two dates represent the same calendar day
   * @param firstDate - First date to compare
   * @param secondDate - Second date to compare
   * @returns boolean - True if both dates are the same day
   */
  private isSameDay(firstDate: Date, secondDate: Date): boolean {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  }
  /**
   * @summary Adds specified number of days to a date
   * @param date - Base date to add days to
   * @param days - Number of days to add
   * @returns Date - New date with days added
   */
  private addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }
 /**
   * @summary Checks for duplicate task notifications on the same day
   * @param taskId - ID of the task to check for duplicates
   * @param notificationType - Type of notification to check
   * @returns boolean - True if duplicate notification exists for today
   */
  private existsDuplicateNotification(taskId: number, notificationType: NotificationKind): boolean {
    const today = this.stripTime(new Date());
    return this.notificationsSubject.value.some(notification => {
      if (notification.taskId !== taskId || notification.kind !== notificationType) return false;
      const notificationDate = this.stripTime(new Date(notification.timestamp));
      return this.isSameDay(notificationDate, today);
    });
  }
  //#endregion
}
