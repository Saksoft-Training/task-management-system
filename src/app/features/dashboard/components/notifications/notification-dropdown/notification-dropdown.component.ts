import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppNotification } from '../../../../../../types/models/notifications';
import { NotificationItemComponent } from '../notification-item/notification-item.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-dropdown',
  imports: [CommonModule, NotificationItemComponent],
  templateUrl: './notification-dropdown.component.html',
  styleUrl: './notification-dropdown.component.scss',
})
export class NotificationDropdownComponent {
  //#region Inputs

  /**
   * @description List of notifications displayed inside the dropdown
   * @required
   */
  @Input() notifications: AppNotification[] = [];

  //#endregion

  //#region Outputs

  /**
   * @description Emits when user clicks a notification item and navigation is required
   * @event
   */
  @Output() navigate = new EventEmitter<AppNotification>();
  /**
   * @description Emits the notification ID to mark a specific notification as read
   * @event
   */
  @Output() markAsRead = new EventEmitter<string>();

  /**
   * @description Emits the notification ID to dismiss/remove specific entry
   * @event
   */
  @Output() dismiss = new EventEmitter<string>();
  /**
  * @description Emits when user marks all notifications as read
  * @event
  */
  @Output() markAllRead = new EventEmitter<void>();

  /**
   * @description Emits to clear/delete every notification
   * @event
   */
  @Output() clearAll = new EventEmitter<void>();
  //#endregion

  //#region Public Methods

  /**
   * @description Handles mark-as-read event for single notification
   * @param notification AppNotification - Target notification
   * @returns void
   */
  public handleMarkAsRead(notification: AppNotification): void {
    this.markAsRead.emit(notification.id);
  }
  /**
    * @description Emits markAllRead event to mark every notification as read
    * @returns void
    */
  public handleMarkAllRead(): void {
    this.markAllRead.emit();
  }
  /**
    * @description Handles dismiss event for a single notification
    * @param notification AppNotification - Notification to be dismissed
    * @returns void
    */
  public handleDismiss(notification: AppNotification): void {
    this.dismiss.emit(notification.id);
  }
  /**
    * @description Emits clearAll event to delete all notifications permanently
    * @returns void
    */
  public handleClearAll(): void {
    this.clearAll.emit();
  }
  /**
   * @description Emits selected notification for navigation handling
   * @param notification AppNotification - Selected notification instance
   * @returns void
   */  public handleNavigate(notification: AppNotification): void {
    this.navigate.emit(notification);
  }
  //endregion
}
