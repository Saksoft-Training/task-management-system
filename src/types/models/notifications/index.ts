export type NotificationKind =
  | 'task-due-today'
  | 'task-due-tomorrow'
  | 'task-overdue'
  | 'task-completed'
  | 'project-status-changed'
  | 'task-assigned';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;  
  isRead: boolean;
  taskId?: number;
  projectId?: number;
  route?: string; 
}