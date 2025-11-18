import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AppNotification, NotificationKind, NotificationSeverity } from '../../../../types/models/notifications';
import { Task } from '../../../../types/models/task';
import { Project } from '../../../../types/models/project';


@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly STORAGE_KEY = 'notifications';

  private notificationsSubject = new BehaviorSubject<AppNotification[]>(this.loadFromStorage());
  notifications$ = this.notificationsSubject.asObservable();

  unreadCount$ = this.notifications$.pipe(
    map(list => list.filter(n => !n.isRead).length),
    shareReplay(1)
  );

  // For toast/snackbar
  private toastSubject = new Subject<AppNotification>();
  toast$ = this.toastSubject.asObservable();

  constructor() {}

  // ========= CRUD on notifications =========

  addNotification(
    data: Omit<AppNotification, 'id' | 'isRead' | 'timestamp'> & { showToast?: boolean }
  ) {
    const notification: AppNotification = {
      id: this.generateId(),
      isRead: false,
      timestamp: new Date().toISOString(),
      ...data
    };

    const current = this.notificationsSubject.value;
    const updated = [notification, ...current];
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);

    if (data.showToast) {
      this.toastSubject.next(notification);
    }
  }

  markAsRead(id: string) {
    const updated = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  markAllAsRead() {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  dismiss(id: string) {
    const updated = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
  }

  clearAll() {
    this.notificationsSubject.next([]);
    this.saveToStorage([]);
  }

  // ========= Domain helpers (types in AC) =========

  notifyTaskDue(task: Task, kind: NotificationKind) {
    let severity: NotificationSeverity;
    let title: string;

    switch (kind) {
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

    // Optional: avoid duplicate due-date notifications for same task & kind
    if (this.existsSameForToday(task.id, kind)) {
      return;
    }

    this.addNotification({
      kind,
      severity,
      title,
      message: `${task.title} (Assigned to: ${task.assignee} – ${task.assigneeEmail})`,
      taskId: task.id,
      projectId: task.projectId,
      route: `/projects/${task.projectId}/tasks/${task.id}`,
      showToast: true
    });
  }

  notifyTaskCompleted(task: Task) {
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

  notifyTaskAssigned(task: Task) {
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

  notifyProjectStatusChanged(project: Project) {
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

  /**
   * Check all tasks and create:
   * - Task due today
   * - Task due tomorrow
   * - Task overdue
   */
  checkDueDates(tasks: Task[]) {
    const today = this.stripTime(new Date());
    const tomorrow = this.addDays(today, 1);

    tasks.forEach(task => {
      if (task.status === 'Completed') {
        return;
      }

      const due = this.stripTime(new Date(task.dueDate));

      if (this.isSameDay(due, today)) {
        this.notifyTaskDue(task, 'task-due-today');
      } else if (this.isSameDay(due, tomorrow)) {
        this.notifyTaskDue(task, 'task-due-tomorrow');
      } else if (due < today) {
        this.notifyTaskDue(task, 'task-overdue');
      }
    });
  }

  // ========= Private helpers =========

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private loadFromStorage(): AppNotification[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as AppNotification[];
    } catch {
      return [];
    }
  }

  private saveToStorage(list: AppNotification[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private addDays(d: Date, days: number): Date {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private existsSameForToday(taskId: number, kind: NotificationKind): boolean {
    const today = this.stripTime(new Date());
    return this.notificationsSubject.value.some(n => {
      if (n.taskId !== taskId || n.kind !== kind) return false;
      const ts = this.stripTime(new Date(n.timestamp));
      return this.isSameDay(ts, today);
    });
  }
}
