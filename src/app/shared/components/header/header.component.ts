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
    { label: 'Board', path: '/board' }
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
    private router: Router
  ) { }
  //#endregion

  //#region Lifecycle
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

  //#region UI Helpers
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
}
