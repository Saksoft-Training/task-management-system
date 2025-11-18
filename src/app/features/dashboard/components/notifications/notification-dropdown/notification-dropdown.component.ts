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
  @Input() notifications: AppNotification[] = [];
  @Output() navigate = new EventEmitter<AppNotification>();
  @Output() markAsRead = new EventEmitter<string>();
  @Output() dismiss = new EventEmitter<string>();
  @Output() markAllRead = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();

     public handleMarkAsRead(notification: AppNotification): void {
    this.markAsRead.emit(notification.id);
  }

  public handleMarkAllRead(): void {
    this.markAllRead.emit();
  }

  public handleDismiss(notification: AppNotification): void {
    this.dismiss.emit(notification.id);
  }

  public handleClearAll(): void {
    this.clearAll.emit();
  }

  public handleNavigate(notification: AppNotification): void {
    this.navigate.emit(notification);
  }
}
