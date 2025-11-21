import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
  //#region Inputs

  /**
   * @description Duration (in milliseconds) after which toast will auto-dismiss
   * @default 4000
   * @required
   */
  @Input() autoDismissTimeout = 1000;

  //#endregion

  //#region Public Properties

  /**
   * @description Currently displayed toast notification
   */
  current: AppNotification | null = null;
  //#endregion

  //#region Private Subscriptions

  /**
   * @description Subscription for listening to toast notification stream
   */
  private sub?: Subscription;
  /**
 * @description Subscription for automatically hiding toast after timeout
 */
  private hideSub?: Subscription;
  //#endregion

  //#region Constructor

  /**
   * @description Injects notification service to receive toast events
   * @param notificationService NotificationService - Service used to stream toast notifications
   */
  constructor(private notificationService: NotificationService) { }

  //#endregion

  //#region Lifecycle Methods

  /**
   * @description Initializes component and subscribes to toast notification stream
   * @returns void
   */
  public ngOnInit(): void {
    this.sub = this.notificationService.toastNotification$.subscribe((notification: AppNotification) => {
      this.current = notification;
      this.hideSub?.unsubscribe();
      this.hideSub = timer(this.autoDismissTimeout).subscribe(() => (this.current = null));
    });

  }

  /**
   * @description Cleans up active subscriptions to prevent memory leaks
   * @returns void
   */  public ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.hideSub?.unsubscribe();
  }

  //#endregion

  //#region Public Methods

  /**
   * @description Manually closes and hides the toast notification
   * @returns void
   */  public close(): void {
    this.current = null;
  }

  //#endregion

  //#region Getters

  /**
   * @description Returns CSS class based on notification severity for styling
   * @readonly
   * @returns string - CSS class name to be applied to toast wrapper
   */
  public get severityClass(): string {
    return this.current ? `toast-${this.current.severity}` : '';
  }
  public getIcon(severity: string): string {
  switch (severity) {
    case 'success':
      return '/assets/icons/status-icon.svg';
    case 'warning':
      return '/assets/icons/warning.svg';
    case 'critical':
      return '/assets/icons/warning-red.svg';
    default:
      return '/assets/icons/red-warning.svg';
  }
}

  //#endregion
}
