import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, fromEvent, map, Observable, Subscription } from 'rxjs';
import { Statistics } from '../../../../types/models/statistics';
import { Project } from '../../../../types/models/project';
import { Task } from '../../../../types/models/task';
import { AuthService } from '../../user-account-management/services/auth-service';
import { ProjectService } from '../../project-management/services/project.service';
import { TaskService } from '../../task-management/services/task-service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

 
  private statsSubject = new BehaviorSubject<Statistics>(this.emptyStats());
  public readonly stats$ = this.statsSubject.asObservable();

  private subscription!: Subscription;

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService
  ) {
    this.initializeReactivity();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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

  /**
   * Automatically recompute dashboard stats
   * whenever Projects$ OR Tasks$ changes.
   */
  private initializeReactivity(): void {
    this.subscription = combineLatest([
      this.projectService.projects$,
      this.taskService.tasks$
    ])
      .pipe(
        map(([projects, tasks]) => this.computeStats(projects, tasks))
      )
      .subscribe(stats => this.statsSubject.next(stats));
  }

  private computeStats(projects: Project[], tasks: Task[]): Statistics {
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
