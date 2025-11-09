import { Routes } from '@angular/router';

import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component/dashboard.component';

export const routes: Routes = [
 {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
