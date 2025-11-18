import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { NotificationItemComponent } from "../notification-item.component/notification-item.component";
import { NotificationService } from "../../../services/notification-service";
import { AppNotification } from "../../../../../../types/models/notifications";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { ToastNotificationComponent } from "../toast-notification.component/toast-notification.component";

@Component({
  selector: 'app-dashboard-notifications-component',
  imports: [CommonModule,NotificationItemComponent,ToastNotificationComponent],
  templateUrl: './dashboard-notifications.component.html',
  styleUrl: './dashboard-notifications.component.scss',
})
export class DashboardNotificationsComponent {
notifications$!: Observable<AppNotification[]>;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}
   ngOnInit(): void {
    this.notifications$ = this.notificationService.notifications$;
  }

  onNavigate(n: AppNotification) {
    if (n.route) {
      this.notificationService.markAsRead(n.id);
      this.router.navigateByUrl(n.route);
    }
  }
}
