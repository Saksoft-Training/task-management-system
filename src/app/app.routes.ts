import { Routes } from '@angular/router';
import { RegisterComponent } from './features/components/register-component/register-component';
import { LoginComponent } from './features/components/login-component/login-component';
import { DashboardComponent } from './features/components/dashboard-component/dashboard-component';

<<<<<<< HEAD
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
=======
export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
];
>>>>>>> origin/KAN-4-user-account-management
