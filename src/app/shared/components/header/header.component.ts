import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/user-account-management/services/auth-service';
import { NotificationService } from '../../../features/dashboard/services/notification-service';
import { AppNotification } from '../../../../types/models/notifications';
import { Observable } from 'rxjs';
import { DashboardNotificationsComponent } from '../../../features/dashboard/components/notifications/dashboard-notifications/dashboard-notifications.component';
import { NotificationBellComponent } from '../../../features/dashboard/components/notifications/notification-bell/notification-bell.component';
import { NotificationDropdownComponent } from '../../../features/dashboard/components/notifications/notification-dropdown/notification-dropdown.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { User } from '../../../../types/models/user';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardNotificationsComponent, ConfirmationDialogComponent],
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
 
  //#region UI State
  /**
   * @summary Controls visibility of the logout confirmation dialog.
   * When true → dialog is shown. When false → dialog is hidden.
   *
   */
  public showLogoutDialog: boolean = false;
  //#endregion
 
  /**
   * @summary Logged-in user's email displayed in the header.
   */
  public user: User | null = null;
  public userEmail: string | null = null;
 
  /**
   * @summary Navigation menu items shown in the header.
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
   * @summary Injects required services.
   * @param authService Provides logged-in user information.
   * @param router Helps determine current route for UI logic.
   */
  public constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }
  //#endregion
  //#region Lifecycle Hook
  /**
   * @summary Loads the logged-in user's email on component initialization.
   * @returns void
   */
  public ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.userEmail = user?.email || null;
    });
    this.notifications$ = this.notificationService.notifications$;
    this.notifications$.subscribe(notifications => {
    });
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }
  //#endregion
  //#region Methods
  /**
   * @summary Determines whether to show minimal header
   * @returns boolean True if on login or registration page.
   */
  public isAuthMinimal(): boolean {
    const url = this.router.url;
    return (
      url.includes('/login') ||
      url.includes('/register')
    );
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
 
  //#region Logout Dialog Actions
 
  /**
   * @summary Opens the logout confirmation dialog.
   * @returns {void}
   */
  public openLogoutDialog(): void {
    this.showLogoutDialog = true;
  }
 
  /**
   * @summary Confirms logout action and triggers AuthService logout.
   * @returns {void}
   */
  public confirmLogout(): void {
    this.showLogoutDialog = false;
    this.authService.logout();
  }
 
  /**
   * @summary Cancels the logout dialog and closes it.
   * @returns {void}
   */
  public cancelLogout(): void {
    this.showLogoutDialog = false;
  }
 
  //#endregion
 
  //#region Navigation
 
  /**
   * @summary Navigates the user to the login page.
   * @returns {void}
   */
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
  //#endregion
}