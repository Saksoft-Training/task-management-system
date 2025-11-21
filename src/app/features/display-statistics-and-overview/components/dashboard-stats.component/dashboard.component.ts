import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Statistics } from '../../../../../types/models/statistics';
import { DashboardService } from '../../services/dashboard-service';
import { StatisticsCardComponent } from '../statistics-card.component/statistics-card.component';
import { CommonModule } from '@angular/common';
import { ActivityFeedComponent } from '../../../dashboard/components/activity-feed.component/activity-feed.component';
import { ChartComponent } from '../../../dashboard/components/chart.component/chart.component';
import { DashboardChartsComponent } from '../../../dashboard/components/dashboard-charts.component/dashboard-charts.component';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [StatisticsCardComponent, CommonModule,ActivityFeedComponent,ChartComponent,DashboardChartsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponentStats {
  stats$!: Observable<Statistics>;
  loading = true;

  constructor(private dashboardService: DashboardService) {
    this.stats$ = this.dashboardService.getStatistics();

    this.stats$.subscribe(() => {
      this.loading = false;
    });
  }

  refresh() {
    this.dashboardService.refresh();
  }
}
