import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NotificationItemComponent } from "../notification-item.component/notification-item.component";
import { NotificationService } from "../../../services/notification-service";
import { AppNotification } from "../../../../../../types/models/notifications";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { ToastNotificationComponent } from "../toast-notification.component/toast-notification.component";

@Component({
  selector: 'app-dashboard-notifications-component',
  standalone: true,
  imports: [CommonModule,NotificationItemComponent,ToastNotificationComponent],
  templateUrl: './dashboard-notifications.component.html',
  styleUrl: './dashboard-notifications.component.scss',
})
export class DashboardNotificationsComponent {

   @Input() notifications: AppNotification[] | null = [];
  @Output() markAsRead = new EventEmitter<string>();

  onMarkAsRead(notificationId: string) {
    this.markAsRead.emit(notificationId);
  }
}
