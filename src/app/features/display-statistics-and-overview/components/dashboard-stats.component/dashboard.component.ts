import { Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Statistics } from '../../../../../types/models/statistics';
import { DashboardService } from '../../services/dashboard-service';
import { StatisticsCardComponent } from '../statistics-card.component/statistics-card.component';
import { CommonModule } from '@angular/common';
import { DashboardChartsComponent } from '../../../dashboard/components/dashboard-charts.component/dashboard-charts.component';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [StatisticsCardComponent, CommonModule, DashboardChartsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponentStats {
  // #region Public Properties
  public stats$!: Observable<Statistics>;
  /** Controls visibility of loading spinner. */
  public loading = true;

  // #endregion

  // #region Constructor

  /**
   * Creates an instance of DashboardComponentStats.
   * @summary Subscribes to statistics stream and handles loading state.
   * @param dashboardService - Service providing dashboard statistics data.
   */
  constructor(private dashboardService: DashboardService) {
    this.stats$ = this.dashboardService.getStatistics();

    this.stats$.subscribe(() => {
      this.loading = false;
    });
  }

  // #endregion

  // #region Public Methods

  /**
   * Refreshes dashboard statistics.
   * @summary Calls backend refresh and reloads statistics data.
   * @returns void
   */
  public refresh() {
    this.dashboardService.refresh();
  }
  // #endregion
}