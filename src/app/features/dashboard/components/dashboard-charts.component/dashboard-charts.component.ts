import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartComponent } from '../chart.component/chart.component';
import { ActivityFeedComponent } from '../activity-feed.component/activity-feed.component';
import { ChartConfiguration, TooltipItem } from 'chart.js';
import { combineLatest, Observable } from 'rxjs';
import { chartsDashboardService } from '../../services/charts-dashboard-service';
import { OverdueInfo } from '../../../../../types/activity/overdueInfo';


@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule, ChartComponent, ActivityFeedComponent],
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.scss']
})
export class DashboardChartsComponent implements OnInit {

  // #region Public Properties

  /** Controls display of loading spinner. */
  public loading = true;

  /** Pie chart data observable. */
  public pieData$!: Observable<ChartConfiguration['data']>;
  /** Task trend chart data observable. */
  public trendData$!: Observable<ChartConfiguration['data']>;

  /** Priority chart data observable. */
  public priorityData$!: Observable<ChartConfiguration['data']>;
  /** Overdue task information observable. */
  public overdue$!: Observable<OverdueInfo>;
  /** Pie chart options configuration. */
  public pieOptions: ChartConfiguration['options'] = {};
  /** Trend chart options configuration. */
  public trendOptions: ChartConfiguration['options'] = {};
  /** Priority chart options configuration. */
  public priorityOptions: ChartConfiguration['options'] = {};

  // #endregion

  // #region Constructor

  /**
   * Creates an instance of DashboardChartsComponent.
   * @param ds - Service providing dashboard chart and activity data.
   */
  constructor(private dashboardservice: chartsDashboardService) { }
  // #endregion

  // #region Lifecycle Methods

  /**
   * Angular lifecycle method.
   * @summary Initializes all dashboard chart streams and configures options.
   * @returns void
   */
  public ngOnInit(): void {
    // Assign all chart/overdue streams here
    this.pieData$ = this.dashboardservice.taskCompletionChartData$;
    this.trendData$ = this.dashboardservice.taskTrendChartData$;
    this.priorityData$ = this.dashboardservice.priorityChartData$;
    this.overdue$ = this.dashboardservice.overdueTasks$;

    // Wait until all observables emit before removing loading spinner
    combineLatest([this.pieData$, this.trendData$, this.priorityData$, this.overdue$])
      .subscribe(([pie, trend, priority, overdue]) => {
        this.loading = false;
      });

    // Chart options
    this.pieOptions = {
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (c: TooltipItem<any>) => {
              const raw = Number(c.raw || 0);
              const dataset = (c.dataset?.data || []) as number[];
              const total = dataset.reduce((a, b) => a + b, 0) || 1;
              const percent = ((raw / total) * 100).toFixed(1);
              return `${c.label}: ${raw} (${percent}%)`;
            }
          }
        }
      }
    };

    this.trendOptions = {
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { beginAtZero: true, title: { display: true, text: 'Completed Tasks' } }
      },
      plugins: { legend: { display: false } }
    };

    this.priorityOptions = {
      scales: {
        x: { title: { display: true, text: 'Priority' } },
        y: { beginAtZero: true, title: { display: true, text: 'Count' } }
      },
      plugins: { legend: { display: false } }
    };
  }
  // #endregion

  // #region Actions

  /**
   * Refreshes all dashboard data.
   * @summary Calls backend refresh and re-enables loading spinner.
   * @returns void
   */
  public refresh(): void {
    this.loading = true;
    this.dashboardservice.refresh();

    setTimeout(() => this.loading = false, 350);
  }
  // #endregion
}
