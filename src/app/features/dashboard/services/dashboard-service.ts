import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    label?: string;
    fill?: boolean;
  }[];
}

export interface TrendData {
  date: string;
  completed: number;
  created: number;
}

export interface Activity {
  id: string;
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'assigned';
  itemType: 'project' | 'task' | 'user';
  itemId: string;
  itemName: string;
  userId: string;
  userName: string;
  userInitials: string;
  timestamp: Date;
  details?: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
}


@Injectable({
  providedIn: 'root',
})


export class DashboardService {
   private isBrowser: boolean;
  private statsSubject = new BehaviorSubject<DashboardStats>(this.getInitialStats());
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);

  public stats$ = this.statsSubject.asObservable();
  public activities$ = this.activitiesSubject.asObservable();

   private readonly statusColors = {
    ['done']: '#4CAF50',
    ['in_progress']: '#FFC107',
    ['todo']: '#F44336'
  };

  private readonly priorityColors = {
    ['low']: '#4CAF50',
    ['medium']: '#FFC107',
    ['high']: '#FF9800',
    ['critical']: '#F44336'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadActivities();
  }

  private getInitialStats(): DashboardStats {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      overdueTasks: 0,
      completionRate: 0
    };
  }

   refreshStats(): void {
    if (!this.isBrowser) return;

    try {
      const tasksJson = localStorage.getItem('tasks');
      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const stats: DashboardStats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'done').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        todoTasks: tasks.filter(t => t.status === 'todo').length,
        overdueTasks: tasks.filter(t => {
          if (!t.dueDate || t.status === 'done') return false;
          const dueDate = new Date(t.dueDate);
          return dueDate < today;
        }).length,
        completionRate: tasks.length > 0 ? 
          (tasks.filter(t => t.status ==='done').length / tasks.length) * 100 : 0
      };

      this.statsSubject.next(stats);
    } catch (error) {
      console.error('Error refreshing dashboard stats:', error);
    }
  }

   getTaskCompletionChartData(): ChartData {
    const stats = this.statsSubject.value;
    
    
    return {
      labels: ['Completed', 'In Progress', 'To Do'],
      datasets: [{
        data: [stats.completedTasks, stats.inProgressTasks, stats.todoTasks],
        backgroundColor: [
          this.statusColors['done'],
          this.statusColors['in_progress'],
          this.statusColors['todo']
        ],
  borderColor: ['#fff', '#fff', '#fff']
      }]
    };
  }

  getPriorityDistributionChartData(): ChartData {
    if (!this.isBrowser) {
      return { labels: [], datasets: [] };
    }

    try {
      const tasksJson = localStorage.getItem('tasks');
      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];

      const priorityCounts = {
        ['low']: 0,
        ['medium']: 0,
        ['high']: 0,
        ['critical']: 0
      };

      tasks.forEach(task => {
        priorityCounts[task.priority]++;
      });

      return {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        datasets: [{
          label: 'Tasks by Priority',
          data: [
            priorityCounts['low'],
            priorityCounts['medium'],
            priorityCounts['high'],
            priorityCounts['critical']
          ],
          backgroundColor: [
            this.priorityColors['low'],
            this.priorityColors['medium'],
            this.priorityColors['high'],
            this.priorityColors['critical']
          ],
          borderColor: [
            this.priorityColors['low'],
            this.priorityColors['medium'],
            this.priorityColors['high'],
            this.priorityColors['critical']
          ],
         
        }]
      };
    } catch (error) {
      console.error('Error generating priority distribution data:', error);
      return { labels: [], datasets: [] };
    }
  }

   getCompletionTrendData(): ChartData {
    if (!this.isBrowser) {
      return { labels: [], datasets: [] };
    }

    try {
     
      const labels = this.generateLast14Days();
      const completedData = this.generateTrendData('completed');
      const createdData = this.generateTrendData('created');

      return {
        labels,
        datasets: [
          {
            label: 'Tasks Completed',
            data: completedData,
            borderColor: ['#4CAF50'],
            backgroundColor: ['rgba(76, 175, 80, 0.1)'],
            fill: true,
           
          },
          {
            label: 'Tasks Created',
            data: createdData,
            borderColor: ['#2196F3'],
            backgroundColor: ['rgba(33, 150, 243, 0.1)'],
            fill: true,
            
          }
        ]
      };
    } catch (error) {
      console.error('Error generating trend data:', error);
      return { labels: [], datasets: [] };
    }
  }

   private generateLast14Days(): string[] {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  }

  private generateTrendData(type: 'completed' | 'created'): number[] {
    
    const data = [];
    for (let i = 0; i < 14; i++) {
      if (type === 'completed') {
        data.push(Math.floor(Math.random() * 10) + 5); 
      } else {
        data.push(Math.floor(Math.random() * 8) + 3); 
      }
    }
    return data;
  }

   getOverdueTasks(): Task[] {
    if (!this.isBrowser) return [];

    try {
      const tasksJson = localStorage.getItem('tasks');
      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return tasks
        .filter(task => {
          if (!task.dueDate || task.status === 'done') return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < today;
        })
        .slice(0, 5); 
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      return [];
    }
  }

   private loadActivities(): void {
    if (!this.isBrowser) return;

    try {
      const activitiesJson = localStorage.getItem('activities');
      const activities: Activity[] = activitiesJson ? JSON.parse(activitiesJson) : [];

      
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);

      this.activitiesSubject.next(sortedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }

  addActivity(activity: Omit<Activity, 'id'>): void {
    if (!this.isBrowser) return;

    try {
      const newActivity: Activity = {
        ...activity,
        id: Date.now().toString()
      };

      const currentActivities = this.activitiesSubject.value;
      const updatedActivities = [newActivity, ...currentActivities].slice(0, 15); 
      this.activitiesSubject.next(updatedActivities);


      localStorage.setItem('activities', JSON.stringify(updatedActivities));
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  }

  initializeSampleData(): void {
    if (!this.isBrowser) return;

    try {
      const activities = this.activitiesSubject.value;
      if (activities.length === 0) {
        const sampleActivities: Activity[] = [
          {
            id: '1',
            action: 'created',
            itemType: 'project',
            itemId: '1',
            itemName: 'Website Redesign',
            userId: '1',
            userName: 'John Doe',
            userInitials: 'JD',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), 
            details: 'New project created'
          },
          {
            id: '2',
            action: 'completed',
            itemType: 'task',
            itemId: '1',
            itemName: 'Homepage Layout',
            userId: '2',
            userName: 'Jane Smith',
            userInitials: 'JS',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), 
            details: 'Task marked as completed'
          },
          {
            id: '3',
            action: 'assigned',
            itemType: 'task',
            itemId: '2',
            itemName: 'API Integration',
            userId: '1',
            userName: 'John Doe',
            userInitials: 'JD',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
            details: 'Task assigned to developer'
          }
        ];

        this.activitiesSubject.next(sampleActivities);
        localStorage.setItem('activities', JSON.stringify(sampleActivities));
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
}
