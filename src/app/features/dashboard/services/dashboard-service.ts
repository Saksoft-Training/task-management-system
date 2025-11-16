import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Activity } from '../../../../types/models/activity/activity.model';
import { ChartConfiguration } from 'chart.js';
import { Task, TaskPriority, TaskStatus } from '../../../../types/models/task';


export interface OverdueInfo {
  count: number;
  tasks: Task[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly TASKS_KEY = 'tasks';
  private readonly ACTIVITIES_KEY = 'activities';

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);

  tasks$ = this.tasksSubject.asObservable();
  activities$ = this.activitiesSubject.asObservable();

  // ---- Chart Observables ----

  taskCompletionChartData$: Observable<ChartConfiguration['data']> = this.tasks$.pipe(
    map(tasks => {
      const statusCount = tasks.reduce(
        (acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        },
        {} as Record<TaskStatus, number>
      );

      const labels = ['Completed', 'In Progress', 'To Do'];
      const data = labels.map(label => statusCount[label as TaskStatus] || 0);

      return {
        labels,
        datasets: [
          {
            label: 'Tasks',
            data,
            backgroundColor: ['#10B981', '#0e09faff', '#9e9e9e']
          }
        ]
      };
    })
  );

  taskTrendChartData$: Observable<ChartConfiguration['data']> = this.tasks$.pipe(
    map(tasks => {
      const days = 14;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Map date (YYYY-MM-DD) -> count
      const dateMap = new Map<string, number>();

      tasks
        .filter(t => t.status === 'Completed' && t.completedAt)
        .forEach(t => {
          const completedDate = new Date(t.completedAt as string);
          completedDate.setHours(0, 0, 0, 0);
          const key = completedDate.toISOString().substring(0, 10);
          dateMap.set(key, (dateMap.get(key) || 0) + 1);
        });

      const labels: string[] = [];
      const counts: number[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().substring(0, 10);
        labels.push(key); // we'll format in chart options if needed
        counts.push(dateMap.get(key) || 0);
      }

      return {
        labels,
        datasets: [
          {
            label: 'Completed Tasks',
            data: counts,
            fill: false,
            tension: 0.3,
            borderColor: '#4caf50'
          }
        ]
      };
    })
  );

  priorityChartData$: Observable<ChartConfiguration['data']> = this.tasks$.pipe(
    map(tasks => {
      const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
      const counts = priorities.map(p => tasks.filter(t => t.priority === p).length);

      return {
        labels: priorities,
        datasets: [
          {
            label: 'Tasks by Priority',
            data: counts,
            backgroundColor: ['#8bc34a', '#ffca28', '#ff5722', '#d32f2f']
          }
        ]
      };
    })
  );

  overdueTasks$: Observable<OverdueInfo> = this.tasks$.pipe(
    map(tasks => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = tasks
        .filter(t => {
          if (!t.dueDate || t.status === 'Completed') return false;
          const due = new Date(t.dueDate);
          due.setHours(0, 0, 0, 0);
          return due < today;
        })
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

      return { count: overdue.length, tasks: overdue };
    })
  );

  recentActivities$: Observable<Activity[]> = this.activities$.pipe(
    map(list =>
      [...list]
        .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
        .slice(0, 15)
    )
  );

  constructor() {
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage(): void {
    const tasks = this.readLocal<Task[]>(this.TASKS_KEY) || [];
    const activities = this.readLocal<Activity[]>(this.ACTIVITIES_KEY) || [];
    this.tasksSubject.next(tasks);
    this.activitiesSubject.next(activities);
  }

  refresh(): void {
    this.loadFromLocalStorage();
  }

  private readLocal<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
}