import { Component } from '@angular/core';
import { DashboardService, OverdueTask } from '../../../services/dashboard-service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overdue-tasks-alert',
  imports: [CommonModule],
  templateUrl: './overdue-tasks-alert.component.html',
  styleUrl: './overdue-tasks-alert.component.scss',
})
export class OverdueTasksAlertComponent {
 overdueTasks: OverdueTask[] = [];
  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadOverdueTasks();
    this.dashboardService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadOverdueTasks();
      });
  }

  private loadOverdueTasks(): void {
    this.overdueTasks = this.dashboardService.getOverdueTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
