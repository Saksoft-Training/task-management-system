import { Routes } from '@angular/router';
import { RegisterComponent } from './features/user-account-management/components/register/register.component';
import { DashboardChartsComponent } from './features/dashboard/components/dashboard-charts.component/dashboard-charts.component';
export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
   {path:'dashboard',component:DashboardChartsComponent},
];