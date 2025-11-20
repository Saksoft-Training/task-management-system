import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/user-account-management/services/auth-service';

import { NotificationService } from '../../../features/dashboard/services/notification-service';

import { AppNotification } from '../../../../types/models/notifications';
import { Observable } from 'rxjs';
import { DashboardNotificationsComponent } from '../../../features/dashboard/components/notifications/dashboard-notifications/dashboard-notifications.component';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardNotificationsComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  //#region Component Properties
  /**
   * @summary Controls the visibility state of the notifications dropdown panel
   * @description When true, the notifications panel is displayed; when false, it is hidden
   */
  public showNotifications = false;
  /**
 * @summary Count of unread notifications for badge display
 * @description Used to show a numeric badge on the notification bell icon
 */
  public unreadCount = 0;

  /**
   * @summary Observable stream of notifications from the notification service
   * @description Provides reactive updates whenever notifications change in the system
   */
  public notifications$!: Observable<AppNotification[]>;
  /**
   * @summary Stores the currently logged-in user for header display.
   */
  public user: any = null;
  /**
   * @summary Navigation links shown in the header.
   */
  public navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Projects', path: '/projects' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Board', path: '/board' },

  ];
  //#endregion
  //#region Constructor
  /**
   * @summary Injects services for authentication & navigation.
   * @param authService Provides current user observable and auth state.
   * @param router Manages application routing.
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService

  ) {
    //#region UI Helpers
    const user = this.authService.getCurrentUser();
    //this.userEmail = user?.email || null;
    this.notifications$ = this.notificationService.notifications$;
    this.notifications$.subscribe(notifications => {
    });
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  //#endregion

  //#region Lifecycle Hook
  /**
   * @summary Subscribes to user observable and loads initial user.
   * @returns void
   */
  public ngOnInit(): void {
    this.authService.currentUser$.subscribe(current => {
      this.user = current;
    });
    this.user = this.authService.getCurrentUser();
  }
  //#endregion


  //#endregion
  //#region Methods
  /**
   * @summary Determines whether to show a minimal header (login/register pages).
   * @returns boolean
   */
  public isAuthMinimal(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/register');
  }
  //#endregion

  //#region Navigation
  /**
   * @summary Navigates user to login page.
   * @returns void
   */
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
  //#endregion

  //#region Event Handlers
  /**
  * @summary Marks a specific notification as read
  * @param notificationId - The unique identifier of the notification to mark as read
  * @returns void
  */
  onMarkAsRead(notificationId: string) {
    // Call your notification service to mark as read
    this.notificationService.markAsRead(notificationId);
  }
  /**
   * @summary Marks all notifications as read
   * @returns void
   */
  /**
  * @summary Toggles the notifications panel visibility
  * @returns void
  */
  public toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.notifications$.subscribe(notifications => {
    }).unsubscribe();
  }
  /**
    * @summary Marks all notifications as read
    * @returns void
    */
  public onMarkAllRead(): void {
    this.notificationService.markAllAsRead(); // This method exists in your service
  }
  /**
    * @summary Clears all notifications from the system
    * @returns void
    */
  public onClearAll(): void {
    this.notificationService.clearAll(); // Use clearAll() instead of clearAllNotifications()
  }
  //#endregion

}
