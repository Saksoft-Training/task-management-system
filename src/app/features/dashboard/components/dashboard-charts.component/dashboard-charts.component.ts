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

  loading = true;

  // Initialize as observables properly
  pieData$!: Observable<ChartConfiguration['data']>;
  trendData$!: Observable<ChartConfiguration['data']>;
  priorityData$!: Observable<ChartConfiguration['data']>;
  overdue$!: Observable<OverdueInfo>;

  pieOptions: ChartConfiguration['options'] = {};
  trendOptions: ChartConfiguration['options'] = {};
  priorityOptions: ChartConfiguration['options'] = {};

  constructor(private ds: chartsDashboardService) { }

  ngOnInit(): void {

    // Assign all chart/overdue streams here
    this.pieData$ = this.ds.taskCompletionChartData$;
    this.trendData$ = this.ds.taskTrendChartData$;
    this.priorityData$ = this.ds.priorityChartData$;
    this.overdue$ = this.ds.overdueTasks$;

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

  refresh() {
    this.loading = true;
    this.ds.refresh();

    setTimeout(() => this.loading = false, 350);
  }
}
