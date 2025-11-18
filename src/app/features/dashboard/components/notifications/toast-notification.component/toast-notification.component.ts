import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppNotification } from '../../../../../../types/models/notifications';
import { Subscription, timer } from 'rxjs';
import { NotificationService } from '../../../services/notification-service';

interface ToastNotification extends Notification {
  visible: boolean;
}
@Component({
  selector: 'app-toast-notification-component',
   standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.scss',
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
current: AppNotification | null = null;
  private sub?: Subscription;
  private hideSub?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.sub = this.notificationService.toast$.subscribe(n => {
      this.current = n;
      this.hideSub?.unsubscribe();
      this.hideSub = timer(4000).subscribe(() => (this.current = null));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.hideSub?.unsubscribe();
  }

  close() {
    this.current = null;
  }

  get severityClass() {
    return this.current ? `toast-${this.current.severity}` : '';
  }

 
}
