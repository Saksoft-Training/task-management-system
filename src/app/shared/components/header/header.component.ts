import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/user-account-management/services/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  //#region Properties
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
     { label: '', path: '/notifications', isIcon: true, icon: '/assets/icons/Bell-Icon.svg' }
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
    private router: Router
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
}
