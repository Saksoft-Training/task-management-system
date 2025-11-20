import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { Statistics } from '../../../../types/models/statistics';
import { Project } from '../../../../types/models/project';
import { Task } from '../../../../types/models/task';
import { AuthService } from '../../user-account-management/services/auth-service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private storageKeyTasks = 'tasks';

  private stats$ = new BehaviorSubject<Statistics>(this.emptyStats());

  constructor(private authService: AuthService) {
    // Compute once the user loads
    setTimeout(() => {
      this.refresh();
    }, 150);

    fromEvent<StorageEvent>(window, 'storage').subscribe(() => this.refresh());
  }

  private emptyStats(): Statistics {
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0,
      overallCompletionRate: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  private getStorageKeyProjects(): string {
    const email = this.authService.getCurrentUser()?.email || '';
    return `projects_${email}`;
  }

  getStatistics(): Observable<Statistics> {
    return this.stats$.asObservable();
  }

  refresh(): void {
    const stats = this.computeStatistics();
    this.stats$.next(stats);
  }

  private readProjects(): Project[] {
    try {
      const raw = localStorage.getItem(this.getStorageKeyProjects());
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private readTasks(): Task[] {
    try {
      const raw = localStorage.getItem(this.storageKeyTasks);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private computeStatistics(): Statistics {
    const projects = this.readProjects();
    const tasks = this.readTasks();
    const now = new Date();

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due < now && t.status !== 'Completed';
    }).length;

    const overallCompletionRate =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      overallCompletionRate,
      updatedAt: new Date().toISOString(),
    };
  }
}
