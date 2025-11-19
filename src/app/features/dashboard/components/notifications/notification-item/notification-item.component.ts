import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AppNotification } from "../../../../../../types/models/notifications";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-notification-item-component',
  imports: [CommonModule],
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.scss',
})
export class NotificationItemComponent {
  //#region Inputs

  /**
   * @description Single notification item to be displayed in the dropdown list
   * @required
   */
  @Input() notification!: AppNotification;

  //#endregion

  //#region Outputs

  /**
   * @description Emits event when user clicks on notification entry to navigate
   * @event
   */
  @Output() navigate = new EventEmitter<AppNotification>();

  /**
   * @description Emits event when user marks specific notification as read
   * @event
   */
  @Output() markRead = new EventEmitter<AppNotification>();

  /**
   * @description Emits event when user dismisses/removes the notification
   * @event
   */
  @Output() dismiss = new EventEmitter<AppNotification>();

  //#endregion

  //#region Public Methods

  /**
   * @description Triggers navigation handler for selected notification
   * @returns void
   */
  public onNavigate(): void {
    this.navigate.emit(this.notification);
  }

  /**
   * @description Marks a notification as read (stops event bubbling to avoid unintentional navigation)
   * @param event MouseEvent - Click event reference
   * @returns void
   */
  public onMarkRead(event: MouseEvent): void {
    event.stopPropagation();
    this.markRead.emit(this.notification);
  }

  /**
   * @description Dismisses a notification entry without triggering navigation
   * @param event MouseEvent - Click event reference
   * @returns void
   */
  public onDismiss(event: MouseEvent): void {
    event.stopPropagation();
    this.dismiss.emit(this.notification);
  }
  //#endregion
  //#region Getters
  /**
   * @description Computes CSS class name based on notification severity for styling
   * @readonly
   * @returns string - Severity class name (e.g., severity-info, severity-warning)
   */
  public get severityClass(): string {
    return `severity-${this.notification.severity}`;
  }
  //#endregion
}
