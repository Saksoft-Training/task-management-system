import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/user-account-management/services/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-component.html',
  styleUrls: ['./header-component.scss']
})
export class HeaderComponent implements OnInit {

  //#region Properties
  /** Stores logged-in user's email for display */
  userEmail: string | null = null;

  /** Controls visibility of logout dialog */
  showLogoutDialog = false;
  //#endregion

  //#region Constructor
  /**
   * Creates an instance of HeaderComponent.
   * @param authService AuthService used to retrieve logged-in user details
   */
  constructor(private authService: AuthService) {}
  //#endregion

  //#region Lifecycle Methods
  /**
   * Initializes component by loading current user details
   * @returns void
   */
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || null;
  }
  //#endregion
}
