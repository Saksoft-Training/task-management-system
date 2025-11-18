import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppNotification } from '../../../../../../types/models/notifications';
import { Subscription, timer } from 'rxjs';
import { NotificationService } from '../../../services/notification-service';

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

  public ngOnInit(): void {
    this.sub = this.notificationService.toast$.subscribe(n => {
      this.current = n;
      this.hideSub?.unsubscribe();
      this.hideSub = timer(4000).subscribe(() => (this.current = null));
    });
  }

  public ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.hideSub?.unsubscribe();
  }

public  close():void {
    this.current = null;
  }

 public get severityClass():string {
    return this.current ? `toast-${this.current.severity}` : '';
  }
}
