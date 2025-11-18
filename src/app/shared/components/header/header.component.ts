import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/user-account-management/services/auth-service';
import { NotificationService } from '../../../features/dashboard/services/notification-service';

import { AppNotification } from '../../../../types/models/notifications';
import { Observable } from 'rxjs';
import { DashboardNotificationsComponent } from '../../../features/dashboard/components/notifications/dashboard-notifications.component/dashboard-notifications.component';
import { NotificationBellComponent } from '../../../features/dashboard/components/notifications/notification-bell.component/notification-bell.component';
import { NotificationDropdownComponent } from '../../../features/dashboard/components/notifications/notification-dropdown.component/notification-dropdown.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule,DashboardNotificationsComponent,NotificationBellComponent,NotificationDropdownComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
   showNotifications = false;
   unreadCount = 0;
   notifications$!: Observable<AppNotification[]>; 
  /**
   * @summary Logged-in user's email displayed in the header.
   */
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
  ) {}
  //#endregion
  //#region Lifecycle Hook
  /**
   * @summary Loads the logged-in user's email on component initialization.
   * @returns void
   */
  public ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || null;
     this.notifications$ = this.notificationService.notifications$;
this.notifications$.subscribe(notifications => {
      console.log('📋 Notifications loaded:', notifications?.length, 'items');
      console.log('📋 Notifications:', notifications);
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

 
   onMarkAsRead(notificationId: string) {
    // Call your notification service to mark as read
    this.notificationService.markAsRead(notificationId);
  }

    toggleNotifications() {
    console.log('🔔 Bell clicked! Current state:', this.showNotifications);
    this.showNotifications = !this.showNotifications;
    console.log('🔔 New state:', this.showNotifications);
    
    // Debug: Check notifications data
    this.notifications$.subscribe(notifications => {
      console.log('📋 Notifications data:', notifications);
      console.log('📋 Notifications count:', notifications?.length);
    }).unsubscribe();
  }
  
}
