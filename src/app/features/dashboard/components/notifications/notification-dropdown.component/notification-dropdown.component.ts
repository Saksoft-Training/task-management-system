import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppNotification } from '../../../../../../types/models/notifications';
import { NotificationItemComponent } from '../notification-item.component/notification-item.component';

@Component({
  selector: 'app-notification-dropdown.component',
  imports: [NotificationItemComponent],
  templateUrl: './notification-dropdown.component.html',
  styleUrl: './notification-dropdown.component.scss',
})
export class NotificationDropdownComponent {
 @Input() notifications: AppNotification[] = [];

  @Output() navigate = new EventEmitter<AppNotification>();
  @Output() markAsRead = new EventEmitter<string>();
  @Output() dismiss = new EventEmitter<string>();
  @Output() markAllRead = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();
}
