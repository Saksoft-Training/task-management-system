import { Component } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Statistics } from '../../../../../types/models/statistics';
import { DashboardService } from '../../services/dashboard-service';
import { StatisticsCardComponent } from '../statistics-card.component/statistics-card.component';
import { CommonModule } from '@angular/common';
import { DashboardChartsComponent } from '../../../dashboard/components/dashboard-charts.component/dashboard-charts.component';
import { TaskService } from '../../../task-management/services/task-service';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [StatisticsCardComponent, CommonModule, DashboardChartsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponentStats {
 
  public stats$!: Observable<Statistics>;
  public loading = true;
  public overdueList: any[] = []; 

  private subscription!: Subscription;

  constructor(private dashboardService: DashboardService,private taskService: TaskService) {
    this.stats$ = this.dashboardService.stats$;
    this.overdueList = this.taskService.getOverdueTasks();
    // Subscribe once only to track loading state
    this.subscription = this.stats$.subscribe(() => {
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}