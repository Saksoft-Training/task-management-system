import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Activity, DashboardService, DashboardStats } from '../../services/dashboard-service';
import { Subscription } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chartcomponent } from '../chartcomponent/chartcomponent';
import { ActivityFeedComponent } from '../activity-feed-component/activity-feed-component';

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
@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule,Chartcomponent,ActivityFeedComponent],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent {
 stats: DashboardStats = {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  };
  
  activities: Activity[] = [];
  overdueTasks: Task[] = [];
  loading = true;
  isBrowser: boolean;

  private subscriptions = new Subscription();

  // Chart options
  pieChartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  barChartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  lineChartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    }
  };

  constructor(
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadDashboardData();
      this.setupSubscriptions();
    } else {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Refresh all data
    this.dashboardService.refreshStats();
    this.dashboardService.initializeSampleData();
    this.overdueTasks = this.dashboardService.getOverdueTasks();
    
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.dashboardService.stats$.subscribe(stats => {
        this.stats = stats;
      })
    );

    this.subscriptions.add(
      this.dashboardService.activities$.subscribe(activities => {
        this.activities = activities;
      })
    );
  }

  onActivityClick(activity: Activity): void {
    // Navigate to the item
    console.log('Navigate to:', activity.itemType, activity.itemId);
    // this.router.navigate([`/${activity.itemType}s`, activity.itemId]);
  }

  onViewAllActivities(): void {
    // Navigate to full activities page
    console.log('View all activities');
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  get completionChartData() {
    return this.dashboardService.getTaskCompletionChartData();
  }

  get priorityChartData() {
    return this.dashboardService.getPriorityDistributionChartData();
  }

  get trendChartData() {
    return this.dashboardService.getCompletionTrendData();
  }
}
