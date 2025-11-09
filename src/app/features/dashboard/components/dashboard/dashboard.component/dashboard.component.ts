import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TaskCompletionChartComponent } from '../../chart/task-completion-chart.component/task-completion-chart.component';
import { TaskTrendChartComponent } from '../../chart/task-trend-chart.component/task-trend-chart.component';
import { PriorityDistributionChartComponent } from '../../chart/priority-distribution-chart.component/priority-distribution-chart.component';
import { OverdueTasksAlertComponent } from '../../alerts/overdue-tasks-alert.component/overdue-tasks-alert.component';
import { ActivityFeedComponent } from '../../activity/activity-feed.component/activity-feed.component';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TaskCompletionChartComponent,TaskTrendChartComponent,PriorityDistributionChartComponent,OverdueTasksAlertComponent,ActivityFeedComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit{

  constructor() {}

  ngOnInit(): void {
  }
}
