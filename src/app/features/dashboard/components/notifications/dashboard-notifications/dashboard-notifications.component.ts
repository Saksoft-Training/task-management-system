import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NotificationItemComponent } from "../notification-item/notification-item.component";
import { NotificationService } from "../../../services/notification-service";
import { AppNotification } from "../../../../../../types/models/notifications";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { ToastNotificationComponent } from "../toast-notification/toast-notification.component";

@Component({
  selector: 'app-dashboard-notifications-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-notifications.component.html',
  styleUrl: './dashboard-notifications.component.scss',
})
export class DashboardNotificationsComponent {

  @Input() notifications: AppNotification[] | null = [];
  @Output() markAsRead = new EventEmitter<string>();

  public onMarkAsRead(notificationId: string): void {
    this.markAsRead.emit(notificationId);
  }
}
