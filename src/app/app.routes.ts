import { Routes } from '@angular/router';
import { RegisterComponent } from './features/components/register-component/register-component';
import { LoginComponent } from './features/components/login-component/login-component';
import { DashboardComponent } from './features/components/dashboard-component/dashboard-component';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
];