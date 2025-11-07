import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Notification } from '../../../../contracts/Notifications';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-notification-component',
  imports: [CommonModule],
  templateUrl: './notification-component.html',
  styleUrl: './notification-component.scss',
})
export class NotificationComponent {
 @Input() notifications: Notification[] = [];
  @Input() unreadCount: number = 0;
  @Input() isOpen: boolean = false;
  @Input() position: 'right' | 'left' = 'right';
  
  @Output() markAsRead = new EventEmitter<number>();
  @Output() markAllAsRead = new EventEmitter<void>();
  @Output() removeNotification = new EventEmitter<number>();
  @Output() clearAll = new EventEmitter<void>();
  @Output() navigateToItem = new EventEmitter<Notification>();
  @Output() closed = new EventEmitter<void>();

   @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.isOpen) return;
    
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.notification-panel') || 
                         target.closest('[data-notification-trigger]');
    
    if (!clickedInside) {
      this.close();
    }
  }

   @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  onMarkAsRead(notificationId: number, event?: Event): void {
    event?.stopPropagation();
    this.markAsRead.emit(notificationId);
  }

  onRemoveNotification(notificationId: number, event: Event): void {
    event.stopPropagation();
    this.removeNotification.emit(notificationId);
  }

  onMarkAllAsRead(): void {
    this.markAllAsRead.emit();
  }

  onClearAll(): void {
    this.clearAll.emit();
  }

  onNavigateToItem(notification: Notification): void {
    this.navigateToItem.emit(notification);
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  getIcon(notification: Notification): string {
    const iconMap: Record<Notification['type'], string> = {
      'due_today': '⏰',
      'due_tomorrow': '📅',
      'overdue': '🚨',
      'completed': '✅',
      'assigned': '👤',
      'project_updated': '📁'
    };
    return iconMap[notification.type];
  }

  getSeverityColor(notification: Notification): string {
    const colorMap: Record<Notification['severity'], string> = {
      'critical': 'critical',
      'warning': 'warning',
      'sucess': 'success',
      'info': 'info'
    };
    return colorMap[notification.severity];
  }

  getSeverityText(notification: Notification): string {
    const textMap: Record<Notification['severity'], string> = {
      'critical': 'Critical',
      'warning': 'Warning',
      'sucess': 'Success',
      'info': 'Information'
    };
    return textMap[notification.severity];
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  }

  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }

}
