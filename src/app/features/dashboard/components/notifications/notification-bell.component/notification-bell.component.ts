import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent {
  @Input() unreadCount = 0;
  @Output() bellClick = new EventEmitter<void>();

  onClick() {
    this.bellClick.emit();
  }
}
