import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../user-account-management/services/auth-service';
import { HeaderComponent } from '../../../shared/components/header-component/header-component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.scss']
})
export class DashboardComponent implements OnInit {
  user: any;
  constructor(private auth: AuthService) { }
  ngOnInit() {
    this.user = this.auth.getCurrentUser();
  }
}
