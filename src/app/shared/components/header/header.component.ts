import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  /** Logged-in user's email shown in header */
  public userEmail: string | null = null;
  /** Navigation menu items displayed in header */
  public navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Projects', path: '/projects' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Board', path: '/board' }
  ];
  //#endregion

  //#region Constructor
  /**
   * @summary Injects AuthService to get logged-in user details.
   * @param authService Used to fetch current user information
   */
  constructor(private authService: AuthService) {}
  //#endregion

  //#region Lifecycle Hook
  /**
   * @summary Loads logged-in user's email on component initialization.
   * @returns void
   */
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || null;
  }
  //#endregion
}
