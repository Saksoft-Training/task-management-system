import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TaskCompletionChartComponent } from '../../chart/task-completion-chart.component/task-completion-chart.component';
import { TaskTrendChartComponent } from '../../activity/task-trend-chart.component/task-trend-chart.component';
import { PriorityDistributionChartComponent } from '../../chart/priority-distribution-chart.component/priority-distribution-chart.component';
import { OverdueTasksAlertComponent } from '../../alerts/overdue-tasks-alert.component/overdue-tasks-alert.component';
import { ProjectCompletionChartComponent } from '../../chart/project-completion-chart.component/project-completion-chart.component';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TaskCompletionChartComponent, ProjectCompletionChartComponent, TaskTrendChartComponent,PriorityDistributionChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit{

  constructor() {}

  ngOnInit(): void {
  }
}
