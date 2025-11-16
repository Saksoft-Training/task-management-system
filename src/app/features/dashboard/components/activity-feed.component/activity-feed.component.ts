import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity } from '../../../../../types/models/activity/activity.model';
import { ActivityService } from '../../services/activity-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard-service';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
})
export class ActivityFeedComponent {
 activities$!: Observable<Activity[]>;

  constructor(private ds: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.activities$ = this.ds.recentActivities$;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  }

  onActivityClick(activity: Activity): void {
    // Adjust according to your real routes
    if (activity.type === 'project') {
      this.router.navigate(['/projects', activity.itemId]);
    } else {
      this.router.navigate(['/tasks', activity.itemId]);
    }
  }

  formatAction(a: Activity): string {
    const entity = a.type === 'project' ? 'Project' : 'Task';
    const action = a.action.charAt(0).toUpperCase() + a.action.slice(1);
    return `${entity} ${action}`;
  }
}
