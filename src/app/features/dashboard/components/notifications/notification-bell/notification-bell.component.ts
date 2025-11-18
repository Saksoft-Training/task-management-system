import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule,],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent {
  @Input() public unreadCount = 0;
  @Output() public bellClick = new EventEmitter<void>();

  public onClick(): void {
    this.bellClick.emit();
  }
}
