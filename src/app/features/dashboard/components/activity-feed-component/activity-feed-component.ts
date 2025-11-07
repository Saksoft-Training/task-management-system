import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Activity } from '../../services/dashboard-service';

@Component({
  selector: 'app-activity-feed-component',
  imports: [],
  templateUrl: './activity-feed-component.html',
  styleUrl: './activity-feed-component.scss',
})
export class ActivityFeedComponent {
 @Input() activities: Activity[] = [];
  @Input() maxItems: number = 10;
  @Input() title: string = 'Recent Activity';
  @Input() showViewAll: boolean = false;
  
  @Output() activityClick = new EventEmitter<Activity>();
  @Output() viewAllClick = new EventEmitter<void>();

  get displayedActivities(): Activity[] {
    return this.activities.slice(0, this.maxItems);
  }

  onActivityClick(activity: Activity): void {
    this.activityClick.emit(activity);
  }

  onViewAllClick(): void {
    this.viewAllClick.emit();
  }

  getActionIcon(action: Activity['action']): string {
    const icons = {
      'created': '➕',
      'updated': '✏️',
      'deleted': '🗑️',
      'completed': '✅',
      'assigned': '👤'
    };
    return icons[action];
  }

  getActionColor(action: Activity['action']): string {
    const colors = {
      'created': 'var(--success)',
      'updated': 'var(--warning)',
      'deleted': 'var(--danger)',
      'completed': 'var(--success)',
      'assigned': 'var(--info)'
    };
    return colors[action];
  }

  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return activityTime.toLocaleDateString();
  }
}
