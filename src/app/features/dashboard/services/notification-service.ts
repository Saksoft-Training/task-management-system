import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AppNotification, NotificationKind, NotificationSeverity } from '../../../../types/models/notifications';
import { Task } from '../../../../types/models/task';
import { Project } from '../../../../types/models/project';

//#region Interfaces & Types
/**
 * Extended notification type used internally with additional metadata
 */
interface ExtendedAppNotification extends AppNotification {
  metadata?: {
    uniqueKey?: string;
    [key: string]: any;
  }
};
/**
 * Generic structure for notification configuration
 */
export interface NotificationConfig {
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  message: string;
  route?: string;
  metadata?: Record<string, any>;
  showToast?: boolean;
}
/**
 * Defines how notification handlers should behave for different domain events
 */
export interface NotificationHandler<T = any> {
  shouldNotify(data: T): boolean;
  createConfig(data: T): Omit<NotificationConfig, 'kind'>; // Remove kind from createConfig return
  getUniqueKey(data: T): string;
}
//#endregion

@Injectable({ providedIn: 'root' })
export class NotificationService {
  //#region Private Members
  /** @description Local storage key used for persistence */
  private readonly STORAGE_KEY = 'notifications';
  /** @description Reactive source representing stored notifications */
  private notificationsSubject = new BehaviorSubject<ExtendedAppNotification[]>(this.loadFromStorage());
  /** @description Emits toast based notifications */
  private toastNotificationSubject = new Subject<ExtendedAppNotification>();

