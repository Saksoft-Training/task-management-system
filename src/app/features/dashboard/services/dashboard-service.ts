import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project, Task } from '../../../contracts/task.interface';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    pointRadius?: number;
    pointBackgroundColor?: string | string[];
  }>;
}

export interface TaskCompletionData {
  completed: number;
  inProgress: number;
  todo: number;
  total: number;
}

export interface PriorityData {
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

export interface OverdueTask extends Task {
  daysOverdue: number;
}



@Injectable({
  providedIn: 'root',
})


export class DashboardService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private projectsSubject = new BehaviorSubject<Project[]>([]);

  public tasks$ = this.tasksSubject.asObservable();
  public projects$ = this.projectsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDataFromStorage();
    } else {
      this.initializeSampleData();
    }
  }

  private loadDataFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.initializeSampleData();
      return;
    }

    const tasks = localStorage.getItem('tasks');
    const projects = localStorage.getItem('projects');

    if (tasks) {
      const parsed = JSON.parse(tasks).map((t: any) => ({
        ...t,
        createdDate: new Date(t.createdDate),
        completedDate: t.completedDate ? new Date(t.completedDate) : undefined,
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      }));
      this.tasksSubject.next(parsed);
    } else {
      this.initializeSampleData();
    }

    if (projects) {
      const parsed = JSON.parse(projects).map((p: any) => ({
        ...p,
        createdDate: new Date(p.createdDate),
        updatedDate: new Date(p.updatedDate),
      }));
      this.projectsSubject.next(parsed);
    } else {
      const sampleProjects: Project[] = [
        {
          id: '1',
          name: 'Web Development',
          description: 'Build a responsive website',
          createdDate: new Date('2025-11-01'),
          updatedDate: new Date('2025-11-08'),
        },
        {
          id: '2',
          name: 'Mobile App',
          description: 'Develop iOS and Android apps',
          createdDate: new Date('2025-11-02'),
          updatedDate: new Date('2025-11-08'),
        },
      ];
      this.projectsSubject.next(sampleProjects);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('projects', JSON.stringify(sampleProjects));
      }
    }
  }

  private initializeSampleData(): void {
    const sampleProjects: Project[] = [
      {
        id: '1',
        name: 'Web Development',
        description: 'Build a responsive website',
        createdDate: new Date('2025-11-01'),
        updatedDate: new Date('2025-11-08'),
      },
      {
        id: '2',
        name: 'Mobile App',
        description: 'Develop iOS and Android apps',
        createdDate: new Date('2025-11-02'),
        updatedDate: new Date('2025-11-08'),
      },
    ];
    this.projectsSubject.next(sampleProjects);

    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Design homepage',
        description: 'Create mockups for homepage',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2025-11-05'),
        createdDate: new Date('2025-11-01'),
        completedDate: new Date('2025-11-05'),
        projectId: '1',
      },
      {
        id: '2',
        title: 'Setup database',
        description: 'Configure PostgreSQL database',
        status: 'completed',
        priority: 'urgent',
        dueDate: new Date('2025-11-03'),
        createdDate: new Date('2025-10-30'),
        completedDate: new Date('2025-11-03'),
        projectId: '1',
      },
      {
        id: '3',
        title: 'Create API endpoints',
        description: 'Build REST API for user management',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2025-11-10'),
        createdDate: new Date('2025-11-04'),
        projectId: '1',
      },
      {
        id: '4',
        title: 'Write unit tests',
        description: 'Test database functions',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date('2025-11-12'),
        createdDate: new Date('2025-11-05'),
        projectId: '1',
      },
      {
        id: '5',
        title: 'Fix login bug',
        description: 'Debug authentication issue',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2025-11-09'),
        createdDate: new Date('2025-11-06'),
        projectId: '2',
      },
      {
        id: '6',
        title: 'Update documentation',
        description: 'Add API documentation',
        status: 'todo',
        priority: 'low',
        dueDate: new Date('2025-11-15'),
        createdDate: new Date('2025-11-07'),
        projectId: '1',
      },
      {
        id: '7',
        title: 'Code review',
        description: 'Review pull requests',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date('2025-11-08'),
        createdDate: new Date('2025-11-06'),
        projectId: '2',
      },
    ];

    this.tasksSubject.next(sampleTasks);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tasks', JSON.stringify(sampleTasks));
    }
  }

  addTask(task: Task): void {
    const current = this.tasksSubject.value;
    const updated = [...current, task];
    this.tasksSubject.next(updated);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tasks', JSON.stringify(updated));
    }
  }

  updateTask(task: Task): void {
    const current = this.tasksSubject.value;
    const updated = current.map(t => (t.id === task.id ? task : t));
    this.tasksSubject.next(updated);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tasks', JSON.stringify(updated));
    }
  }

  addProject(project: Project): void {
    const current = this.projectsSubject.value;
    const updated = [...current, project];
    this.projectsSubject.next(updated);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('projects', JSON.stringify(updated));
    }
  }

  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  getProjects(): Project[] {
    return this.projectsSubject.value;
  }

  getTaskCompletionData(): TaskCompletionData {
    const tasks = this.tasksSubject.value;
    return {
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      total: tasks.length,
    };
  }

  getTaskCompletionChart(): ChartData {
    const data = this.getTaskCompletionData();
    const colors = ['#4ade80', '#f59e0b', '#ef4444'];

    return {
      labels: ['Completed', 'In Progress', 'To Do'],
      datasets: [
        {
          label: 'Tasks',
          data: [data.completed, data.inProgress, data.todo],
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    };
  }

  getTaskTrendData(days: number = 14): ChartData {
    const tasks = this.tasksSubject.value;
    const today = new Date();
    const dateMap: { [key: string]: number } = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = 0;
    }

    tasks.forEach(task => {
      if (task.completedDate) {
        const dateStr = task.completedDate
          .toISOString()
          .split('T')[0];
        if (dateStr in dateMap) {
          dateMap[dateStr]++;
        }
      }
    });

    const labels = Object.keys(dateMap)
      .sort()
      .reverse();
    const data = labels.map(label => dateMap[label]);

    return {
      labels,
      datasets: [
        {
          label: 'Tasks Completed',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#3b82f6',
        },
      ],
    };
  }

  getPriorityDistributionData(): PriorityData {
    const tasks = this.tasksSubject.value;
    return {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
    };
  }

  getPriorityDistributionChart(): ChartData {
    const data = this.getPriorityDistributionData();
    const colors = ['#10b981', '#f59e0b', '#f87171', '#dc2626'];

    return {
      labels: ['Low', 'Medium', 'High', 'Urgent'],
      datasets: [
        {
          label: 'Tasks by Priority',
          data: [data.low, data.medium, data.high, data.urgent],
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 1,
        },
      ],
    };
  }

  getOverdueTasks(): OverdueTask[] {
    const tasks = this.tasksSubject.value;
    const now = new Date();

    return tasks
      .filter(
        task =>
          task.dueDate &&
          task.status !== 'completed' &&
          new Date(task.dueDate) < now
      )
      .map(task => ({
        ...task,
        daysOverdue: Math.floor(
          (now.getTime() - new Date(task.dueDate!).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }

  getTaskCompletionPercentage(): number {
    const data = this.getTaskCompletionData();
    if (data.total === 0) return 0;
    return Math.round((data.completed / data.total) * 100);
  }
}
