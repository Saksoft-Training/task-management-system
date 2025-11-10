import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component/dashboard.component';
import { RegisterComponent } from './features/user-account-management/components/register-component/register-component';
import { LoginComponent } from './features/user-account-management/components/login-component/login-component';

export const routes: Routes = [
 {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  
];