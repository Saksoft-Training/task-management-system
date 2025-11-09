import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../../../services/dashboard-service';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../chart.component/chart.component';

@Component({
  selector: 'app-priority-distribution-chart',
  imports: [CommonModule, ChartComponent],
  templateUrl: './priority-distribution-chart.component.html',
  styleUrl: './priority-distribution-chart.component.scss',
})
export class PriorityDistributionChartComponent implements OnInit, OnDestroy {
 chartData: any = null;
  priorityData: any = {};
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
    this.chartData = this.dashboardService.getPriorityDistributionChart();
    this.priorityData = this.dashboardService.getPriorityDistributionData();
    this.loading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
