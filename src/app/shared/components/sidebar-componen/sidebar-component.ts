import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-component',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.scss',
})
export class SidebarComponent {
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // You can later make this dynamic (based on user roles)
  menuItems = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Projects', icon: '📁', route: '/projects' },
    { label: 'Tasks', icon: '✅', route: '/tasks' },
    { label: 'Profile', icon: '👤', route: '/profile' },
    { label: 'Settings', icon: '⚙️', route: '/settings' }
  ];
}
