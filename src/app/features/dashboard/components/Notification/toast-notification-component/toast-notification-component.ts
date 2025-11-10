import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService,Notification } from '../../../services/notification';
interface ToastNotification extends Notification {
  visible: boolean;
}
@Component({
  selector: 'app-toast-notification-component',
  imports: [CommonModule],
  templateUrl: './toast-notification-component.html',
  styleUrl: './toast-notification-component.scss',
})
export class ToastNotificationComponent {
 toasts: ToastNotification[] = [];
  private subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        const newNotifications = notifications
          .filter(n => !n.read && !this.toasts.find(t => t.id === n.id))
          .slice(0, 3); // Show max 3 toasts

        newNotifications.forEach(notification => {
          const toast: ToastNotification = {
            ...notification,
            visible: true
          };
          this.toasts.unshift(toast);
          this.autoDismiss(toast);
        });
      })
    );
  }

  dismissToast(toast: ToastNotification): void {
    toast.visible = false;
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== toast.id);
    }, 300);
  }

  private autoDismiss(toast: ToastNotification): void {
    setTimeout(() => {
      this.dismissToast(toast);
    }, 5000); // Auto dismiss after 5 seconds
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
