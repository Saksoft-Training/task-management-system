import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Task, TaskPriority, TaskStatus } from '../../../../types/models/task';
import { Activity } from '../../../../types/activity/activity.model';
import { ChartConfiguration } from 'chart.js';
import { OverdueInfo } from '../../../../types/activity/overdueInfo';
import { TaskService } from '../../task-management/services/task-service';
import { ActivityService } from './activity-service';

@Injectable({
  providedIn: 'root'
})
export class chartsDashboardService {

  // #region Properties & Streams
  /** @summary Local storage key for tasks */
  private readonly TASKS_KEY = 'tasks';
  /** @summary Local storage key for activities */
  private readonly ACTIVITIES_KEY = 'activities';
  /** @summary Internal subject storing current tasks */
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  /** @summary Internal subject storing current activities */
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  /** @summary Observable stream of tasks */
  tasks$ = this.tasksSubject.asObservable();
  /** @summary Observable stream of activities */
  activities$ = this.activitiesSubject.asObservable();
  // #endregion Properties & Streams
  // #region Constructor
  /**
   * @summary Initializes the dashboard service and subscribes to data streams.
   * @param taskService Service providing live task data
   * @param activityService Service providing live activity data
   */
  constructor(
    private taskService: TaskService,
    private activityService: ActivityService // your Activity list source
  ) {

    // 🔥 Replace localStorage data with LIVE API data
    this.taskService.tasks$.subscribe(tasks => {
      this.tasksSubject.next(tasks);
    });

    this.activityService.activities$.subscribe(activities => {
      this.activitiesSubject.next(activities);
    });
  }

  // #endregion Constructor
  // #region Task Completion Chart Data
  /**
   * @summary Builds chart data for task completion status.
   * @returns Observable containing Chart.js formatted data.
   */
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
  // #endregion Task Completion Chart Data
  // #region Task Trend Chart Data
  /**
   * @summary Builds chart data showing completed tasks for the past 14 days.
   * @returns Observable containing chart data for a line trend chart.
   */
  taskTrendChartData$: Observable<ChartConfiguration['data']> = this.tasks$.pipe(
    map(tasks => {
      const days = 14;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
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
  // #endregion Task Trend Chart Data
  // #region Priority Chart Data

  /**
   * @summary Builds chart data for tasks grouped by priority.
   * @returns Observable with Chart.js formatted data.
   */
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
  // #endregion Priority Chart Data
  // #region Overdue Tasks
  /**
   * @summary Observable that calculates overdue task info.
   * @returns Observable containing overdue task count and the list.
   */
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
  // #endregion Overdue Tasks
  // #region Recent Activities List
  /**
   * @summary Returns the most recent 15 activities sorted by timestamp.
   * @returns Observable<Activity[]>
   */
  recentActivities$: Observable<Activity[]> = this.activities$.pipe(
    map(list =>
      [...list]
        .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
        .slice(0, 15)
    )
  );
  // #endregion Recent Activities List
  // #region Local Storage Reader
  /**
   * @summary Reads and parses JSON from localStorage.
   * @param key The localStorage key to read.
   * @returns Parsed object or null if invalid.
   */
  private readLocal<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
  // #endregion Local Storage Reader
}