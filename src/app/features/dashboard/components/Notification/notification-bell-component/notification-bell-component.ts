import { Component, HostListener, Input } from '@angular/core';
import { NotificationService, Notification } from '../../../services/notification';
import { NotificationItemComponent } from '../notification-item-component/notification-item-component';

@Component({
  selector: 'app-notification-bell-component',
  standalone:true,
  imports: [NotificationItemComponent],
  providers:[NotificationService],
  templateUrl: './notification-bell-component.html',
  styleUrl: './notification-bell-component.scss',
})
export class NotificationBellComponent {
  @Input() notification?: Notification;
isPanelOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(private notificationService: NotificationService) {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  togglePanel(): void {
    this.isPanelOpen = !this.isPanelOpen;
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(String(notification.id));
  }

  dismissNotification(notification: Notification): void {
    this.notificationService.dismissNotification(String(notification.id));
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearAll();
  }

  navigateToItem(notification: Notification): void {
    // Implement navigation logic based on taskId or projectId
    this.markAsRead(notification);
    this.isPanelOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-bell')) {
      this.isPanelOpen = false;
    }
  }
}
