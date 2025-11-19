import { Routes } from '@angular/router';

import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { LoginComponent } from './features/user-account-management/components/login/login.component';
import { ForgotPasswordComponent } from './features/user-account-management/components/forgot-password/forgot-password.component';
import { ProfileComponent } from './features/project-management/components/profile/profile.component';
import { ProjectListComponent } from './features/project-management/components/project-list/project-list.component';

import { ToastNotificationComponent } from './features/dashboard/components/notifications/toast-notification/toast-notification.component';
import { NotificationItemComponent } from './features/dashboard/components/notifications/notification-item/notification-item.component';
import { NotificationBellComponent } from './features/dashboard/components/notifications/notification-bell/notification-bell.component';
import { NotificationDropdownComponent } from './features/dashboard/components/notifications/notification-dropdown/notification-dropdown.component';
import { DashboardNotificationsComponent } from './features/dashboard/components/notifications/dashboard-notifications/dashboard-notifications.component';
export const routes: Routes = [

     { path: '', redirectTo: 'register', pathMatch: 'full' },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'projects/create', component: ProjectCreateComponent },

  { path: 'login', component: LoginComponent },

  { path: 'projects/create/:id', component: ProjectCreateComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'projects', component: ProjectListComponent }

];
