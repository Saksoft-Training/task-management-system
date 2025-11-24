import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule,],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent {
  //#region Inputs & Outputs

  /**
   * @description Total number of unread notifications displayed on the bell badge
   * @default 0
   * @required
   */
  @Input() public unreadCount = 0;
  /**
 * @description Emits event when the bell icon is clicked (no payload required)
 * @event
 */
  @Output() public bellClick = new EventEmitter<void>();

  //#endregion

  //#region Public Methods
  /**
  * @description Handles bell icon click and emits bellClick event
  * @returns void
  */
  public onClick(): void {
    this.bellClick.emit();
  }
  //#endregion
}