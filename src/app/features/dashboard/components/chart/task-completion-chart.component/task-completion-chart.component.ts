import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../../../services/dashboard-service';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../chart.component/chart.component';

@Component({
  selector: 'app-task-completion-chart',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './task-completion-chart.component.html',
  styleUrl: './task-completion-chart.component.scss',
})
export class TaskCompletionChartComponent {
chartData: any = null;
  completionData: any = {};
  completionPercentage: number = 0;
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadData();
    this.dashboardService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  private loadData(): void {
    this.loading = true;
    this.chartData = this.dashboardService.getTaskCompletionChart();
    this.completionData = this.dashboardService.getTaskCompletionData();
    this.completionPercentage =
      this.dashboardService.getTaskCompletionPercentage();
    this.loading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
