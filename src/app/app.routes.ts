import { Routes } from '@angular/router';
import { ToastNotificationComponent } from './features/dashboard/components/notifications/toast-notification.component/toast-notification.component';
import { NotificationItemComponent } from './features/dashboard/components/notifications/notification-item.component/notification-item.component';
import { NotificationBellComponent } from './features/dashboard/components/notifications/notification-bell.component/notification-bell.component';
import { NotificationDropdownComponent } from './features/dashboard/components/notifications/notification-dropdown.component/notification-dropdown.component';
export const routes: Routes = [
  
{
    path:'toast',component:ToastNotificationComponent,
},{
    path:'item',component:NotificationItemComponent,
},{
    path:'bell',component:NotificationBellComponent,
},{
    path:'dash',component:NotificationDropdownComponent,
}
];
