import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, startWith, timestamp } from 'rxjs';
import { Notification,NotificationPreferencs  } from '../../../contracts/Notifications';


interface Task {
id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled' ;
  priority: 'low'|'medium' | 'high' | 'critical';
  assignee: string;
  dueDate: string;
  projectId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEY='notifications';
  private readonly PREFERENCES_KEY='notification_preferences';
  private checkInterval=60000;

  private notificationsSubject=new BehaviorSubject<Notification[]>(this.loadNotifications());
  private unreadCountSubject=new BehaviorSubject<number>(this.calculateUnreadCount());
  private newNotificationSubject=new BehaviorSubject<Notification | null>(null);

  public notifications$=this.notificationsSubject.asObservable();
  public unreadCount$=this.unreadCountSubject.asObservable();
  public newNotification$=this.newNotificationSubject.asObservable();

  constructor() {
    interval(this.checkInterval).pipe(startWith(0)).subscribe(()=> {
      this.checkDueDateNotifications();
    });
  }

  private loadNotifications(): Notification[] {
    try {
      const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      return notifications.map((n:any)=> ({
        ...n,
        timestamp:new Date(n.timestamp)
      }));
    } catch (error) {
      console.log('Error loading notifications from localStorage:',error);
      return [];
    }
  }

   private saveNotifications(notifications:Notification[]) {
   try {
    localStorage.setItem(this.STORAGE_KEY,JSON.stringify(notifications));
    this.notificationsSubject.next(notifications);
    this.unreadCountSubject.next(this.calculateUnreadCount(notifications));
   } catch(error) {
    console.log('Error saving notifications to localStorage:',error);
   }
  }

   private calculateUnreadCount(notifications?:Notification[]):number {
      const notes = notifications || this.loadNotifications();
      return notes.filter(n => !n.read).length;
    }

     generateDueDateNotifications(tasks:Task[]):void {
      const now =new Date();
        const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
        const tomorrow=new Date(today);
        tomorrow.setDate(tomorrow.getDate()+1);
      
        tasks.forEach(task => {
          if(!task.dueDate || task.status === 'done') return;

          const dueDate=new Date(task.dueDate);
          const dueDateOnly=new Date(dueDate.getFullYear(),dueDate.getMonth(),dueDate.getDate());

          const existingNotifications=this.loadNotifications();

          if (dueDateOnly.getTime() === today.getTime()) {
            this.createNotificationIfNotExists('due_today', task, existingNotifications);
          }
        });
    }

     private createNotificationIfNotExists(type: 'due_today' | 'due_tomorrow' | 'overdue', task: Task, existing: Notification[]): void {
    const exists = existing.some(n => 
      n.itemId === String(task.id) && n.type === type && !n.read
    );

    if (!exists) {
      this.createTaskNotification(type, task);
    }
  }

  createTaskNotification(type: 'due_today' | 'due_tomorrow' | 'overdue' | 'completed' | 'assigned', task: Task, assignedUserId?: string): void {
    const config = {
      'due_today': { 
        severity: 'warning' as const, 
        title: 'Task Due Today', 
        message: `"${task.title}" is due today` 
      },
      'due_tomorrow': { 
        severity: 'warning' as const, 
        title: 'Task Due Tomorrow', 
        message: `"${task.title}" is due tomorrow` 
      },
      'overdue': { 
        severity: 'critical' as const, 
        title: 'Task Overdue', 
        message: `"${task.title}" is overdue` 
      },
      'completed': { 
        severity: 'success' as const, 
        title: 'Task Completed', 
        message: `"${task.title}" has been completed` 
      },
      'assigned': { 
        severity: 'info' as const, 
        title: 'New Task Assigned', 
        message: `You've been assigned to "${task.title}"` 
      }
    };

     const notificationConfig = config[type];
    if (!this.shouldCreateNotification(type)) return;

    const notification: Notification = {
      id: Date.now(),
      type,
      severity: notificationConfig.severity as unknown as Notification['severity'],
      title: notificationConfig.title,
      message: notificationConfig.message,
      read: false,
      timestamp: new Date(),
      itemId: String(task.id),
      itemType: 'task',
      userId: assignedUserId
    };

    this.addNotification(notification);
  }

  createProjectNotification(action: 'created' | 'updated' | 'deleted', projectId: string, projectName: string): void {
    if (!this.shouldCreateNotification('project_updated')) return;

    const notification: Notification = {
      id: Date.now(),
      type: 'project_updated',
      severity: 'info',
      title: `Project ${action}`,
      message: `Project "${projectName}" has been ${action}`,
      read: false,
      timestamp: new Date(),
      itemId: projectId,
      itemType: 'project'
    };

    this.addNotification(notification);
  }

  private shouldCreateNotification(type: Notification['type']): boolean {
    const preferences = this.getPreferences();
    switch (type) {
      case 'due_today': return preferences.dueToday;
      case 'due_tomorrow': return preferences.dueTomorrow;
      case 'overdue': return preferences.overdue;
      case 'completed': return preferences.completed;
      case 'assigned': return preferences.assigned;
      case 'project_updated': return preferences.projectUpdates;
      default: return true;
    }
  }

   addNotification(notification: Notification): void {
    const current = this.loadNotifications();
    const updated = [notification, ...current];
    this.saveNotifications(updated);
    this.newNotificationSubject.next(notification);
  }

  markAsRead(id: number): void {
    const updated = this.loadNotifications().map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications(updated);
  }

  markAllAsRead(): void {
    const updated = this.loadNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(updated);
  }

  removeNotification(id: number): void {
    const updated = this.loadNotifications().filter(n => n.id !== id);
    this.saveNotifications(updated);
  }

  clearAll(): void {
    this.saveNotifications([]);
  }

  private checkDueDateNotifications(): void {
 
    console.log('Checking for due date notifications...');
  }

   getPreferences(): NotificationPreferencs {
    try {
      return JSON.parse(localStorage.getItem(this.PREFERENCES_KEY) || '{}');
    } catch {
      return {
        dueToday: true,
        dueTomorrow: true,
        overdue: true,
        completed: true,
        assigned: true,
        projectUpdates: true
      };
    }
  }

  savePreferences(preferences: NotificationPreferencs): void {
    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
  }
}
