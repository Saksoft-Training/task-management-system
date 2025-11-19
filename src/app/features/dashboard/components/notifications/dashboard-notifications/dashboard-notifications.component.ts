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
  //#region Inputs & Outputs

  /**
   * @description List of notifications to display on the dashboard
   * @required
   */
  @Input() notifications: AppNotification[] | null = [];
  /**
  * @description Emits notification ID when a notification is marked as read
  * @event
  */
  @Output() markAsRead = new EventEmitter<string>();
  //#endregion

  //#region Public Methods

  /**
   * @description Triggered when user clicks to mark a notification as read
   * @param notificationId string - The ID of the notification to update
   * @returns void
   */
  public onMarkAsRead(notificationId: string): void {
    this.markAsRead.emit(notificationId);
  }
  //#endregion
}
