import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/user-account-management/services/auth-service';
import { NotificationService } from '../../../features/dashboard/services/notification-service';
import { AppNotification } from '../../../../types/models/notifications';
import { map, Observable } from 'rxjs';
import { NotificationDropdownComponent } from '../../../features/dashboard/components/notifications/notification-dropdown/notification-dropdown.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { User } from '../../../../types/models/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationDropdownComponent, ConfirmationDialogComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  //#region Component Properties
  /** Controls visibility state of notification dropdown */
  public showNotifications = false;
  /** Unread notification count for badge */
  public unreadCount = 0;
  /** Observable notification stream */
  public notifications$!: Observable<AppNotification[]>;
  //#region UI State
  /** Controls visibility of logout confirmation dialog */
  public showLogoutDialog: boolean = false;
  //#endregion
  /** Logged-in user */
  public user: User | null = null;
  /** Observable email of logged-in user */
  public userEmail$!: Observable<string | null>;
  /** Navigation links in header */
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
   * @param authService Provides current user observable
   * @param router Helps determine current route
   * @param notificationService Notification management service
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }
  //#endregion

  //#region Lifecycle Hook
  /**
   * @summary Loads user email and initializes notifications on component init.
   */
  public ngOnInit(): void {
    this.userEmail$ = this.authService.currentUser$.pipe(
      map(user => user?.email ?? null)
    );
    this.notifications$ = this.notificationService.notifications$;
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }
  //#endregion

  //#region UI Utility Methods
  /**
   * @summary Checks if current route is login/register for minimal header.
   * @returns boolean
   */
  public isAuthMinimal(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/register');
  }
  //#endregion

  //#region Notification Actions
  public onNavigateNotification(notification: any) {
    console.log('Navigate to:', notification);
    this.showNotifications = false;
  }
  /**
   * @summary Mark specific notification as read.
   */
  public onMarkAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }
  /**
   * @summary Toggles notification dropdown visibility.
   */
  public toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.notifications$.subscribe().unsubscribe();
  }
  /**
   * @summary Marks all notifications as read.
   */
  public onMarkAllRead(): void {
    this.notificationService.markAllAsRead();
  }
  /**
   * @summary Clears all notifications.
   */
  public onClearAll(): void {
    this.notificationService.clearAll();
  }
  /**
   * @summary Dismiss a notification permanently.
   */
  public onDismissNotification(notificationId: string): void {
    console.log('Removing notification:', notificationId);
    this.notificationService.dismiss(notificationId);
  }
  //#endregion

  //#region Logout Dialog Actions
  /**
   * @summary Opens logout confirmation dialog.
   */
  public openLogoutDialog(): void {
    this.showLogoutDialog = true;
  }
  /**
   * @summary Confirms logout and triggers AuthService logout.
   */
  public confirmLogout(): void {
    this.showLogoutDialog = false;
    this.authService.logout();
  }
  /**
   * @summary Cancels logout dialog.
   */
  public cancelLogout(): void {
    this.showLogoutDialog = false;
  }
  //#endregion

  //#region Navigation
  /**
   * @summary Navigates to login page.
   */
  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
  /**
   * @summary Navigates to profile page.
   */
  public goToProfile(): void {
    this.router.navigate(['/profile']);
  }
  //#endregion
}
