import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { Statistics } from '../../../../types/models/statistics';
import { Project } from '../../../../types/models/project';
import { Task } from '../../../../types/models/task';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private storageKeyProjects = 'projects';
  private storageKeyTasks = 'tasks';


  // BehaviorSubject keeps the latest statistics and emits immediately for new subscribers
  private stats$ = new BehaviorSubject<Statistics>(this.computeStatistics());


  constructor() {
    // Listen for cross-tab storage changes
    fromEvent<StorageEvent>(window, 'storage').subscribe(() => this.refresh());
  }


  // Public Observable as requested
  getStatistics(): Observable<Statistics> {
    return this.stats$.asObservable();
  }


  // Call this when app mutates projects/tasks in the same tab
  refresh(): void {
    const stats = this.computeStatistics();
    this.stats$.next(stats);
  }


  // Convenience: helper to set seed data (useful in dev / tests)
  seedData(projects: Project[], tasks: Task[]) {
    localStorage.setItem(this.storageKeyProjects, JSON.stringify(projects));
    localStorage.setItem(this.storageKeyTasks, JSON.stringify(tasks));
    this.refresh();
  }


  private readProjects(): Project[] {
    try {
      const raw = localStorage.getItem(this.storageKeyProjects);
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


    const overallCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);


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
