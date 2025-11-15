import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Statistics } from '../../../../../types/models/statistics';
import { DashboardService } from '../../services/dashboard-service';
import { StatisticsCardComponent } from '../statistics-card.component/statistics-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [StatisticsCardComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  stats$: Observable<Statistics>;
  loading = true;
  constructor(private dashboardService: DashboardService) {
    this.stats$ = this.dashboardService.getStatistics();
    // turn off loading after first emission
    this.stats$.subscribe(() => (this.loading = false));
  }
  // optional helper to force refresh after making changes
  refresh() {
    this.dashboardService.refresh();
  }

}
