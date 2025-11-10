import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../../../services/dashboard-service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-project-completion-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-completion-chart.component.html',
  styleUrl: './project-completion-chart.component.scss',
})
export class ProjectCompletionChartComponent {
  chartData: any = null;
  projectCompletionData: any = {};
  projectCompletionPercentage: number = 0;
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
    this.dashboardService.projects$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
      });
  }

  private loadData(): void {
    this.loading = true;
    
    this.projectCompletionData = this.dashboardService.getProjectCompletionData();
    this.projectCompletionPercentage =
      this.dashboardService.getProjectCompletionPercentage();
    this.loading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}