import { Component } from '@angular/core';
import { NotificationService ,Notification} from '../../../services/notification';
import { NotificationItemComponent } from "../notification-item-component/notification-item-component";

@Component({
  selector: 'app-dashboard-notifications-component',
  imports: [NotificationItemComponent],
  templateUrl: './dashboard-notifications-component.html',
  styleUrl: './dashboard-notifications-component.scss',
})
export class DashboardNotificationsComponent {
recentNotifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {
    this.notificationService.notifications$.subscribe(notifications => {
      this.recentNotifications = notifications.slice(0, 5); // Show 5 most recent
    });
  }

  get criticalCount(): number {
    return this.recentNotifications.filter(n => 
      !n.read && n.severity === 'critical'
    ).length;
  }

  get warningCount(): number {
    return this.recentNotifications.filter(n => 
      !n.read && n.severity === 'warning'
    ).length;
  }
}
