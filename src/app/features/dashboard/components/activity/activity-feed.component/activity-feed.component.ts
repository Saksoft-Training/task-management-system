import { Component } from '@angular/core';
import { Activity } from '../../../../../contracts/activity.interface';
import { Subject, takeUntil } from 'rxjs';
import { ActivityService } from '../../../services/activity.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-feed',
  imports: [CommonModule],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
})
export class ActivityFeedComponent {
activities: Activity[] = [];
  private destroy$ = new Subject<void>();

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.loadActivities();
    this.activityService.activities$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadActivities();
      });
  }

  private loadActivities(): void {
    this.activityService.getActivities(15).subscribe(activities => {
      this.activities = activities;
    });
  }

  formatTime(date: Date | string): string {
    const now = new Date();
    const actDate = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - actDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return actDate.toLocaleDateString();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
