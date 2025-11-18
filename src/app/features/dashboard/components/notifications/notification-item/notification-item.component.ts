import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AppNotification } from "../../../../../../types/models/notifications";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-notification-item-component',
  imports: [CommonModule],
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.scss',
})
export class NotificationItemComponent {
 @Input() notification!: AppNotification;

  @Output() navigate = new EventEmitter<AppNotification>();
  @Output() markRead = new EventEmitter<AppNotification>();
  @Output() dismiss = new EventEmitter<AppNotification>();

  public onNavigate():void {
    this.navigate.emit(this.notification);
  }

  public onMarkRead(event: MouseEvent):void {
    event.stopPropagation();
    this.markRead.emit(this.notification);
  }

  public onDismiss(event: MouseEvent):void {
    event.stopPropagation();
    this.dismiss.emit(this.notification);
  }

  public get severityClass():string {
    return `severity-${this.notification.severity}`;
  }
}
