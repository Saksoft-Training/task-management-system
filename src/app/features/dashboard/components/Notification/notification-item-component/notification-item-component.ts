import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Notification } from '../../../services/notification';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-notification-item-component',
  imports: [CommonModule],
  templateUrl: './notification-item-component.html',
  styleUrl: './notification-item-component.scss',
})
export class NotificationItemComponent {
 @Input() notification!: Notification;
  @Output() read = new EventEmitter<Notification>();
  @Output() dismiss = new EventEmitter<Notification>();
  @Output() navigate = new EventEmitter<Notification>();

  get icon(): string {
    const icons = {
      'due-today': '⏰',
      'due-tomorrow': '📅',
      'overdue': '🚨',
      'completed': '✅',
      'project-status': '📊',
      'assigned': '👤'
    };
    return icons[this.notification.type];
  }

  get timeAgo(): string {
    const now = new Date();
    const diff = now.getTime() - this.notification.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  onNavigate(): void {
    this.navigate.emit(this.notification);
  }

  onDismiss(): void {
    this.dismiss.emit(this.notification);
  }

  markAsRead(): void {
    if (!this.notification.read) {
      this.read.emit(this.notification);
    }
  }
}
