import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityService } from '../../services/activity-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Activity } from '../../../../../types/activity/activity.model';
import { chartsDashboardService } from '../../services/charts-dashboard-service';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
})
export class ActivityFeedComponent {

  // #region Properties

  /**
   * Observable stream of recent activities displayed in the feed.
   */
  public activities$!: Observable<Activity[]>;

  // #endregion

  // #region Constructor

  /**
   * Creates an instance of ActivityFeedComponent.
   * @param dashboardService - Service providing recent activity stream.
   * @param router - Router instance to navigate between pages.
   */
  constructor(private dashboardService: chartsDashboardService, private router: Router, private activityService: ActivityService) { }

  // #endregion

  // #region Lifecycle Methods

  /**
   * Angular lifecycle hook.
   * @summary Initializes activity stream subscription.
   * @returns void
   */
  public ngOnInit(): void {
    this.activities$ = this.dashboardService.recentActivities$;
  }

  // #endregion

  // #region Utility Methods

  /**
   * Extracts up to two initials from the user's name.
   * @summary Returns first two initials in uppercase.
   * @param name - Full name of the user.
   * @returns A string representing the initials.
   */
  public getInitials(name?: string): string {
    if (!name || name.trim().length === 0) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  }
  /**
    * Handles click event and navigates to the respective detail page.
    * @summary Navigates to project or task based on activity type.
    * @param activity - The clicked activity item.
    * @returns void
    */
  public onActivityClick(activity: Activity): void {
    // Adjust according to your real routes
    if (activity.type === 'project') {
      this.router.navigate(['/projects', activity.itemId]);
    } else {
      this.router.navigate(['/tasks', activity.itemId]);
    }
  }
  /**
    * Formats and returns a readable action description.
    * @summary Converts entity + action into a formatted label.
    * @param activity - Activity object containing type and action.
    * @returns A human-readable formatted action label.
    */
  public formatAction(activity: Activity): string {
    const entity = activity.type === 'project' ? 'Project' : 'Task';
    const action = activity.action.charAt(0).toUpperCase() + activity.action.slice(1);
    return `${entity} ${action}`;
  }
  // #endregion
}
