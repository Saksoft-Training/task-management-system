import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AppNotification } from "../../../../../../types/models/notifications";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-notification-item-component',
  imports: [CommonModule],
  templateUrl: './notification-item-component.html',
  styleUrl: './notification-item-component.scss',
})
export class NotificationItemComponent {
 @Input() notification!: AppNotification;

  @Output() navigate = new EventEmitter<AppNotification>();
  @Output() markRead = new EventEmitter<AppNotification>();
  @Output() dismiss = new EventEmitter<AppNotification>();

  onNavigate() {
    this.navigate.emit(this.notification);
  }

  onMarkRead(event: MouseEvent) {
    event.stopPropagation();
    this.markRead.emit(this.notification);
  }

  onDismiss(event: MouseEvent) {
    event.stopPropagation();
    this.dismiss.emit(this.notification);
  }

  get severityClass() {
    return `severity-${this.notification.severity}`;
  }
}
