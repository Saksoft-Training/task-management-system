import { Injectable } from '@angular/core';
import { NotificationService } from './notification';
export interface Task {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  assignedTo: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationGeneratorService {
   private checkInterval?: any;

  constructor(private notificationService: NotificationService) {}

  startNotificationChecks(): void {
    // Check immediately on init
    this.checkForDueDateNotifications();
    
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkForDueDateNotifications();
    }, 60000);
  }

  stopNotificationChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  checkForDueDateNotifications(tasks: Task[] = []): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    tasks.forEach(task => {
      if (task.completed) return;

      const dueDate = new Date(task.dueDate);
      const taskDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      if (taskDueDate.getTime() === today.getTime()) {
        this.notificationService.addNotification({
          type: 'due-today',
          severity: 'warning',
          message: `"${task.title}" is due today`,
          taskId: task.id,
          taskName: task.title
        });
      } else if (taskDueDate.getTime() === tomorrow.getTime()) {
        this.notificationService.addNotification({
          type: 'due-tomorrow',
          severity: 'info',
          message: `"${task.title}" is due tomorrow`,
          taskId: task.id,
          taskName: task.title
        });
      } else if (taskDueDate.getTime() < today.getTime()) {
        this.notificationService.addNotification({
          type: 'overdue',
          severity: 'critical',
          message: `"${task.title}" is overdue`,
          taskId: task.id,
          taskName: task.title
        });
      }
    });
  }

  onTaskCompleted(task: Task): void {
    this.notificationService.addNotification({
      type: 'completed',
      severity: 'success',
      message: `Task "${task.title}" completed`,
      taskId: task.id,
      taskName: task.title
    });
  }

  onTaskAssigned(task: Task): void {
    this.notificationService.addNotification({
      type: 'assigned',
      severity: 'info',
      message: `New task assigned: "${task.title}"`,
      taskId: task.id,
      taskName: task.title
    });
  }

  onProjectStatusChanged(project: Project, oldStatus: string): void {
    this.notificationService.addNotification({
      type: 'project-status',
      severity: 'info',
      message: `Project "${project.name}" status changed from ${oldStatus} to ${project.status}`,
      projectId: project.id,
      projectName: project.name
    });
  }

  onDueDateChanged(task: Task, oldDueDate: Date): void {
    this.notificationService.addNotification({
      type: 'due-today',
      severity: 'info',
      message: `Due date for "${task.title}" has been updated`,
      taskId: task.id,
      taskName: task.title
    });
  }
}
