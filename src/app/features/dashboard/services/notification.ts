import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string|number;
  type: 'due-today' | 'due-tomorrow' | 'overdue' | 'completed' | 'project-status' | 'assigned';
  severity: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  timestamp: Date;
  read: boolean;
  taskId?: string;
  projectId?: string;
  taskName?: string;
  projectName?: string;
}

export interface CreateNotification {
  type: 'due-today' | 'due-tomorrow' | 'overdue' | 'completed' | 'project-status' | 'assigned';
  severity: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  taskId?: string;
  projectId?: string;
  taskName?: string;
  projectName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
   private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      this.notifications = JSON.parse(stored).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      this.updateSubjects();
    }
  }

  private saveNotifications(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.updateSubjects();
  }

  private updateSubjects(): void {
    this.notificationsSubject.next([...this.notifications]);
    this.unreadCountSubject.next(this.notifications.filter(n => !n.read).length);
  }

  addNotification(notificationData: CreateNotification): void {
    const newNotification: Notification = {
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
      ...notificationData
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => notification.read = true);
    this.saveNotifications();
  }

  dismissNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  getAllNotifications(): Notification[] {
    return [...this.notifications];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

}
