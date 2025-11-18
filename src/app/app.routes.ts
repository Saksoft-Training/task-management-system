import { Routes } from '@angular/router';

import { ProjectCreateComponent } from './features/project-management/components/project-create/project-create.component';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { LoginComponent } from './features/user-account-management/components/login/login.component';

import { ToastNotificationComponent } from './features/dashboard/components/notifications/toast-notification.component/toast-notification.component';
import { NotificationItemComponent } from './features/dashboard/components/notifications/notification-item.component/notification-item.component';
import { NotificationBellComponent } from './features/dashboard/components/notifications/notification-bell.component/notification-bell.component';
import { NotificationDropdownComponent } from './features/dashboard/components/notifications/notification-dropdown.component/notification-dropdown.component';
import { DashboardNotificationsComponent } from './features/dashboard/components/notifications/dashboard-notifications.component/dashboard-notifications.component';
export const routes: Routes = [
     { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'projects/create', component: ProjectCreateComponent },
  { path: 'login', component: LoginComponent },
// {
//     path:'notifications',component:NotificationBellComponent,
// },
// {
//     path:'dashboard',component:DashboardNotificationsComponent
// },
// {
//     path:'notificationitem',component:NotificationItemComponent
// },{
//     path:'toastnotification',component:ToastNotificationComponent
// },
// {
//     path:'notificationdropdown',component:NotificationDropdownComponent
// },
// {
//     path:'ds',component:DashboardNotificationsComponent
// }
];
