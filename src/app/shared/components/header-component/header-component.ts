import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/user-account-management/services/auth-service';
import { NotificationBellComponent } from '../../../features/dashboard/components/Notification/notification-bell-component/notification-bell-component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  templateUrl: './header-component.html',
  styleUrls: ['./header-component.scss']
})
export class HeaderComponent implements OnInit {
  user: any = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