  /** @description Collection of registered notification handlers used to generate notifications dynamically */
  private handlers = new Map<NotificationKind, NotificationHandler>();
  //#region Public Observables
  /** @description Observable exposing notifications list */
  public notifications$ = this.notificationsSubject.asObservable();
  /** @description Observable that emits unread notification count, shared across subscribers */
  public unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(notification => !notification.isRead).length),
    shareReplay(1)
  );
  /** @description Observable to trigger toast notifications */
  public toastNotification$ = this.toastNotificationSubject.asObservable();
  public toast$ = this.toastNotificationSubject.asObservable();
  //#endregion
  constructor() {
    this.registerDefaultHandlers();
  }

   //#region Core Notification Methods

  /**
   * @description Adds a new notification to system and optionally displays a toast message
   * @param data - Notification configuration excluding id, read status and timestamp
   * @returns void
   */  public addNotification(
    data: Omit<ExtendedAppNotification, 'id' | 'isRead' | 'timestamp'> & { showToast?: boolean }
  ): void {
    const notification: ExtendedAppNotification = {
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
  * @description Generic wrapper that executes registered handlers to display notifications
  * @param kind - Notification type identifier
  * @param data - Object passed to handler logic
  * @returns boolean - True if notification created, false otherwise
  */
  public notify<T>(kind: NotificationKind, data: T): boolean {
    const handler = this.handlers.get(kind);
    if (!handler) {
      console.warn(`No handler registered for notification kind: ${kind}`);
      return false;
    }
    if (!handler.shouldNotify(data)) {
      return false;
    }
    // Check for duplicates
    const uniqueKey = handler.getUniqueKey(data);
    if (this.existsDuplicateNotification(kind, uniqueKey)) {
      return false;
    }
    const config = handler.createConfig(data);
    this.addNotification({
      ...config,
      kind,
      metadata: { ...data, uniqueKey } // Store data and unique key in metadata
    });
    return true;
  }
  /**
 * @description Registers a custom notification handler for dynamic generation
 * @param kind - Unique notification type
 * @param handler - Custom implementation handler
 * @returns void
 */
  public registerHandler<T>(kind: NotificationKind, handler: NotificationHandler<T>): void {
    this.handlers.set(kind, handler);
  }
  //#endregion
  //#region Domain-Specific Notification Methods
  /**
   * @description Triggers notification for a task based on provided kind
   */
  public notifyTaskDue(task: Task, notificationType: NotificationKind): void {
    this.notify(notificationType, task);
  }
  /** @description Notifies when a task has been completed */
  public notifyTaskCompleted(task: Task): void {
    this.notify('task-completed' as NotificationKind, task);
  }
  /** @description Notifies when a task is assigned to a user */
  public notifyTaskAssigned(task: Task): void {
    this.notify('task-assigned' as NotificationKind, task);
  }
  /** @description Notifies when project status changes */
  public notifyProjectStatusChanged(project: Project): void {
    this.notify('project-status-changed' as NotificationKind, project);
  }
  /** @description Notifies when user role changes */
  public notifyUserRoleChanged(user: any, oldRole: string, newRole: string): void {
    this.notify('user-role-changed' as NotificationKind, { user, oldRole, newRole });
  }
  /** @description Notifies when a new user joins the platform */
  public notifyNewUserRegistered(user: any): void {
    this.notify('user-registered' as NotificationKind, user);
  }
  /** @description Displays scheduled maintenance notification */
  public notifySystemMaintenance(scheduledTime: Date, duration: string): void {
    this.notify('system-maintenance' as NotificationKind, { scheduledTime, duration });
  }
  //#endregion
  //#region Default Handlers Registration
  /**
   * @description Registers all default handlers for task, project, user and system notifications
   * @returns void
   */
  private registerDefaultHandlers(): void {
    // Task Due Date Handler
    this.registerHandler('task-due-today' as NotificationKind, {
      shouldNotify: (task: Task) => task.status !== 'Completed',
      createConfig: (task: Task) => ({
        severity: 'warning' as NotificationSeverity,
        title: 'Task due today',
        message: `${task.title} (Assigned to: ${task.assignee} – ${task.assigneeEmail})`,
        route: `/projects/${task.projectId}/tasks/${task.id}`,
        showToast: true
      }),
      getUniqueKey: (task: Task) => `task-due-today-${task.id}-${new Date().toDateString()}`
    } as NotificationHandler<Task>);

    this.registerHandler('task-due-tomorrow' as NotificationKind, {
      shouldNotify: (task: Task) => task.status !== 'Completed',
      createConfig: (task: Task) => ({
        severity: 'info' as NotificationSeverity,
        title: 'Task due tomorrow',
        message: `${task.title} (Assigned to: ${task.assignee} – ${task.assigneeEmail})`,
        route: `/projects/${task.projectId}/tasks/${task.id}`,
        showToast: true
      }),
      getUniqueKey: (task: Task) => `task-due-tomorrow-${task.id}-${new Date().toDateString()}`
    } as NotificationHandler<Task>);

    this.registerHandler('task-overdue' as NotificationKind, {
      shouldNotify: (task: Task) => task.status !== 'Completed',
      createConfig: (task: Task) => ({
        severity: 'critical' as NotificationSeverity,
        title: 'Task overdue',
        message: `${task.title} (Assigned to: ${task.assignee} – ${task.assigneeEmail})`,
        route: `/projects/${task.projectId}/tasks/${task.id}`,
        showToast: true
      }),
      getUniqueKey: (task: Task) => `task-overdue-${task.id}-${new Date().toDateString()}`
    } as NotificationHandler<Task>);

    // Task Completion Handler
    this.registerHandler('task-completed' as NotificationKind, {
      shouldNotify: () => true,
      createConfig: (task: Task) => ({
        severity: 'success' as NotificationSeverity,
        title: 'Task completed',
        message: `${task.title} has been marked as completed.`,
        route: `/projects/${task.projectId}/tasks/${task.id}`,
        showToast: true
      }),
      getUniqueKey: (task: Task) => `task-completed-${task.id}`
    } as NotificationHandler<Task>);

    // Task Assignment Handler
    this.registerHandler('task-assigned' as NotificationKind, {
      shouldNotify: () => true,
      createConfig: (task: Task) => ({
        severity: 'info' as NotificationSeverity,
        title: 'New task assigned',
        message: `${task.title} has been assigned to ${task.assignee} (${task.assigneeEmail}).`,
        route: `/projects/${task.projectId}/tasks/${task.id}`,
        showToast: true
      }),
      getUniqueKey: (task: Task) => `task-assigned-${task.id}`
    } as NotificationHandler<Task>);

    // Project Status Handler
    this.registerHandler('project-status-changed' as NotificationKind, {
      shouldNotify: () => true,
      createConfig: (project: Project) => ({
        severity: 'info' as NotificationSeverity,
        title: 'Project status updated',
        message: `${project.name} status changed to ${project.status}.`,
        route: `/projects/${project.id}`,
        showToast: true
      }),
      getUniqueKey: (project: Project) => `project-status-${project.id}-${project.status}`
    } as NotificationHandler<Project>);

    // User Management Handlers (examples)
    this.registerHandler('user-role-changed' as NotificationKind, {
      shouldNotify: () => true,
      createConfig: (data: { user: any, oldRole: string, newRole: string }) => ({
        severity: 'info' as NotificationSeverity,
        title: 'User role updated',
        message: `${data.user.name}'s role changed from ${data.oldRole} to ${data.newRole}.`,
        route: `/admin/users/${data.user.id}`,
        showToast: true
      }),
      getUniqueKey: (data: { user: any, oldRole: string, newRole: string }) =>
        `user-role-${data.user.id}-${data.newRole}`
    });

    this.registerHandler('user-registered' as NotificationKind, {
      shouldNotify: () => true,
      createConfig: (user: any) => ({
        severity: 'success' as NotificationSeverity,
        title: 'New user registered',
        message: `${user.name} (${user.email}) has joined the platform.`,
        route: `/admin/users/${user.id}`,
        showToast: false // Don't show toast for new registrations
      }),
      getUniqueKey: (user: any) => `user-registered-${user.id}`
    });

    // System Maintenance Handler
    this.registerHandler('system-maintenance' as NotificationKind, {
      shouldNotify: () => true,
      createConfig: (data: { scheduledTime: Date, duration: string }) => ({
        severity: 'warning' as NotificationSeverity,
        title: 'System Maintenance Scheduled',
        message: `Maintenance scheduled for ${data.scheduledTime.toLocaleString()} for ${data.duration}.`,
        showToast: true
      }),
      getUniqueKey: (data: { scheduledTime: Date, duration: string }) =>
        `maintenance-${data.scheduledTime.getTime()}`
    });
  }
  //#endregion

  //#region CRUD & Helper Methods

  /**
   * @description Marks a notification as read
   * @param notificationId - Id of the notification to update
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
   * @description Marks all notifications as read
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
   * @description Removes a notification from the list
   * @param notificationId - Identifier to remove
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
   * @description Clears all notifications permanently
   * @returns void
   */
  public clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveToStorage([]);
  }
  /**
   * @description Validates and notifies tasks based on due date
   * @param tasks - List of task items to validate
   * @returns void
   */
  public checkTaskDueDates(tasks: Task[]): void {
    const today = this.stripTime(new Date());
    const tomorrow = this.addDays(today, 1);

    tasks.forEach(task => {
      if (task.status === 'Completed') return;

      const dueDate = this.stripTime(new Date(task.dueDate));

      if (this.isSameDay(dueDate, today)) {
        this.notifyTaskDue(task, 'task-due-today' as NotificationKind);
      } else if (this.isSameDay(dueDate, tomorrow)) {
        this.notifyTaskDue(task, 'task-due-tomorrow' as NotificationKind);
      } else if (dueDate < today) {
        this.notifyTaskDue(task, 'task-overdue' as NotificationKind);
      }
    });
  }
  /**
   * @description Helper wrapper around checkTaskDueDates (legacy support)
   * @param tasks - Task list to validate
   * @returns void
   */
  public checkDueDates(tasks: Task[]): void {
    this.checkTaskDueDates(tasks);
  }
  /**
   * @description Creates unique random notification ID
   * @returns string - UUID-like identifier
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  /**
   * @description Loads persisted notifications from browser storage
   * @returns ExtendedAppNotification[]
   */  private loadFromStorage(): ExtendedAppNotification[] {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return [];

      const parsed = JSON.parse(storedData) as AppNotification[];
      // Convert to ExtendedAppNotification by adding metadata if missing
      return parsed.map(notification => ({
        ...notification,
        metadata: (notification as ExtendedAppNotification).metadata || {}
      }));
    } catch {
      return [];
    }
  }
  /**
   * @description Persists notification array to browser storage
   * @param notifications - Updated notification list
   * @returns void
   */
  private saveToStorage(notifications: ExtendedAppNotification[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
  }
  /**
     * @description Removes time for accurate comparison
     * @param date - Input date
     * @returns Date - Normalized date
     */
  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  /**
    * @description Compares two dates ignoring time
    * @returns boolean - True if dates match
    */
  private isSameDay(firstDate: Date, secondDate: Date): boolean {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  }
  /**
    * @description Adds required number of days to a date
    * @returns Date - Modified date
    */
  private addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }
  /**
     * @description Checks whether similar notification already exists for today
     * @param kind - Notification category
     * @param uniqueKey - Unique identifier generated by the handler
     * @returns boolean - True if notification duplicates found
     */
  private existsDuplicateNotification(kind: NotificationKind, uniqueKey: string): boolean {
    const today = this.stripTime(new Date());
    return this.notificationsSubject.value.some(notification => {
      if (notification.kind !== kind) return false;
      const notificationDate = this.stripTime(new Date(notification.timestamp));
      return this.isSameDay(notificationDate, today) &&
        notification.metadata?.[uniqueKey] === uniqueKey;
    });
  }
  //#endregion
}